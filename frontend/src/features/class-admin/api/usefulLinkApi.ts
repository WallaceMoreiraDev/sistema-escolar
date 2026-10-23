import {
  ApiResponse,
  ApiErrorResponse,
  LinkDTO,
  CreateLinkPayload,
} from '@shared/types';
import { createLinkSchema, linkIdParamSchema } from '@shared/schemas/linkSchema';
import { ApiError } from '@/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const usefulLinkApi = {
  /**
   * Lista todos os links úteis da turma do usuário autenticado (GET /api/turmas/links).
   * Opcionalmente aceita turmaId para Administradores Gerais.
   */
  async list(token: string, turmaId?: string): Promise<ApiResponse<LinkDTO[]>> {
    const url = turmaId
      ? `${API_URL}/api/turmas/links?turmaId=${encodeURIComponent(turmaId)}`
      : `${API_URL}/api/turmas/links`;

    const res = await fetch(url, {
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

    return (await res.json()) as ApiResponse<LinkDTO[]>;
  },

  /**
   * Cria um novo link útil para a turma (POST /api/turmas/links).
   * Apenas LÍDER ou ADMIN.
   */
  async create(
    token: string,
    payload: CreateLinkPayload,
    turmaId?: string
  ): Promise<ApiResponse<LinkDTO>> {
    createLinkSchema.parse(payload);

    const url = turmaId
      ? `${API_URL}/api/turmas/links?turmaId=${encodeURIComponent(turmaId)}`
      : `${API_URL}/api/turmas/links`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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

    return (await res.json()) as ApiResponse<LinkDTO>;
  },

  /**
   * Exclui um link útil da turma (DELETE /api/turmas/links/:id).
   * Apenas LÍDER ou ADMIN.
   */
  async delete(
    token: string,
    id: string
  ): Promise<ApiResponse<{ message: string }>> {
    linkIdParamSchema.parse({ id });

    const res = await fetch(`${API_URL}/api/turmas/links/${id}`, {
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

    return (await res.json()) as ApiResponse<{ message: string }>;
  },
};
