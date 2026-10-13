import {
  ApiResponse,
  NoticeDTO,
  CreateNoticePayload,
  UpdateNoticePayload,
} from '@shared/types';

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
      throw new Error('Falha ao obter avisos do mural');
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
      throw new Error('Falha ao obter detalhes do aviso');
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
      throw new Error('Falha ao criar aviso');
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
      throw new Error('Falha ao atualizar aviso');
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
      throw new Error('Falha ao excluir aviso');
    }

    const data: ApiResponse<{ id: string }> = await res.json();
    return data.data;
  },
};
