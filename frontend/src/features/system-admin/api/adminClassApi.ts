import {
  ApiResponse,
  ApiErrorResponse,
  AdminClassRequestDTO,
  ApproveClassRequestPayload,
  ApproveClassRequestResponse,
  ActiveClassDTO,
} from '@shared/types';
import {
  adminActiveClassesPaginationQuerySchema,
  classIdParamSchema,
} from '@shared/schemas/classSchema';
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

  /**
   * Obtém a lista paginada de turmas ativas gerenciadas pelo Administrador Geral (GET /api/admin/turmas?page=X&limit=Y).
   */
  async listActiveClasses(
    token: string,
    page = 1,
    limit = 5
  ): Promise<ApiResponse<ActiveClassDTO[]>> {
    adminActiveClassesPaginationQuerySchema.parse({ page, limit });

    const res = await fetch(`${API_URL}/api/admin/turmas?page=${page}&limit=${limit}`, {
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

    return (await res.json()) as ApiResponse<ActiveClassDTO[]>;
  },

  /**
   * Exclui/destrói uma turma ativa permanentemente (DELETE /api/admin/turmas/:id).
   */
  async deleteClass(token: string, id: string): Promise<{ message: string }> {
    classIdParamSchema.parse({ id });

    const res = await fetch(`${API_URL}/api/admin/turmas/${id}`, {
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

  /**
   * Obtém os detalhes de uma turma ativa por ID (GET /api/admin/turmas/:id).
   */
  async getClassById(token: string, id: string): Promise<ApiResponse<ActiveClassDTO>> {
    classIdParamSchema.parse({ id });

    const res = await fetch(`${API_URL}/api/admin/turmas/${id}`, {
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

    return (await res.json()) as ApiResponse<ActiveClassDTO>;
  },
};
