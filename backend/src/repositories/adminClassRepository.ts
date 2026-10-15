import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@shared/types/database.types';
import { RawAdminPedidoTurma } from '../dtos/adminClassDto';
import { RawPedidoTurma } from '../dtos/classDto';

export class AdminClassRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Lista as solicitações de turma pendentes paginadas em ordem cronológica (FIFO).
   * Realiza join com a tabela de usuários para obter nome e e-mail do solicitante.
   */
  async listPendingPaginated(
    page: number,
    limit: number
  ): Promise<{ requests: RawAdminPedidoTurma[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await this.supabase
      .from('pedidos_turma')
      .select(
        `
        id,
        usuario_id,
        ano,
        turno,
        curso,
        local_sala,
        justificativa,
        status,
        created_at,
        usuarios (
          id,
          nome,
          email
        )
      `,
        { count: 'exact' }
      )
      .eq('status', 'pendente')
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    return {
      requests: (data as unknown as RawAdminPedidoTurma[]) || [],
      total: count ?? 0,
    };
  }

  /**
   * Busca uma solicitação pendente pelo ID.
   */
  async findPendingById(id: string): Promise<RawPedidoTurma | null> {
    const { data, error } = await this.supabase
      .from('pedidos_turma')
      .select('*')
      .eq('id', id)
      .eq('status', 'pendente')
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Verifica se já existe alguma turma cadastrada com determinado código de convite.
   */
  async checkInviteCodeExists(codigoConvite: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('turmas')
      .select('id')
      .eq('codigo_convite', codigoConvite)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return Boolean(data);
  }

  /**
   * Executa a procedure PostgreSQL transacional 'aprovar_pedido_turma'.
   * Cria a turma, promove o aluno a LÍDER, associa o turma_id e exclui o pedido de forma atômica.
   *
   * @returns UUID da nova turma criada.
   */
  async approveViaRpc(
    pedidoId: string,
    nomeOficial: string,
    codigoConvite: string
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc('aprovar_pedido_turma', {
      p_pedido_id: pedidoId,
      p_nome_oficial: nomeOficial,
      p_codigo_convite: codigoConvite,
    });

    if (error || !data) {
      throw error || new Error('Falha ao executar procedure aprovar_pedido_turma.');
    }

    return data;
  }

  /**
   * Remove uma solicitação de turma pelo ID (rejeição).
   */
  async deleteById(id: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from('pedidos_turma')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return (count ?? 0) > 0;
  }
}
