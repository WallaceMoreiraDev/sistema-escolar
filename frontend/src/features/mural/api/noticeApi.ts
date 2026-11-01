import {
  ApiResponse,
  ApiErrorResponse,
  NoticeDTO,
  CreateNoticePayload,
  UpdateNoticePayload,
} from '@shared/types';
import { ApiError } from '@/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const noticeApi = {
  /**
   * Obtém a lista paginada de avisos gerais do mural (5 itens por página).
   */
  async getNotices(token: string, page = 1): Promise<ApiResponse<NoticeDTO[]>> {
    const res = await fetch(`${API_URL}/api/avisos?page=${page}`, {
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
   * Obtém os detalhes de um aviso específico por ID.
   */
  async getNoticeById(token: string, id: string): Promise<NoticeDTO> {
    const res = await fetch(`${API_URL}/api/avisos/${id}`, {
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

    const data: ApiResponse<NoticeDTO> = await res.json();
    return data.data;
  },

  /**
   * Cria um novo aviso geral (Acesso exclusivo ADMIN).
   */
  async createNotice(token: string, payload: CreateNoticePayload): Promise<NoticeDTO> {
    const res = await fetch(`${API_URL}/api/avisos`, {
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

    const data: ApiResponse<NoticeDTO> = await res.json();
    return data.data;
  },

  /**
   * Atualiza um aviso geral existente (Acesso exclusivo ADMIN).
   */
  async updateNotice(
    token: string,
    id: string,
    payload: UpdateNoticePayload
  ): Promise<NoticeDTO> {
    const res = await fetch(`${API_URL}/api/avisos/${id}`, {
      method: 'PUT',
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

    const data: ApiResponse<NoticeDTO> = await res.json();
    return data.data;
  },

  /**
   * Realiza o upload de imagem de destaque para o aviso (Acesso exclusivo ADMIN).
   * Rota: POST /api/avisos/:id/imagem
   */
  async uploadNoticeImage(token: string, id: string, file: File): Promise<NoticeDTO> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/avisos/${id}/imagem`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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

    const data: ApiResponse<NoticeDTO> = await res.json();
    return data.data;
  },

  /**
   * Remove a imagem de destaque de um aviso geral (Acesso exclusivo ADMIN).
   * Rota: DELETE /api/avisos/:id/imagem
   */
  async removeNoticeImage(token: string, id: string): Promise<NoticeDTO> {
    const res = await fetch(`${API_URL}/api/avisos/${id}/imagem`, {
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

    const data: ApiResponse<NoticeDTO> = await res.json();
    return data.data;
  },

  /**
   * Exclui um aviso geral pelo ID (Acesso exclusivo ADMIN).
   */
  async deleteNotice(token: string, id: string): Promise<{ id: string }> {
    const res = await fetch(`${API_URL}/api/avisos/${id}`, {
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

    const data: ApiResponse<{ id: string }> = await res.json();
    return data.data;
  },
};
