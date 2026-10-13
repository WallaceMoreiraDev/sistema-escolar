import { NoticeRepository } from '../repositories/noticeRepository';
import { RawNotice } from '../dtos/noticeDto';
import { CreateNoticePayload, UpdateNoticePayload } from '@shared/types/notice.types';
import { AppError } from '../utils/AppError';

export interface PaginatedNoticesResponse {
  notices: RawNotice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class NoticeService {
  private static readonly PAGE_LIMIT = 5;

  constructor(private readonly repo: NoticeRepository) {}

  /**
   * Lista avisos gerais com limite de 5 itens por página.
   */
  async listNotices(page: number): Promise<PaginatedNoticesResponse> {
    const limit = NoticeService.PAGE_LIMIT;
    const safePage = page > 0 ? page : 1;

    const { notices, total } = await this.repo.listPaginated(safePage, limit);
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    return {
      notices,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Busca um aviso pelo ID ou lança NOT_FOUND.
   */
  async getNoticeById(id: string): Promise<RawNotice> {
    const notice = await this.repo.findById(id);

    if (!notice) {
      throw new AppError('NOT_FOUND', 404, 'Aviso não encontrado.');
    }

    return notice;
  }

  /**
   * Cria um novo aviso geral.
   */
  async createNotice(payload: CreateNoticePayload): Promise<RawNotice> {
    try {
      return await this.repo.create({
        titulo: payload.titulo,
        mensagem: payload.mensagem,
        remetente: payload.remetente,
        badge_destaque: payload.badgeDestaque,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('INTERNAL_SERVER_ERROR', 500, 'Falha ao cadastrar o aviso.');
    }
  }

  /**
   * Atualiza um aviso geral existente ou lança NOT_FOUND.
   */
  async updateNotice(id: string, payload: UpdateNoticePayload): Promise<RawNotice> {
    const updated = await this.repo.update(id, {
      titulo: payload.titulo,
      mensagem: payload.mensagem,
      remetente: payload.remetente,
      badge_destaque: payload.badgeDestaque,
    });

    if (!updated) {
      throw new AppError('NOT_FOUND', 404, 'Aviso não encontrado para atualização.');
    }

    return updated;
  }

  /**
   * Exclui um aviso pelo ID ou lança NOT_FOUND.
   */
  async deleteNotice(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);

    if (!deleted) {
      throw new AppError('NOT_FOUND', 404, 'Aviso não encontrado para exclusão.');
    }
  }
}
