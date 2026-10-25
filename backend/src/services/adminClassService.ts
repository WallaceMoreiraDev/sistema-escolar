import { AdminClassRepository } from '../repositories/adminClassRepository';
import { RawAdminPedidoTurma, RawActiveClass } from '../dtos/adminClassDto';
import {
  ApproveClassRequestPayload,
  ApproveClassRequestResponse,
} from '@shared/types/class.types';
import { PaginationMeta } from '@shared/types/api.types';
import { AppError } from '../utils/AppError';
import { generateInviteCode } from '../utils/codeGenerator';

export interface PaginatedAdminClassRequestsResponse {
  requests: RawAdminPedidoTurma[];
  pagination: PaginationMeta;
}

export class AdminClassService {
  private static readonly PAGE_LIMIT = 5;

  constructor(private readonly repo: AdminClassRepository) {}

  /**
   * Lista solicitações pendentes de turmas com paginação direta no banco (5 itens por página).
   * Ordenação FIFO (created_at ASC) para priorizar pedidos mais antigos.
   */
  async listPending(page: number): Promise<PaginatedAdminClassRequestsResponse> {
    const limit = AdminClassService.PAGE_LIMIT;
    const safePage = page > 0 ? page : 1;

    const { requests, total } = await this.repo.listPendingPaginated(safePage, limit);
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    return {
      requests,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Efetiva a aprovação de uma solicitação de turma:
   * 1. Valida se o pedido existe e está pendente.
   * 2. Define o nome oficial da turma (usa o fornecido ou compõe o padrão "${ano} ${curso} - ${turno}").
   * 3. Define o código de convite (valida o fornecido ou gera automaticamente um código único de 6 caracteres).
   * 4. Executa a procedure PostgreSQL transacional 'aprovar_pedido_turma'.
   */
  async approveRequest(
    id: string,
    payload: ApproveClassRequestPayload
  ): Promise<ApproveClassRequestResponse> {
    const pedido = await this.repo.findPendingById(id);

    if (!pedido) {
      throw new AppError(
        'NOT_FOUND',
        404,
        'Pedido de turma não encontrado ou já processado.'
      );
    }

    // Composição do Nome Oficial da Turma
    let officialName: string;
    if (payload.nomeOficial && payload.nomeOficial.trim().length > 0) {
      officialName = payload.nomeOficial.trim();
    } else {
      officialName = `${pedido.ano} ${pedido.curso} - ${pedido.turno}`;
    }

    // Definição e Validação do Código de Convite
    let finalInviteCode: string;

    if (payload.codigoConvite && payload.codigoConvite.trim().length > 0) {
      const formattedCode = payload.codigoConvite.trim().toUpperCase();
      const codeExists = await this.repo.checkInviteCodeExists(formattedCode);
      if (codeExists) {
        throw new AppError(
          'INVITE_CODE_ALREADY_EXISTS',
          409,
          'O código de convite informado já está em uso por outra turma.'
        );
      }
      finalInviteCode = formattedCode;
    } else {
      // Geração automática com retentativas para garantir unicidade
      let generatedCode = '';
      const MAX_ATTEMPTS = 5;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const candidate = generateInviteCode(6);
        const exists = await this.repo.checkInviteCodeExists(candidate);
        if (!exists) {
          generatedCode = candidate;
          break;
        }
      }

      if (!generatedCode) {
        throw new AppError(
          'INTERNAL_SERVER_ERROR',
          500,
          'Falha ao gerar um código de convite único. Tente novamente.'
        );
      }

      finalInviteCode = generatedCode;
    }

    // Invocação da Procedure Transacional no Postgres
    try {
      const turmaId = await this.repo.approveViaRpc(id, officialName, finalInviteCode);

      return {
        turmaId,
        nomeOficial: officialName,
        codigoConvite: finalInviteCode,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'APPROVAL_FAILED',
        500,
        'Erro ao processar a aprovação da turma no banco de dados.'
      );
    }
  }

  /**
   * Rejeita e exclui uma solicitação de turma pendente, liberando o aluno para novo pedido.
   */
  async rejectRequest(id: string): Promise<void> {
    const pedido = await this.repo.findPendingById(id);

    if (!pedido) {
      throw new AppError(
        'NOT_FOUND',
        404,
        'Pedido de turma não encontrado para rejeição.'
      );
    }

    const deleted = await this.repo.deleteById(id);

    if (!deleted) {
      throw new AppError(
        'NOT_FOUND',
        404,
        'Pedido de turma não encontrado para rejeição.'
      );
    }
  }

  /**
   * Lista turmas ativas com metadados de paginação direta no banco.
   */
  async listActiveClasses(
    page: number,
    limit: number = 5
  ): Promise<{ classes: RawActiveClass[]; pagination: PaginationMeta }> {
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 && limit <= 50 ? limit : 5;

    const { classes, total } = await this.repo.listActiveClasses(safePage, safeLimit);
    const totalPages = total > 0 ? Math.ceil(total / safeLimit) : 1;

    return {
      classes,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Exclui uma turma ativa através da procedure RPC 'excluir_turma'.
   * Trata erros lançados pela procedure (P0002 / CLASS_NOT_FOUND, 42501 / FORBIDDEN).
   */
  async deleteClass(classId: string): Promise<void> {
    try {
      await this.repo.deleteClass(classId);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      const dbErr = error as { code?: string; message?: string };
      const message = dbErr?.message || '';
      const code = dbErr?.code || '';

      if (code === 'P0002' || message.includes('CLASS_NOT_FOUND')) {
        throw new AppError('CLASS_NOT_FOUND', 404, 'Turma não encontrada.');
      }

      if (code === '42501' || message.includes('FORBIDDEN')) {
        throw new AppError(
          'AUTH_FORBIDDEN',
          403,
          'Apenas administradores gerais podem excluir turmas.'
        );
      }

      throw new AppError(
        'INTERNAL_SERVER_ERROR',
        500,
        'Erro ao processar a exclusão da turma no banco de dados.'
      );
    }
  }

  /**
   * Busca dados cadastrais e contagem de membros de uma turma ativa pelo ID.
   */
  async getClassById(classId: string): Promise<RawActiveClass> {
    const turma = await this.repo.getClassById(classId);

    if (!turma) {
      throw new AppError('CLASS_NOT_FOUND', 404, 'Turma não encontrada.');
    }

    return turma;
  }
}

