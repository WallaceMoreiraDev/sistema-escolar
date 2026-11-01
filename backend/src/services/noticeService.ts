import { NoticeRepository, UpdateNoticeData } from '../repositories/noticeRepository';
import { RawNotice } from '../dtos/noticeDto';
import { CreateNoticePayload, UpdateNoticePayload } from '@shared/types/notice.types';
import { Json } from '@shared/types/database.types';
import { ModerationService } from './moderationService';
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

export interface NoticeImageFileInput {
  name: string;
  size: number;
  type: string;
  data: ArrayBuffer;
}

export class NoticeService {
  private static readonly PAGE_LIMIT = 5;
  private static readonly MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private readonly repo: NoticeRepository,
    private readonly moderationService: ModerationService = new ModerationService()
  ) {}

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
   * Cria um novo aviso geral com moderação de conteúdo em duas camadas.
   */
  async createNotice(payload: CreateNoticePayload): Promise<RawNotice> {
    const textsToModerate = [
      payload.titulo,
      payload.mensagem,
      ...(payload.links || []).map((l) => `${l.titulo} ${l.url}`),
    ]
      .filter(Boolean)
      .join(' ');

    await this.moderationService.validate(textsToModerate);

    try {
      return await this.repo.create({
        titulo: payload.titulo,
        mensagem: payload.mensagem,
        remetente: payload.remetente,
        badge_destaque: payload.badgeDestaque,
        links: (payload.links || []) as unknown as Json,
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
    const textsToModerate = [
      payload.titulo,
      payload.mensagem,
      ...(payload.links || []).map((l) => `${l.titulo} ${l.url}`),
    ]
      .filter(Boolean)
      .join(' ');

    await this.moderationService.validate(textsToModerate);

    const updateData: UpdateNoticeData = {
      titulo: payload.titulo,
      mensagem: payload.mensagem,
      remetente: payload.remetente,
      badge_destaque: payload.badgeDestaque,
    };

    if (payload.links !== undefined) {
      updateData.links = payload.links as unknown as Json;
    }

    const updated = await this.repo.update(id, updateData);

    if (!updated) {
      throw new AppError('NOT_FOUND', 404, 'Aviso não encontrado para atualização.');
    }

    return updated;
  }

  /**
   * Realiza upload de imagem de destaque para o aviso geral no Supabase Storage.
   */
  async uploadNoticeImage(id: string, file: NoticeImageFileInput): Promise<RawNotice> {
    const notice = await this.getNoticeById(id);

    if (!NoticeService.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new AppError(
        'VALIDATION_ERROR',
        400,
        'Tipo de arquivo não permitido. Apenas imagens JPEG, PNG e WEBP são aceitas.'
      );
    }

    if (file.size > NoticeService.MAX_IMAGE_SIZE_BYTES) {
      throw new AppError(
        'VALIDATION_ERROR',
        400,
        'A imagem deve ter no máximo 5 MB.'
      );
    }

    // Se o aviso já possuir imagem anterior, remove do storage antes de gravar a nova
    if (notice.imagem_storage_path) {
      try {
        await this.repo.removeStorageFiles([notice.imagem_storage_path]);
      } catch (err) {
        console.error('Falha ao remover imagem anterior do storage:', err);
      }
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `avisos/${id}/${crypto.randomUUID()}-${sanitizedName}`;

    // Upload no bucket Supabase Storage
    await this.repo.uploadStorageFile(storagePath, file.data, file.type);

    let signedUrl: string;
    try {
      signedUrl = await this.repo.createSignedUrl(storagePath, 86400);
    } catch (urlError) {
      try {
        await this.repo.removeStorageFiles([storagePath]);
      } catch {}
      throw urlError;
    }

    // Atualização no banco de dados com rollback físico em caso de erro
    try {
      const updated = await this.repo.update(id, {
        imagem_storage_path: storagePath,
        imagem_url: signedUrl,
      });

      if (!updated) {
        throw new AppError('NOT_FOUND', 404, 'Aviso não encontrado para vinculação da imagem.');
      }

      return updated;
    } catch (dbError) {
      try {
        await this.repo.removeStorageFiles([storagePath]);
      } catch {}
      throw dbError;
    }
  }

  /**
   * Remove a imagem de destaque do aviso geral (Storage e Banco).
   */
  async removeNoticeImage(id: string): Promise<RawNotice> {
    const notice = await this.getNoticeById(id);

    if (notice.imagem_storage_path) {
      try {
        await this.repo.removeStorageFiles([notice.imagem_storage_path]);
      } catch (err) {
        console.error('Falha ao remover imagem do storage:', err);
      }
    }

    const updated = await this.repo.update(id, {
      imagem_storage_path: null,
      imagem_url: null,
    });

    if (!updated) {
      throw new AppError('NOT_FOUND', 404, 'Aviso não encontrado para remoção da imagem.');
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
