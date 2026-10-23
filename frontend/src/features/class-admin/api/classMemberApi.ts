import {
  ApiResponse,
  ApiErrorResponse,
  ClassMemberDTO,
  ClassMemberActionResponse,
} from '@shared/types';
import { classMemberIdParamSchema } from '@shared/schemas/classSchema';
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

  /**
   * Promove um aluno da turma a líder (PATCH /api/turmas/membros/:id/promover).
   */
  async promoteMember(
    token: string,
    memberId: string
  ): Promise<ApiResponse<ClassMemberActionResponse>> {
    classMemberIdParamSchema.parse({ id: memberId });

    const res = await fetch(`${API_URL}/api/turmas/membros/${memberId}/promover`, {
      method: 'PATCH',
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

    return (await res.json()) as ApiResponse<ClassMemberActionResponse>;
  },

  /**
   * Rebaixa um líder da turma para o cargo de aluno (PATCH /api/turmas/membros/:id/rebaixar).
   */
  async demoteMember(
    token: string,
    memberId: string
  ): Promise<ApiResponse<ClassMemberActionResponse>> {
    classMemberIdParamSchema.parse({ id: memberId });

    const res = await fetch(`${API_URL}/api/turmas/membros/${memberId}/rebaixar`, {
      method: 'PATCH',
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

    return (await res.json()) as ApiResponse<ClassMemberActionResponse>;
  },

  /**
   * Expulsa/remove um aluno da turma (DELETE /api/turmas/membros/:id).
   */
  async expelMember(
    token: string,
    memberId: string
  ): Promise<ApiResponse<ClassMemberActionResponse>> {
    classMemberIdParamSchema.parse({ id: memberId });

    const res = await fetch(`${API_URL}/api/turmas/membros/${memberId}`, {
      method: 'DELETE',
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

    return (await res.json()) as ApiResponse<ClassMemberActionResponse>;
  },

  /**
   * Desvincula voluntariamente o usuário autenticado de sua turma (POST /api/turmas/sair).
   */
  async leaveClass(token: string): Promise<ApiResponse<{ message: string }>> {
    const res = await fetch(`${API_URL}/api/turmas/sair`, {
      method: 'POST',
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

    return (await res.json()) as ApiResponse<{ message: string }>;
  },
};

