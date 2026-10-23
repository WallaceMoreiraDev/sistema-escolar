import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@shared/types/database.types';
import { RawFunding } from '../dtos/fundingDto';

export class FundingRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Obtém a configuração global de arrecadação/meta (registro singleton id = 1).
   */
  async getFunding(): Promise<RawFunding> {
    const { data, error } = await this.supabase
      .from('configuracao_global')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Atualiza o valor arrecadado no mês e a data de auditoria no registro singleton id = 1.
   */
  async updateFunding(metaArrecadadaMes: number): Promise<RawFunding> {
    const { data, error } = await this.supabase
      .from('configuracao_global')
      .update({
        meta_arrecadada_mes: metaArrecadadaMes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
