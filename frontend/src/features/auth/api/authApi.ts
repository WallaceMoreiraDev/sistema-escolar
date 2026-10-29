import { ApiErrorResponse, ApiResponse, UserProfileDTO } from '@shared/types';
import { ApiError } from '@/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authApi = {
  async getMe(token: string): Promise<UserProfileDTO> {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = (await res.json().catch(() => null)) as ApiErrorResponse | null;
      throw new ApiError(
        errorData?.code || 'FETCH_ME_ERROR',
        res.status,
        errorData?.details,
        errorData?.message
      );
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
      const errorData = (await res.json().catch(() => null)) as ApiErrorResponse | null;
      throw new ApiError(
        errorData?.code || 'UPDATE_PROFILE_ERROR',
        res.status,
        errorData?.details,
        errorData?.message
      );
    }

    const data: ApiResponse<UserProfileDTO> = await res.json();
    return data.data;
  }
};
