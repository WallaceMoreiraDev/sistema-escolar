import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@shared/types/database.types';
import { RawNotice } from '../dtos/noticeDto';

export type InsertNoticeData = Database['public']['Tables']['avisos_gerais']['Insert'];
export type UpdateNoticeData = Database['public']['Tables']['avisos_gerais']['Update'];

export interface PaginatedNoticesResult {
  notices: RawNotice[];
  total: number;
}

export class NoticeRepository {
  public static readonly BUCKET_NAME = 'mural-anexos';

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Envia arquivo físico para o bucket mural-anexos no Supabase Storage.
   */
  async uploadStorageFile(
    path: string,
    fileData: ArrayBuffer | Uint8Array,
    contentType: string
  ): Promise<void> {
    const { error } = await this.supabase.storage
      .from(NoticeRepository.BUCKET_NAME)
      .upload(path, fileData, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw error;
    }
  }

  /**
   * Remove arquivos físicos do bucket mural-anexos no Supabase Storage.
   */
  async removeStorageFiles(paths: string[]): Promise<void> {
    if (!paths.length) return;
    const { error } = await this.supabase.storage
      .from(NoticeRepository.BUCKET_NAME)
      .remove(paths);

    if (error) {
      throw error;
    }
  }

  /**
   * Gera URL assinada com expiração padrão de 24 horas (86400s) para visualização segura da imagem.
   */
  async createSignedUrl(path: string, expiresIn: number = 86400): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(NoticeRepository.BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      throw error || new Error('Falha ao gerar URL assinada da imagem do aviso.');
    }

    return data.signedUrl;
  }

  /**
   * Resolve a URL assinada caso o registro possua imagem_storage_path.
   */
  private async resolveSignedUrl(notice: RawNotice): Promise<RawNotice> {
    if (notice.imagem_storage_path) {
      try {
        const signedUrl = await this.createSignedUrl(notice.imagem_storage_path, 86400);
        return {
          ...notice,
          imagem_url: signedUrl,
        };
      } catch {
        return notice;
      }
    }
    return notice;
  }

  /**
   * Lista avisos gerais com paginação real no banco (GEMINI.md Seção 9.3)
   * Ordenados sempre pelos mais recentes (data_postagem DESC).
   */
  async listPaginated(page: number, limit: number): Promise<PaginatedNoticesResult> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await this.supabase
      .from('avisos_gerais')
      .select('*', { count: 'exact' })
      .order('data_postagem', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    const rawNotices = data || [];
    const notices = await Promise.all(rawNotices.map((n) => this.resolveSignedUrl(n)));

    return {
      notices,
      total: count || 0,
    };
  }

  /**
   * Busca um aviso por ID.
   * Retorna null se não encontrado (código PGRST116).
   */
  async findById(id: string): Promise<RawNotice | null> {
    const { data, error } = await this.supabase
      .from('avisos_gerais')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data) return null;
    return this.resolveSignedUrl(data);
  }

  /**
   * Cria um novo aviso geral.
   */
  async create(notice: InsertNoticeData): Promise<RawNotice> {
    const { data, error } = await this.supabase
      .from('avisos_gerais')
      .insert({
        ...notice,
        links: notice.links ?? [],
      })
      .select('*')
      .single();

    if (error || !data) {
      throw error || new Error('Falha ao inserir aviso geral.');
    }

    return this.resolveSignedUrl(data);
  }

  /**
   * Atualiza um aviso geral existente.
   */
  async update(id: string, notice: UpdateNoticeData): Promise<RawNotice | null> {
    const { data, error } = await this.supabase
      .from('avisos_gerais')
      .update(notice)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data) return null;
    return this.resolveSignedUrl(data);
  }

  /**
   * Exclui um aviso geral por ID e remove fisicamente anexo no storage se existir.
   */
  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);

    const { error, count } = await this.supabase
      .from('avisos_gerais')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      throw error;
    }

    if (existing?.imagem_storage_path) {
      try {
        await this.removeStorageFiles([existing.imagem_storage_path]);
      } catch (storageError) {
        console.error('Falha ao remover imagem do storage após exclusão do aviso:', storageError);
      }
    }

    return (count ?? 0) > 0;
  }
}
