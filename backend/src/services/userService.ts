import { UserRepository } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  /**
   * Retrieves the profile of the authenticated user.
   */
  async getProfile(userId: string) {
    const profile = await this.repo.getUserProfile(userId);
    
    if (!profile) {
      throw new AppError('NOT_FOUND', 404, 'Perfil do usuário não encontrado.');
    }
    
    return profile;
  }

  /**
   * Updates the official name of the authenticated user (Onboarding completion).
   */
  async updateProfile(userId: string, nome: string) {
    try {
      return await this.repo.updateUserName(userId, nome);
    } catch (error) {
      // If there's an error from Supabase, it will bubble up and be caught by the Error Middleware
      throw new AppError('INTERNAL_SERVER_ERROR', 500, 'Falha ao atualizar o perfil.');
    }
  }
}
