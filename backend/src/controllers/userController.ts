import { Context } from 'hono';
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';

export class UserController {
  /**
   * GET /api/me
   */
  static async getProfile(c: Context) {
    // Extract injected supabase client and user from Context (set by authMiddleware)
    const supabase = c.get('supabase');
    const user = c.get('user');

    // Manually instantiate the layered architecture components (or use a DI container in the future)
    const repo = new UserRepository(supabase);
    const service = new UserService(repo);

    const profile = await service.getProfile(user.id);

    return c.json({
      success: true,
      data: profile
    });
  }

  /**
   * PUT /api/me/profile
   */
  static async updateProfile(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    
    // The payload is already validated by the Zod validator middleware in the route definition
    const { nome } = c.get('validBody') as { nome: string };

    const repo = new UserRepository(supabase);
    const service = new UserService(repo);

    const updatedProfile = await service.updateProfile(user.id, nome);

    return c.json({
      success: true,
      data: updatedProfile
    });
  }
}
