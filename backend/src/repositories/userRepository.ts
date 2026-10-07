import { SupabaseClient } from '@supabase/supabase-js';

export class UserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Fetches the user profile and their associated class if any.
   */
  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('id, nome, email, role, turmas (id, nome_oficial)')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }
    
    const turma = Array.isArray(data.turmas) ? data.turmas[0] : data.turmas;

    // Map to the requested payload format
    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      role: data.role,
      turma: turma ? { id: turma.id, nome: turma.nome_oficial } : null
    };
  }

  /**
   * Updates the user's official name.
   */
  async updateUserName(userId: string, nome: string) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .update({ nome })
      .eq('id', userId)
      .select('id, nome, email, role, turmas (id, nome_oficial)')
      .single();
      
    if (error) {
      throw error;
    }

    const turma = Array.isArray(data.turmas) ? data.turmas[0] : data.turmas;

    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      role: data.role,
      turma: turma ? { id: turma.id, nome: turma.nome_oficial } : null
    };
  }
}
