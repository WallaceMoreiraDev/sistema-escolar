import { ApiResponse, ApiErrorResponse, ClassMemberDTO } from '@shared/types';
import { ApiError } from '@/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const classMemberApi = {
  /**
   * Busca a lista paginada de colegas de turma do usuário autenticado (GET /api/turmas/membros?page=${page}).
   * Retorna envelope ApiResponse contendo data: ClassMemberDTO[] e meta.pagination.
   */
  async listMembers(
    token: string,
    page: number = 1
  ): Promise<ApiResponse<ClassMemberDTO[]>> {
    const res = await fetch(`${API_URL}/api/turmas/membros?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = (await res.json().catch(() => null)) as ApiErrorResponse | null;
      throw new ApiError(
        errorData?.code || 'UNKNOWN_ERROR',
        res.status,
        errorData?.details,
        errorData?.message
      );
    }

    return (await res.json()) as ApiResponse<ClassMemberDTO[]>;
  },
};
