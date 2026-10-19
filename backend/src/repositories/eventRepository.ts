import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@shared/types/database.types';
import { RawEvent } from '../dtos/eventDto';

export class EventRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Busca eventos de uma turma dentro de um intervalo de datas (data_hora_limite).
   * Ordena cronologicamente de forma ascendente (data_hora_limite ASC).
   * Retorna a descrição completa sem truncamento.
   */
  async findEventsByPeriod(
    turmaId: string,
    startDate: string,
    endDate: string
  ): Promise<RawEvent[]> {
    const { data, error } = await this.supabase
      .from('eventos')
      .select('id, turma_id, materia, categoria, data_hora_limite, descricao, anexo_url, criado_por, created_at')
      .eq('turma_id', turmaId)
      .gte('data_hora_limite', new Date(startDate).toISOString())
      .lte('data_hora_limite', new Date(endDate).toISOString())
      .order('data_hora_limite', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as RawEvent[];
  }

  /**
   * Busca um evento específico por seu ID único.
   */
  async findById(id: string): Promise<RawEvent | null> {
    const { data, error } = await this.supabase
      .from('eventos')
      .select('id, turma_id, materia, categoria, data_hora_limite, descricao, anexo_url, criado_por, created_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as RawEvent;
  }

  /**
   * Insere um novo evento de turma no banco de dados.
   */
  async create(payload: {
    turma_id: string;
    materia: string;
    categoria: Database['public']['Enums']['evento_categoria'];
    data_hora_limite: string;
    descricao?: string | null;
    anexo_url?: string | null;
    criado_por: string;
  }): Promise<RawEvent> {
    const { data, error } = await this.supabase
      .from('eventos')
      .insert({
        turma_id: payload.turma_id,
        materia: payload.materia,
        categoria: payload.categoria,
        data_hora_limite: new Date(payload.data_hora_limite).toISOString(),
        descricao: payload.descricao ?? null,
        anexo_url: payload.anexo_url ?? null,
        criado_por: payload.criado_por,
      })
      .select('id, turma_id, materia, categoria, data_hora_limite, descricao, anexo_url, criado_por, created_at')
      .single();

    if (error || !data) {
      throw error || new Error('Falha ao inserir o evento.');
    }

    return data as RawEvent;
  }

  /**
   * Atualiza os campos de um evento existente.
   */
  async update(
    id: string,
    payload: {
      materia?: string;
      categoria?: Database['public']['Enums']['evento_categoria'];
      data_hora_limite?: string;
      descricao?: string | null;
      anexo_url?: string | null;
    }
  ): Promise<RawEvent> {
    const updateData: Database['public']['Tables']['eventos']['Update'] = {};

    if (payload.materia !== undefined) updateData.materia = payload.materia;
    if (payload.categoria !== undefined) updateData.categoria = payload.categoria;
    if (payload.data_hora_limite !== undefined) {
      updateData.data_hora_limite = new Date(payload.data_hora_limite).toISOString();
    }
    if (payload.descricao !== undefined) updateData.descricao = payload.descricao;
    if (payload.anexo_url !== undefined) updateData.anexo_url = payload.anexo_url;

    const { data, error } = await this.supabase
      .from('eventos')
      .update(updateData)
      .eq('id', id)
      .select('id, turma_id, materia, categoria, data_hora_limite, descricao, anexo_url, criado_por, created_at')
      .single();

    if (error || !data) {
      throw error || new Error('Falha ao atualizar o evento.');
    }

    return data as RawEvent;
  }

  /**
   * Exclui um evento da turma.
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
