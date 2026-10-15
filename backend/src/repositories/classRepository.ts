import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@shared/types/database.types';
import { RawPedidoTurma } from '../dtos/classDto';

export type InsertPedidoTurma = Database['public']['Tables']['pedidos_turma']['Insert'];

export class ClassRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Busca a solicitação de turma pendente do usuário.
   * Retorna null se não houver pedido pendente.
   */
  async findPendingByUserId(userId: string): Promise<RawPedidoTurma | null> {
    const { data, error } = await this.supabase
      .from('pedidos_turma')
      .select('*')
      .eq('usuario_id', userId)
      .eq('status', 'pendente')
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Cria uma nova solicitação de turma.
   */
  async createRequest(data: InsertPedidoTurma): Promise<RawPedidoTurma> {
    const { data: created, error } = await this.supabase
      .from('pedidos_turma')
      .insert(data)
      .select('*')
      .single();

    if (error || !created) {
      throw error || new Error('Falha ao inserir solicitação de turma.');
    }

    return created;
  }

  /**
   * Remove a solicitação pendente do usuário.
   * Retorna true se um registro foi removido, false caso contrário.
   */
  async deletePendingByUserId(userId: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from('pedidos_turma')
      .delete({ count: 'exact' })
      .eq('usuario_id', userId)
      .eq('status', 'pendente');

    if (error) {
      throw error;
    }

    return (count ?? 0) > 0;
  }

  /**
   * Executa a procedure PostgreSQL transacional 'entrar_turma_por_codigo'.
   * Vincula o usuário autenticado à turma informada via código de convite.
   *
   * @param codigoConvite Código de convite alfanumérico de 6 caracteres.
   * @returns Objeto com turma_id e nome_oficial da turma vinculada.
   */
  async joinClassByCode(
    codigoConvite: string
  ): Promise<{ turma_id: string; nome_oficial: string }> {
    const { data, error } = await this.supabase.rpc('entrar_turma_por_codigo', {
      p_codigo_convite: codigoConvite,
    });

    if (error) {
      throw error;
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Retorno inválido da procedure entrar_turma_por_codigo.');
    }

    return data as { turma_id: string; nome_oficial: string };
  }
}
