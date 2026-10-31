import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@shared/types/database.types';
import { CreateLinkPayload } from '@shared/types/link.types';
import { RawLink } from '../dtos/linkDto';

export class LinkRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Consulta os links úteis de uma turma ordenados do mais recente para o mais antigo.
   * Utiliza o índice idx_links_uteis_turma_created_at.
   */
  async listByTurma(turmaId: string): Promise<RawLink[]> {
    const { data, error } = await this.supabase
      .from('links_uteis')
      .select('*')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Insere um novo link útil para a turma informada.
   */
  async create(
    turmaId: string,
    criadoPor: string,
    payload: CreateLinkPayload
  ): Promise<RawLink> {
    const { data, error } = await this.supabase
      .from('links_uteis')
      .insert({
        turma_id: turmaId,
        criado_por: criadoPor,
        titulo: payload.titulo,
        url_link: payload.urlLink,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Busca um link útil pelo seu identificador primário.
   */
  async findById(id: string): Promise<RawLink | null> {
    const { data, error } = await this.supabase
      .from('links_uteis')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Atualiza os dados de um link útil existente.
   */
  async update(id: string, payload: Partial<CreateLinkPayload>): Promise<RawLink> {
    const updateData: { titulo?: string; url_link?: string } = {};
    if (payload.titulo !== undefined) updateData.titulo = payload.titulo;
    if (payload.urlLink !== undefined) updateData.url_link = payload.urlLink;

    const { data, error } = await this.supabase
      .from('links_uteis')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Exclui um link útil pelo ID.
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('links_uteis')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
