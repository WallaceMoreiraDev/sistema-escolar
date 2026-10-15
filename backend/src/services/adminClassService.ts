import { AdminClassRepository } from '../repositories/adminClassRepository';
import { RawAdminPedidoTurma } from '../dtos/adminClassDto';
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
}
