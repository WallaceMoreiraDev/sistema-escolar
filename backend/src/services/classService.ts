import { ClassRepository } from '../repositories/classRepository';
import { UserRepository } from '../repositories/userRepository';
import { RawPedidoTurma, RawClassMember } from '../dtos/classDto';
import { CreateClassRequestPayload, JoinClassResponse } from '@shared/types/class.types';
import { PaginationMeta } from '@shared/types/api.types';
import { AppError } from '../utils/AppError';

interface DatabaseErrorLike {
  code?: string;
  message?: string;
  details?: string;
}

export class ClassService {
  constructor(
    private readonly classRepo: ClassRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Cria uma nova solicitação de turma para o aluno.
   * Regras de negócio:
   * 1. Aluno não pode ter turma vinculada.
   * 2. Aluno não pode ter outro pedido pendente ativo (anti-spam).
   */
  async createRequest(
    userId: string,
    payload: CreateClassRequestPayload
  ): Promise<RawPedidoTurma> {
    // 1. Valida se o usuário já possui turma vinculada
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (userProfile?.turmas) {
      throw new AppError(
        'ALREADY_IN_CLASS',
        400,
        'Você já está vinculado a uma turma e não pode solicitar uma nova.'
      );
    }

    // 2. Valida se já existe solicitação pendente
    const existing = await this.classRepo.findPendingByUserId(userId);
    if (existing) {
      throw new AppError(
        'CLASS_REQUEST_DUPLICATE',
        409,
        'Você já possui uma solicitação de turma em andamento.'
      );
    }

    // 3. Persiste no banco com proteção adicional contra concorrência
    try {
      return await this.classRepo.createRequest({
        usuario_id: userId,
        ano: payload.ano,
        turno: payload.turno,
        curso: payload.curso,
        local_sala: payload.localSala || null,
        justificativa: payload.justificativa || null,
        status: 'pendente',
      });
    } catch (error: unknown) {
      const dbErr = error as DatabaseErrorLike;

      // Captura violação de unicidade (índice idx_unique_pedido_pendente)
      if (
        dbErr?.code === '23505' ||
        dbErr?.message?.includes('idx_unique_pedido_pendente') ||
        dbErr?.details?.includes('idx_unique_pedido_pendente')
      ) {
        throw new AppError(
          'CLASS_REQUEST_DUPLICATE',
          409,
          'Você já possui uma solicitação de turma em andamento.'
        );
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('INTERNAL_SERVER_ERROR', 500, 'Falha ao processar solicitação de turma.');
    }
  }

  /**
   * Consulta a solicitação pendente do aluno.
   * Retorna o registro ou null se não houver pedido em andamento.
   */
  async getMyPendingRequest(userId: string): Promise<RawPedidoTurma | null> {
    return await this.classRepo.findPendingByUserId(userId);
  }

  /**
   * Cancela a solicitação pendente ativa do aluno.
   */
  async cancelMyPendingRequest(userId: string): Promise<void> {
    const deleted = await this.classRepo.deletePendingByUserId(userId);

    if (!deleted) {
      throw new AppError(
        'NOT_FOUND',
        404,
        'Nenhuma solicitação pendente encontrada para cancelamento.'
      );
    }
  }

  /**
   * Ingressa o aluno em uma turma utilizando o código de convite.
   * Executa a procedure PostgreSQL transacional 'entrar_turma_por_codigo'
   * e traduz as exceções de banco para AppError amigáveis.
   */
  async joinClassByCode(codigoConvite: string): Promise<JoinClassResponse> {
    try {
      const result = await this.classRepo.joinClassByCode(codigoConvite);

      return {
        turmaId: result.turma_id,
        nomeOficial: result.nome_oficial,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      const dbErr = error as DatabaseErrorLike;
      const message = dbErr?.message || '';

      if (message.includes('TURMA_NOT_FOUND')) {
        throw new AppError(
          'NOT_FOUND',
          404,
          'Código de turma inválido ou inexistente.'
        );
      }

      if (
        message.includes('ALREADY_IN_THIS_TURMA') ||
        message.includes('ALREADY_IN_ANOTHER_TURMA')
      ) {
        throw new AppError(
          'ALREADY_IN_CLASS',
          400,
          'Você já está vinculado a uma turma.'
        );
      }

      if (message.includes('INVALID_CODE_FORMAT')) {
        throw new AppError(
          'VALIDATION_ERROR',
          400,
          'O código de convite deve possuir exatamente 6 caracteres.'
        );
      }

      if (message.includes('AUTH_UNAUTHORIZED')) {
        throw new AppError(
          'AUTH_UNAUTHORIZED',
          401,
          'Usuário não autenticado.'
        );
      }

      throw new AppError(
        'INTERNAL_SERVER_ERROR',
        500,
        'Falha ao ingressar na turma.'
      );
    }
  }

  /**
   * Lista membros da turma do usuário autenticado com paginação fixa de 5 itens.
   * Regra de negócio: Usuário precisa pertencer a uma turma (turma_id IS NOT NULL).
   */
  async listMembers(
    userId: string,
    page: number
  ): Promise<{ members: RawClassMember[]; pagination: PaginationMeta }> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile?.turmas) {
      throw new AppError(
        'BAD_REQUEST',
        400,
        'Você não está vinculado a nenhuma turma.'
      );
    }

    const turma = Array.isArray(userProfile.turmas)
      ? userProfile.turmas[0]
      : userProfile.turmas;

    const turmaId = turma.id;
    const limit = 5;
    const safePage = page > 0 ? page : 1;

    const { members, total } = await this.classRepo.listMembersPaginated(
      turmaId,
      safePage,
      limit
    );

    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    return {
      members,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Promove um aluno da turma a líder via procedure 'promover_membro_lider'.
   */
  async promoteMember(memberId: string): Promise<void> {
    try {
      await this.classRepo.promoteMemberToLeader(memberId);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      const dbErr = error as DatabaseErrorLike;
      const message = dbErr?.message || '';

      if (message.includes('USER_NOT_FOUND')) {
        throw new AppError(
          'NOT_FOUND',
          404,
          'Membro não encontrado ou não pertence a esta turma.'
        );
      }

      if (message.includes('USER_WITHOUT_CLASS')) {
        throw new AppError(
          'BAD_REQUEST',
          400,
          'O membro não pertence a nenhuma turma.'
        );
      }

      if (message.includes('ALREADY_LEADER')) {
        throw new AppError(
          'BAD_REQUEST',
          400,
          'O usuário já é um líder desta turma.'
        );
      }

      if (message.includes('CANNOT_ALTER_ADMIN')) {
        throw new AppError(
          'BAD_REQUEST',
          400,
          'Administradores gerais não podem ser alterados para líder de turma.'
        );
      }

      if (message.includes('FORBIDDEN')) {
        throw new AppError(
          'AUTH_FORBIDDEN',
          403,
          'Apenas líderes da turma ou administradores podem promover membros.'
        );
      }

      if (message.includes('AUTH_UNAUTHORIZED')) {
        throw new AppError(
          'AUTH_UNAUTHORIZED',
          401,
          'Usuário não autenticado.'
        );
      }

      throw new AppError(
        'INTERNAL_SERVER_ERROR',
        500,
        'Falha ao promover membro a líder.'
      );
    }
  }

  /**
   * Rebaixa um líder da turma para o cargo de aluno via procedure 'rebaixar_lider_membro'.
   * Regras:
   * 1. Bloqueio de auto-rebaixamento.
   * 2. Regra Anti-Orfandade (não rebaixar o único líder da turma).
   */
  async demoteMember(callerId: string, memberId: string): Promise<void> {
    if (callerId === memberId) {
      throw new AppError(
        'CANNOT_MODIFY_SELF',
        400,
        'Você não pode realizar esta ação consigo mesmo pelo painel de moderação.'
      );
    }

    try {
      await this.classRepo.demoteLeaderToMember(memberId);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      const dbErr = error as DatabaseErrorLike;
      const message = dbErr?.message || '';

      if (message.includes('LAST_LEADER_CANNOT_BE_DEMOTED')) {
        throw new AppError(
          'LAST_LEADER_CONFLICT',
          409,
          'A turma não pode ficar sem nenhum líder. Promova outro membro antes.'
        );
      }

      if (message.includes('CANNOT_DEMOTE_SELF')) {
        throw new AppError(
          'CANNOT_MODIFY_SELF',
          400,
          'Você não pode realizar esta ação consigo mesmo pelo painel de moderação.'
        );
      }

      if (message.includes('USER_NOT_FOUND')) {
        throw new AppError(
          'NOT_FOUND',
          404,
          'Membro não encontrado ou não pertence a esta turma.'
        );
      }

      if (message.includes('NOT_A_LEADER')) {
        throw new AppError(
          'BAD_REQUEST',
          400,
          'O usuário não possui o cargo de líder.'
        );
      }

      if (message.includes('FORBIDDEN')) {
        throw new AppError(
          'AUTH_FORBIDDEN',
          403,
          'Apenas líderes da turma ou administradores podem rebaixar líderes.'
        );
      }

      if (message.includes('AUTH_UNAUTHORIZED')) {
        throw new AppError(
          'AUTH_UNAUTHORIZED',
          401,
          'Usuário não autenticado.'
        );
      }

      throw new AppError(
        'INTERNAL_SERVER_ERROR',
        500,
        'Falha ao rebaixar líder para aluno.'
      );
    }
  }

  /**
   * Expulsa um aluno da turma via procedure 'expulsar_membro_turma'.
   * Regras:
   * 1. Bloqueio de auto-expulsão.
   * 2. Regra Anti-Orfandade (se for o último líder).
   */
  async expelMember(callerId: string, memberId: string): Promise<void> {
    if (callerId === memberId) {
      throw new AppError(
        'CANNOT_MODIFY_SELF',
        400,
        'Você não pode realizar esta ação consigo mesmo pelo painel de moderação.'
      );
    }

    try {
      await this.classRepo.expelMemberFromClass(memberId);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      const dbErr = error as DatabaseErrorLike;
      const message = dbErr?.message || '';

      if (message.includes('LAST_LEADER_CANNOT_BE_EXPELLED')) {
        throw new AppError(
          'LAST_LEADER_CONFLICT',
          409,
          'O último líder não pode ser expulso da turma. Promova outro membro a líder antes de desvinculá-lo.'
        );
      }

      if (message.includes('CANNOT_EXPEL_SELF')) {
        throw new AppError(
          'CANNOT_MODIFY_SELF',
          400,
          'Você não pode realizar esta ação consigo mesmo pelo painel de moderação.'
        );
      }

      if (message.includes('USER_NOT_FOUND')) {
        throw new AppError(
          'NOT_FOUND',
          404,
          'Membro não encontrado ou não pertence a esta turma.'
        );
      }

      if (message.includes('USER_ALREADY_WITHOUT_CLASS')) {
        throw new AppError(
          'BAD_REQUEST',
          400,
          'O usuário já não pertence a nenhuma turma.'
        );
      }

      if (message.includes('FORBIDDEN')) {
        throw new AppError(
          'AUTH_FORBIDDEN',
          403,
          'Apenas líderes da turma ou administradores podem expulsar membros.'
        );
      }

      if (message.includes('AUTH_UNAUTHORIZED')) {
        throw new AppError(
          'AUTH_UNAUTHORIZED',
          401,
          'Usuário não autenticado.'
        );
      }

      throw new AppError(
        'INTERNAL_SERVER_ERROR',
        500,
        'Falha ao expulsar membro da turma.'
      );
    }
  }

  /**
   * Desvincula o usuário autenticado voluntariamente de sua turma via procedure 'sair_da_turma'.
   * Trata a regra anti-orfandade e estado de vínculo prévio.
   */
  async leaveClass(): Promise<void> {
    try {
      await this.classRepo.leaveClass();
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      const dbErr = error as DatabaseErrorLike;
      const message = dbErr?.message || '';

      if (message.includes('LAST_LEADER_CANNOT_LEAVE')) {
        throw new AppError(
          'LAST_LEADER_CANNOT_LEAVE',
          400,
          'Você é o único líder da turma. Promova outro membro a líder antes de sair da turma.'
        );
      }

      if (message.includes('USER_ALREADY_WITHOUT_CLASS')) {
        throw new AppError(
          'USER_ALREADY_WITHOUT_CLASS',
          400,
          'Você já não pertence a nenhuma turma.'
        );
      }

      if (message.includes('AUTH_UNAUTHORIZED')) {
        throw new AppError(
          'AUTH_UNAUTHORIZED',
          401,
          'Usuário não autenticado.'
        );
      }

      if (message.includes('USER_NOT_FOUND')) {
        throw new AppError(
          'NOT_FOUND',
          404,
          'Usuário não encontrado.'
        );
      }

      throw new AppError(
        'INTERNAL_SERVER_ERROR',
        500,
        'Falha ao desvincular da turma.'
      );
    }
  }
}


