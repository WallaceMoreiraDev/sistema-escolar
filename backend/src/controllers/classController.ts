import { Context } from 'hono';
import { ClassRepository } from '../repositories/classRepository';
import { UserRepository } from '../repositories/userRepository';
import { ClassService } from '../services/classService';
import { ClassDTOConverter } from '../dtos/classDto';
import {
  ApiResponse,
  ClassRequestDTO,
  ClassMemberDTO,
  CreateClassRequestPayload,
  JoinClassPayload,
  JoinClassResponse,
} from '@shared/types';
import {
  ClassMembersPaginationQuery,
  ClassMemberIdParam,
} from '@shared/schemas/classSchema';

export class ClassController {
  /**
   * POST /api/turmas/pedidos
   * Envia uma nova solicitação de criação de turma.
   */
  static async createRequest(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const body = c.get('validBody') as CreateClassRequestPayload;

    const classRepo = new ClassRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new ClassService(classRepo, userRepo);

    const created = await service.createRequest(user.id, body);
    const dto = ClassDTOConverter.toRequestDTO(created);

    const response: ApiResponse<ClassRequestDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 201);
  }

  /**
   * GET /api/turmas/pedidos/meu
   * Retorna a solicitação pendente do aluno autenticado (ou null se não houver).
   */
  static async getMyPendingRequest(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');

    const classRepo = new ClassRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new ClassService(classRepo, userRepo);

    const pending = await service.getMyPendingRequest(user.id);
    const dto = pending ? ClassDTOConverter.toRequestDTO(pending) : null;

    const response: ApiResponse<ClassRequestDTO | null> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }

  /**
   * DELETE /api/turmas/pedidos/meu
   * Cancela a solicitação pendente ativa do aluno autenticado.
   */
  static async cancelMyPendingRequest(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');

    const classRepo = new ClassRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new ClassService(classRepo, userRepo);

    await service.cancelMyPendingRequest(user.id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Solicitação de turma cancelada com sucesso.',
      },
    };

    return c.json(response, 200);
  }

  /**
   * POST /api/turmas/entrar
   * Permite que o aluno ingresse em uma turma existente através do código de convite.
   */
  static async joinByCode(c: Context) {
    const supabase = c.get('supabase');
    const body = c.get('validBody') as JoinClassPayload;

    const classRepo = new ClassRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new ClassService(classRepo, userRepo);

    const result = await service.joinClassByCode(body.codigoConvite);

    const response: ApiResponse<JoinClassResponse> = {
      success: true,
      data: result,
    };

    return c.json(response, 200);
  }

  /**
   * GET /api/turmas/membros
   * Lista os membros da turma do aluno autenticado (paginado com 5 itens/página).
   */
  static async listMembers(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const query = (c.get('validQuery') as ClassMembersPaginationQuery) || { page: 1 };

    const classRepo = new ClassRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new ClassService(classRepo, userRepo);

    const { members, pagination } = await service.listMembers(user.id, query.page);
    const dtos = ClassDTOConverter.toMemberDTOList(members);

    const response: ApiResponse<ClassMemberDTO[]> = {
      success: true,
      data: dtos,
      meta: {
        pagination,
      },
    };

    return c.json(response, 200);
  }

  /**
   * PATCH /api/turmas/membros/:id/promover
   * Promove um membro da turma ao cargo de Líder.
   */
  static async promoteMember(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as ClassMemberIdParam;

    const classRepo = new ClassRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new ClassService(classRepo, userRepo);

    await service.promoteMember(id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Membro promovido a líder com sucesso.',
      },
    };

    return c.json(response, 200);
  }

  /**
   * PATCH /api/turmas/membros/:id/rebaixar
   * Rebaixa um líder da turma para o cargo de Aluno.
   */
  static async demoteMember(c: Context) {
    const supabase = c.get('supabase');
    const caller = c.get('user');
    const { id } = c.get('validParams') as ClassMemberIdParam;

    const classRepo = new ClassRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new ClassService(classRepo, userRepo);

    await service.demoteMember(caller.id, id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Líder rebaixado para aluno com sucesso.',
      },
    };

    return c.json(response, 200);
  }

  /**
   * DELETE /api/turmas/membros/:id
   * Expulsa/remove um aluno da turma.
   */
  static async expelMember(c: Context) {
    const supabase = c.get('supabase');
    const caller = c.get('user');
    const { id } = c.get('validParams') as ClassMemberIdParam;

    const classRepo = new ClassRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new ClassService(classRepo, userRepo);

    await service.expelMember(caller.id, id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Aluno removido da turma com sucesso.',
      },
    };

    return c.json(response, 200);
  }
}
