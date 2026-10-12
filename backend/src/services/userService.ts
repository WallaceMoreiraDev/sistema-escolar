import { UserRepository } from '../repositories/userRepository';
import { RawUserWithTurma } from '../dtos/userDto';
import { AppError } from '../utils/AppError';

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  /**
   * Obtém os dados brutos do perfil do usuário autenticado.
   * Regra de negócio pura: não conhece HTTP, req ou res (GEMINI.md Seção 4).
   */
  async getProfile(userId: string): Promise<RawUserWithTurma> {
    const profile = await this.repo.getUserProfile(userId);

    if (!profile) {
      throw new AppError('NOT_FOUND', 404, 'Perfil do usuário não encontrado.');
    }

    return profile;
  }

  /**
   * Atualiza o nome oficial do usuário completando o onboarding.
   */
  async updateProfile(userId: string, nome: string): Promise<RawUserWithTurma> {
    try {
      return await this.repo.updateUserName(userId, nome);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('INTERNAL_SERVER_ERROR', 500, 'Falha ao atualizar o perfil.');
    }
  }
}
