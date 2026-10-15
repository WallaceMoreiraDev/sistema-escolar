import {
  ApiResponse,
  ApiErrorResponse,
  AdminClassRequestDTO,
  ApproveClassRequestPayload,
  ApproveClassRequestResponse,
} from '@shared/types';
import { ApiError } from '@/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const adminClassApi = {
  /**
   * Obtém a lista paginada de solicitações de turma pendentes de moderação (GET /api/admin/pedidos-turma?page=X).
   * Ordenado em FIFO (primeiro a chegar é o primeiro a ser avaliado).
   */
  async listPendingRequests(
    token: string,
    page = 1
  ): Promise<ApiResponse<AdminClassRequestDTO[]>> {
    const res = await fetch(`${API_URL}/api/admin/pedidos-turma?page=${page}`, {
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

    return res.json();
  },

  /**
   * Aprova uma solicitação de turma (POST /api/admin/pedidos-turma/:id/aprovar).
   * Efetiva a criação da turma, gera código de convite e vincula o solicitante como LÍDER.
   */
  async approveRequest(
    token: string,
    id: string,
    payload: ApproveClassRequestPayload = {}
  ): Promise<ApproveClassRequestResponse> {
    const res = await fetch(`${API_URL}/api/admin/pedidos-turma/${id}/aprovar`, {
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

    const json = (await res.json()) as ApiResponse<ApproveClassRequestResponse>;
    return json.data;
  },

  /**
   * Rejeita e exclui uma solicitação de turma pendente (DELETE /api/admin/pedidos-turma/:id).
   */
  async rejectRequest(token: string, id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/api/admin/pedidos-turma/${id}`, {
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
