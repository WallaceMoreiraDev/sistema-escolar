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
  constructor(private readonly supabase: SupabaseClient<Database>) {}

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

    return {
      notices: data || [],
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

    return data;
  }

  /**
   * Cria um novo aviso geral.
   */
  async create(notice: InsertNoticeData): Promise<RawNotice> {
    const { data, error } = await this.supabase
      .from('avisos_gerais')
      .insert(notice)
      .select('*')
      .single();

    if (error || !data) {
      throw error || new Error('Falha ao inserir aviso geral.');
    }

    return data;
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

    return data;
  }

  /**
   * Exclui um aviso geral por ID.
   */
  async delete(id: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from('avisos_gerais')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return (count ?? 0) > 0;
  }
}
