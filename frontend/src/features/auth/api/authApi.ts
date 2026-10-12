import { ApiResponse, UserProfileDTO } from '@shared/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authApi = {
  async getMe(token: string): Promise<UserProfileDTO> {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Falha ao obter dados do usuário');
    }

    const data: ApiResponse<UserProfileDTO> = await res.json();
    return data.data;
  },

  async updateProfile(token: string, nome: string): Promise<UserProfileDTO> {
    const res = await fetch(`${API_URL}/api/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nome })
    });

    if (!res.ok) {
      throw new Error('Falha ao atualizar perfil');
    }

    const data: ApiResponse<UserProfileDTO> = await res.json();
    return data.data;
  }
};
