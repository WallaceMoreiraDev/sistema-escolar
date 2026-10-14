import {
  ApiResponse,
  ApiErrorResponse,
  ClassRequestDTO,
  CreateClassRequestPayload,
} from '@shared/types';
import { ApiError } from '@/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const classRequestApi = {
  /**
   * Envia uma nova solicitação de criação de turma pelo aluno (POST /api/turmas/pedidos).
   * Lança ApiError tipado contendo o 'code' retornado pelo backend.
   */
  async createRequest(
    token: string,
    payload: CreateClassRequestPayload
  ): Promise<ClassRequestDTO> {
    const res = await fetch(`${API_URL}/api/turmas/pedidos`, {
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

    const json = (await res.json()) as ApiResponse<ClassRequestDTO>;
    return json.data;
  },

  /**
   * Consulta a solicitação pendente ativa do aluno autenticado (GET /api/turmas/pedidos/meu).
   * Retorna ClassRequestDTO se houver pedido pendente em análise, ou null caso contrário.
   */
  async getMyPendingRequest(token: string): Promise<ClassRequestDTO | null> {
    const res = await fetch(`${API_URL}/api/turmas/pedidos/meu`, {
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

    const json = (await res.json()) as ApiResponse<ClassRequestDTO | null>;
    return json.data;
  },

  /**
   * Cancela a solicitação pendente ativa do aluno autenticado (DELETE /api/turmas/pedidos/meu).
   */
  async cancelMyPendingRequest(token: string): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/api/turmas/pedidos/meu`, {
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

    const json = (await res.json()) as ApiResponse<{ message: string }>;
    return json.data;
  },
};
