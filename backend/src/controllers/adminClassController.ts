import { Context } from 'hono';
import { AdminClassRepository } from '../repositories/adminClassRepository';
import { AdminClassService } from '../services/adminClassService';
import { EventRepository } from '../repositories/eventRepository';
import { UserRepository } from '../repositories/userRepository';
import { EventService } from '../services/eventService';
import {
  AdminClassDTOConverter,
  ActiveClassDTOConverter,
} from '../dtos/adminClassDto';
import {
  ApiResponse,
  AdminClassRequestDTO,
  ActiveClassDTO,
  ApproveClassRequestPayload,
  ApproveClassRequestResponse,
} from '@shared/types';
import {
  AdminClassPaginationQuery,
  AdminActiveClassesPaginationQuery,
  ClassRequestIdParam,
  ClassIdParam,
} from '@shared/schemas/classSchema';

export class AdminClassController {
  /**
   * GET /api/admin/pedidos-turma
   * Lista solicitações de turma pendentes com paginação (5 itens por página) em ordem FIFO.
   */
  static async listPending(c: Context) {
    const supabase = c.get('supabase');
    const query = (c.get('validQuery') as AdminClassPaginationQuery) || { page: 1 };

    const repo = new AdminClassRepository(supabase);
    const service = new AdminClassService(repo);

    const { requests, pagination } = await service.listPending(query.page);
    const dtos = AdminClassDTOConverter.toAdminRequestDTOList(requests);

    const response: ApiResponse<AdminClassRequestDTO[]> = {
      success: true,
      data: dtos,
      meta: {
        pagination,
      },
    };

    return c.json(response, 200);
  }

  /**
   * POST /api/admin/pedidos-turma/:id/aprovar
   * Efetiva a criação da turma via procedure aprovar_pedido_turma, gerando código de convite e promovendo aluno a LÍDER.
   */
  static async approveRequest(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as ClassRequestIdParam;
    const body = (c.get('validBody') as ApproveClassRequestPayload) || {};

    const repo = new AdminClassRepository(supabase);
    const service = new AdminClassService(repo);

    const approved = await service.approveRequest(id, body);

    const response: ApiResponse<ApproveClassRequestResponse> = {
      success: true,
      data: approved,
    };

    return c.json(response, 200);
  }

  /**
   * DELETE /api/admin/pedidos-turma/:id
   * Rejeita a solicitação de turma removendo o registro do banco.
   */
  static async rejectRequest(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as ClassRequestIdParam;

    const repo = new AdminClassRepository(supabase);
    const service = new AdminClassService(repo);

    await service.rejectRequest(id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Solicitação de turma rejeitada com sucesso.',
      },
    };

    return c.json(response, 200);
  }

  /**
   * GET /api/admin/turmas
   * Lista turmas ativas com paginação e contagem de membros vinculados.
   */
  static async listActiveClasses(c: Context) {
    const supabase = c.get('supabase');
    const query =
      (c.get('validQuery') as AdminActiveClassesPaginationQuery) || { page: 1, limit: 5 };

    const repo = new AdminClassRepository(supabase);
    const service = new AdminClassService(repo);

    const { classes, pagination } = await service.listActiveClasses(query.page, query.limit);
    const dtos = ActiveClassDTOConverter.toDTOList(classes);

    const response: ApiResponse<ActiveClassDTO[]> = {
      success: true,
      data: dtos,
      meta: {
        pagination,
      },
    };

    return c.json(response, 200);
  }

  /**
   * GET /api/admin/turmas/:id
   * Obtém detalhes cadastrais e contagem de membros de uma turma ativa.
   */
  static async getClassDetails(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as ClassIdParam;

    const repo = new AdminClassRepository(supabase);
    const service = new AdminClassService(repo);

    const rawClass = await service.getClassById(id);
    const dto = ActiveClassDTOConverter.toDTO(rawClass);

    const response: ApiResponse<ActiveClassDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }

  /**
   * DELETE /api/admin/turmas/:id
   * Exclui/destrói uma turma ativa via procedure RPC 'excluir_turma'.
   */
  static async deleteClass(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as ClassIdParam;

    const repo = new AdminClassRepository(supabase);
    const service = new AdminClassService(repo);

    await service.deleteClass(id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Turma destruída com sucesso.',
      },
    };

    return c.json(response, 200);
  }

  /**
   * POST /api/admin/manutencao/expurgar-anexos
   * Executa a rotina de auto-expurgo de anexos físicos de atividades que expiraram há mais de 7 dias.
   */
  static async expurgateAttachments(c: Context) {
    const supabase = c.get('supabase');

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

    const result = await service.expurgateOldAttachments();

    const response: ApiResponse<{ message: string; expurgatedCount: number }> = {
      success: true,
      data: {
        message: `Expurgo de anexos antigos executado com sucesso. ${result.expurgatedCount} arquivo(s) removido(s).`,
        expurgatedCount: result.expurgatedCount,
      },
    };

    return c.json(response, 200);
  }
}


