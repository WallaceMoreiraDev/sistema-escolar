import { Context } from 'hono';
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';
import { UserDTO } from '../dtos/userDto';
import { ApiResponse, UserProfileDTO, UpdateProfilePayload } from '@shared/types';

export class UserController {
  /**
   * GET /api/me
   * Retorna os dados do perfil do usuário autenticado no formato DTO padronizado.
   */
  static async getProfile(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');

    const repo = new UserRepository(supabase);
    const service = new UserService(repo);

    const rawProfile = await service.getProfile(user.id);
    const profileDTO = UserDTO.toProfile(rawProfile);

    const response: ApiResponse<UserProfileDTO> = {
      success: true,
      data: profileDTO,
    };

    return c.json(response);
  }

  /**
   * PUT /api/me/profile
   * Atualiza o nome oficial do usuário (Onboarding) e retorna o perfil atualizado.
   */
  static async updateProfile(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const body = c.get('validBody') as UpdateProfilePayload;

    const repo = new UserRepository(supabase);
    const service = new UserService(repo);

    const rawUpdated = await service.updateProfile(user.id, body.nome);
    const profileDTO = UserDTO.toProfile(rawUpdated);

    const response: ApiResponse<UserProfileDTO> = {
      success: true,
      data: profileDTO,
    };

    return c.json(response);
  }
}
