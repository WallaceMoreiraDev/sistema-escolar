import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@shared/types/database.types';
import { RawUserWithTurma } from '../dtos/userDto';

export class UserRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Busca os dados do usuário e a turma vinculada (se houver).
   * Segue o princípio Fail-Fast: apenas PGRST116 (não encontrado) retorna null.
   * Erros de banco ou permissão são propagados.
   */
  async getUserProfile(userId: string): Promise<RawUserWithTurma | null> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('id, nome, email, role, onboarding_concluido, turmas (id, nome_oficial, codigo_convite)')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116 = JSON object requested, multiple (or no) rows returned -> Usuário não existe
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    return data as RawUserWithTurma;
  }

  /**
   * Atualiza o nome oficial do usuário e marca onboarding_concluido como true.
   */
  async updateUserName(userId: string, nome: string): Promise<RawUserWithTurma> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .update({ nome, onboarding_concluido: true })
      .eq('id', userId)
      .select('id, nome, email, role, onboarding_concluido, turmas (id, nome_oficial, codigo_convite)')
      .single();

    if (error || !data) {
      throw error || new Error('Falha ao atualizar o usuário.');
    }

    return data as RawUserWithTurma;
  }
}
