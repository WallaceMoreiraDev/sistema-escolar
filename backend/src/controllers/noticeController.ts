import { Context } from 'hono';
import { NoticeRepository } from '../repositories/noticeRepository';
import { NoticeService } from '../services/noticeService';
import { NoticeDTOConverter } from '../dtos/noticeDto';
import { ModerationService } from '../services/moderationService';
import { validateEnv } from '../env';
import { AppError } from '../utils/AppError';
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

    const env = validateEnv(c.env);
    const moderation = new ModerationService(env.GEMINI_API_KEY);
    const repo = new NoticeRepository(supabase);
    const service = new NoticeService(repo, moderation);

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

    const env = validateEnv(c.env);
    const moderation = new ModerationService(env.GEMINI_API_KEY);
    const repo = new NoticeRepository(supabase);
    const service = new NoticeService(repo, moderation);

    const updated = await service.updateNotice(id, body);
    const dto = NoticeDTOConverter.toDTO(updated);

    const response: ApiResponse<NoticeDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }

  /**
   * POST /api/avisos/:id/imagem
   * Upload de imagem de destaque do aviso (apenas ADMIN).
   */
  static async uploadImage(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as NoticeIdParam;

    // 1. Checagem prévia do Content-Length antes de ler o corpo na memória
    const contentLength = Number(c.req.header('content-length'));
    if (contentLength && contentLength > 5 * 1024 * 1024 + 20480) { // 5 MB + margem multipart
      throw new AppError('VALIDATION_ERROR', 400, 'O payload excede o limite máximo permitido de 5 MB.');
    }

    const formData = await c.req.formData();
    const file = formData.get('file') || formData.get('imagem');

    if (!file || typeof file === 'string' || !(file instanceof File)) {
      throw new AppError(
        'VALIDATION_ERROR',
        400,
        'Nenhum arquivo válido enviado. Utilize o campo "file" ou "imagem" em multipart/form-data.'
      );
    }

    // 2. Validação defensiva de extensão contra MIME type
    const allowedExtensions: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    };
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions[file.type] || !allowedExtensions[file.type].includes(ext)) {
      throw new AppError('VALIDATION_ERROR', 400, 'Extensão de imagem incompatível com o tipo de conteúdo.');
    }

    const repo = new NoticeRepository(supabase);
    const service = new NoticeService(repo);

    const arrayBuffer = await file.arrayBuffer();
    const updated = await service.uploadNoticeImage(id, {
      name: file.name,
      size: file.size,
      type: file.type,
      data: arrayBuffer,
    });

    const dto = NoticeDTOConverter.toDTO(updated);

    const response: ApiResponse<NoticeDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }

  /**
   * DELETE /api/avisos/:id/imagem
   * Remoção da imagem de destaque do aviso (apenas ADMIN).
   */
  static async removeImage(c: Context) {
    const supabase = c.get('supabase');
    const { id } = c.get('validParams') as NoticeIdParam;

    const repo = new NoticeRepository(supabase);
    const service = new NoticeService(repo);

    const updated = await service.removeNoticeImage(id);
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
