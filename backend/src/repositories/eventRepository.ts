import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '@shared/types/database.types';
import { EventLinkDTO } from '@shared/types/event.types';
import { RawEventWithAttachments, RawEventAttachment } from '../dtos/eventDto';

export class EventRepository {
  private static readonly BUCKET_NAME = 'eventos-anexos';

  private static readonly EVENT_SELECT_FIELDS = `
    id,
    turma_id,
    materia,
    categoria,
    data_hora_limite,
    descricao,
    anexo_url,
    links,
    criado_por,
    created_at,
    eventos_anexos (
      id,
      evento_id,
      turma_id,
      nome_arquivo,
      storage_path,
      tamanho_bytes,
      mime_type,
      criado_por,
      created_at
    )
  `;

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Busca eventos de uma turma dentro de um intervalo de datas (data_hora_limite).
   * Ordena cronologicamente de forma ascendente (data_hora_limite ASC).
   * Inclui links e anexos correlacionados.
   */
  async findEventsByPeriod(
    turmaId: string,
    startDate: string,
    endDate: string
  ): Promise<RawEventWithAttachments[]> {
    const { data, error } = await this.supabase
      .from('eventos')
      .select(EventRepository.EVENT_SELECT_FIELDS)
      .eq('turma_id', turmaId)
      .gte('data_hora_limite', new Date(startDate).toISOString())
      .lte('data_hora_limite', new Date(endDate).toISOString())
      .order('data_hora_limite', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as unknown as RawEventWithAttachments[];
  }

  /**
   * Busca um evento específico por seu ID único, com links e anexos.
   */
  async findById(id: string): Promise<RawEventWithAttachments | null> {
    const { data, error } = await this.supabase
      .from('eventos')
      .select(EventRepository.EVENT_SELECT_FIELDS)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as unknown as RawEventWithAttachments;
  }

  /**
   * Insere um novo evento de turma no banco de dados com links JSONB.
   */
  async create(payload: {
    turma_id: string;
    materia: string;
    categoria: Database['public']['Enums']['evento_categoria'];
    data_hora_limite: string;
    descricao?: string | null;
    anexo_url?: string | null;
    links?: EventLinkDTO[] | null;
    criado_por: string;
  }): Promise<RawEventWithAttachments> {
    const { data, error } = await this.supabase
      .from('eventos')
      .insert({
        turma_id: payload.turma_id,
        materia: payload.materia,
        categoria: payload.categoria,
        data_hora_limite: new Date(payload.data_hora_limite).toISOString(),
        descricao: payload.descricao ?? null,
        anexo_url: payload.anexo_url ?? null,
        links: payload.links ? (payload.links as unknown as Json) : [],
        criado_por: payload.criado_por,
      })
      .select(EventRepository.EVENT_SELECT_FIELDS)
      .single();

    if (error || !data) {
      throw error || new Error('Falha ao inserir o evento.');
    }

    return data as unknown as RawEventWithAttachments;
  }

  /**
   * Atualiza os campos de um evento existente, incluindo links JSONB.
   */
  async update(
    id: string,
    payload: {
      materia?: string;
      categoria?: Database['public']['Enums']['evento_categoria'];
      data_hora_limite?: string;
      descricao?: string | null;
      anexo_url?: string | null;
      links?: EventLinkDTO[] | null;
    }
  ): Promise<RawEventWithAttachments> {
    const updateData: Database['public']['Tables']['eventos']['Update'] = {};

    if (payload.materia !== undefined) updateData.materia = payload.materia;
    if (payload.categoria !== undefined) updateData.categoria = payload.categoria;
    if (payload.data_hora_limite !== undefined) {
      updateData.data_hora_limite = new Date(payload.data_hora_limite).toISOString();
    }
    if (payload.descricao !== undefined) updateData.descricao = payload.descricao;
    if (payload.anexo_url !== undefined) updateData.anexo_url = payload.anexo_url;
    if (payload.links !== undefined) {
      updateData.links = payload.links ? (payload.links as unknown as Json) : [];
    }

    const { data, error } = await this.supabase
      .from('eventos')
      .update(updateData)
      .eq('id', id)
      .select(EventRepository.EVENT_SELECT_FIELDS)
      .single();

    if (error || !data) {
      throw error || new Error('Falha ao atualizar o evento.');
    }

    return data as unknown as RawEventWithAttachments;
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

  // ===========================================================================
  // MÉTODOS DE ANEXOS FÍSICOS (public.eventos_anexos)
  // ===========================================================================

  /**
   * Insere o registro cadastral do anexo na tabela eventos_anexos.
   */
  async createAttachment(payload: {
    evento_id: string;
    turma_id: string;
    nome_arquivo: string;
    storage_path: string;
    tamanho_bytes: number;
    mime_type: string;
    criado_por: string;
  }): Promise<RawEventAttachment> {
    const { data, error } = await this.supabase
      .from('eventos_anexos')
      .insert({
        evento_id: payload.evento_id,
        turma_id: payload.turma_id,
        nome_arquivo: payload.nome_arquivo,
        storage_path: payload.storage_path,
        tamanho_bytes: payload.tamanho_bytes,
        mime_type: payload.mime_type,
        criado_por: payload.criado_por,
      })
      .select('id, evento_id, turma_id, nome_arquivo, storage_path, tamanho_bytes, mime_type, criado_por, created_at')
      .single();

    if (error || !data) {
      throw error || new Error('Falha ao registrar anexo no banco de dados.');
    }

    return data as RawEventAttachment;
  }

  /**
   * Busca anexo pelo seu ID.
   */
  async findAttachmentById(anexoId: string): Promise<RawEventAttachment | null> {
    const { data, error } = await this.supabase
      .from('eventos_anexos')
      .select('id, evento_id, turma_id, nome_arquivo, storage_path, tamanho_bytes, mime_type, criado_por, created_at')
      .eq('id', anexoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as RawEventAttachment;
  }

  /**
   * Busca todos os anexos vinculados a um evento específico.
   */
  async findAttachmentsByEventId(eventoId: string): Promise<RawEventAttachment[]> {
    const { data, error } = await this.supabase
      .from('eventos_anexos')
      .select('id, evento_id, turma_id, nome_arquivo, storage_path, tamanho_bytes, mime_type, criado_por, created_at')
      .eq('evento_id', eventoId);

    if (error) {
      throw error;
    }

    return (data || []) as RawEventAttachment[];
  }

  /**
   * Calcula a soma cumulativa em bytes de todos os anexos já cadastrados para um evento.
   */
  async getEventAttachmentsTotalBytes(eventoId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('eventos_anexos')
      .select('tamanho_bytes')
      .eq('evento_id', eventoId);

    if (error) {
      throw error;
    }

    return (data || []).reduce((acc, curr) => acc + curr.tamanho_bytes, 0);
  }

  /**
   * Remove o registro do anexo da tabela eventos_anexos.
   */
  async deleteAttachment(anexoId: string): Promise<void> {
    const { error } = await this.supabase
      .from('eventos_anexos')
      .delete()
      .eq('id', anexoId);

    if (error) {
      throw error;
    }
  }

  /**
   * Executa a procedure RPC de expurgo de anexos cujos eventos expiraram há mais de 7 dias.
   * Retorna os storage_paths para deleção física no Storage.
   */
  async expurgateOldAttachments(): Promise<string[]> {
    const { data, error } = await this.supabase.rpc('expurgar_anexos_antigos_eventos');

    if (error) {
      throw error;
    }

    return (data || []).map((row) => row.storage_path);
  }

  // ===========================================================================
  // MÉTODOS DE SUPABASE STORAGE (Bucket: eventos-anexos)
  // ===========================================================================

  /**
   * Envia arquivo físico para o bucket eventos-anexos no Supabase Storage.
   */
  async uploadStorageFile(
    path: string,
    fileData: ArrayBuffer | Uint8Array,
    contentType: string
  ): Promise<void> {
    const { error } = await this.supabase.storage
      .from(EventRepository.BUCKET_NAME)
      .upload(path, fileData, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw error;
    }
  }

  /**
   * Remove arquivos físicos do bucket eventos-anexos no Supabase Storage.
   */
  async removeStorageFiles(paths: string[]): Promise<void> {
    if (!paths.length) return;
    const { error } = await this.supabase.storage
      .from(EventRepository.BUCKET_NAME)
      .remove(paths);

    if (error) {
      throw error;
    }
  }

  /**
   * Gera URL assinada com expiração de 1 hora para visualização/download seguro de anexo privado.
   */
  async createSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(EventRepository.BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      throw error || new Error('Falha ao gerar URL assinada do anexo.');
    }

    return data.signedUrl;
  }
}
