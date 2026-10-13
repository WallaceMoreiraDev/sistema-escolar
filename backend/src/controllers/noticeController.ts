import { Context } from 'hono';
import { NoticeRepository } from '../repositories/noticeRepository';
import { NoticeService } from '../services/noticeService';
import { NoticeDTOConverter } from '../dtos/noticeDto';
import {
  ApiResponse,
  NoticeDTO,
  CreateNoticePayload,
  UpdateNoticePayload,
} from '@shared/types';
import { NoticeIdParam, NoticePaginationQuery } from '@shared/schemas/noticeSchema';

export class NoticeController {
  /**
   * GET /api/avisos
   * Lista avisos gerais paginados (5 por página).
   */
  static async list(c: Context) {
    const supabase = c.get('supabase');
    const query = (c.get('validQuery') as NoticePaginationQuery) || { page: 1 };

    const repo = new NoticeRepository(supabase);
    const service = new NoticeService(repo);

    const { notices, pagination } = await service.listNotices(query.page);
    const dtos = NoticeDTOConverter.toDTOList(notices);

    const response: ApiResponse<NoticeDTO[]> = {
      success: true,
      data: dtos,
      meta: {
        pagination,
      },
    };

    return c.json(response, 200);
  }

  /**
   * GET /api/avisos/:id
   * Obtém detalhes de um aviso específico.
   */
  static async getById(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as NoticeIdParam;

    const repo = new NoticeRepository(supabase);
    const service = new NoticeService(repo);

    const notice = await service.getNoticeById(id);
    const dto = NoticeDTOConverter.toDTO(notice);

    const response: ApiResponse<NoticeDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }

  /**
   * POST /api/avisos
   * Cria um novo aviso geral (apenas ADMIN).
   */
  static async create(c: Context) {
    const supabase = c.get('supabase');
    const body = c.get('validBody') as CreateNoticePayload;

    const repo = new NoticeRepository(supabase);
    const service = new NoticeService(repo);

    const created = await service.createNotice(body);
    const dto = NoticeDTOConverter.toDTO(created);

    const response: ApiResponse<NoticeDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 201);
  }

  /**
   * PUT /api/avisos/:id
   * Atualiza um aviso geral existente (apenas ADMIN).
   */
  static async update(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as NoticeIdParam;
    const body = c.get('validBody') as UpdateNoticePayload;

    const repo = new NoticeRepository(supabase);
    const service = new NoticeService(repo);

    const updated = await service.updateNotice(id, body);
    const dto = NoticeDTOConverter.toDTO(updated);

    const response: ApiResponse<NoticeDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }

  /**
   * DELETE /api/avisos/:id
   * Exclui um aviso geral (apenas ADMIN).
   */
  static async delete(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as NoticeIdParam;

    const repo = new NoticeRepository(supabase);
    const service = new NoticeService(repo);

    await service.deleteNotice(id);

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id },
    };

    return c.json(response, 200);
  }
}
