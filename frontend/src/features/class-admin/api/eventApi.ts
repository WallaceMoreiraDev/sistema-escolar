import {
  ApiResponse,
  ApiErrorResponse,
  EventDTO,
  EventAttachmentDTO,
  CreateEventPayload,
  UpdateEventPayload,
} from '@shared/types';
import {
  eventIdParamSchema,
  attachmentParamSchema,
  listEventsQuerySchema,
  listAdminEventsQuerySchema,
} from '@shared/schemas/eventSchema';
import { ApiError } from '@/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const eventApi = {
  /**
   * Lista cronologicamente os eventos de turma no período solicitado (teto de 45 dias).
   * Rota: GET /api/turmas/eventos?startDate=${start}&endDate=${end}
   */
  /**
   * Lista todas as atividades da turma com paginação do banco de dados (histórico completo).
   * Rota: GET /api/turmas/eventos/gestao?page=${page}&limit=${limit}
   */
  async listAdminEvents(
    token: string,
    params: { page?: number; limit?: number; turmaId?: string }
  ): Promise<ApiResponse<EventDTO[]>> {
    listAdminEventsQuerySchema.parse(params);

    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.append('page', String(params.page));
    if (params.limit !== undefined) searchParams.append('limit', String(params.limit));
    if (params.turmaId) searchParams.append('turmaId', params.turmaId);

    const res = await fetch(`${API_URL}/api/turmas/eventos/gestao?${searchParams.toString()}`, {
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

    return (await res.json()) as ApiResponse<EventDTO[]>;
  },

  async listEvents(
    token: string,
    query: { startDate: string; endDate: string; turmaId?: string }
  ): Promise<ApiResponse<EventDTO[]>> {
    // Validação client-side fail-fast com o schema Zod oficial
    listEventsQuerySchema.parse(query);

    const searchParams = new URLSearchParams({
      startDate: query.startDate,
      endDate: query.endDate,
    });

    if (query.turmaId) {
      searchParams.append('turmaId', query.turmaId);
    }

    const res = await fetch(`${API_URL}/api/turmas/eventos?${searchParams.toString()}`, {
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

    return (await res.json()) as ApiResponse<EventDTO[]>;
  },

  /**
   * Consulta um evento individual pelo ID.
   * Rota: GET /api/turmas/eventos/:id
   */
  async getEventById(token: string, id: string): Promise<ApiResponse<EventDTO>> {
    eventIdParamSchema.parse({ id });

    const res = await fetch(`${API_URL}/api/turmas/eventos/${id}`, {
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

    return (await res.json()) as ApiResponse<EventDTO>;
  },

  /**
   * Cria um novo evento para a turma (apenas Líder ou Administrador).
   * Rota: POST /api/turmas/eventos
   */
  async createEvent(
    token: string,
    payload: CreateEventPayload,
    turmaId?: string
  ): Promise<ApiResponse<EventDTO>> {
    const url = turmaId
      ? `${API_URL}/api/turmas/eventos?turmaId=${encodeURIComponent(turmaId)}`
      : `${API_URL}/api/turmas/eventos`;

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

    return (await res.json()) as ApiResponse<EventDTO>;
  },

  /**
   * Atualiza parcialmente um evento existente da turma.
   * Rota: PUT /api/turmas/eventos/:id
   */
  async updateEvent(
    token: string,
    id: string,
    payload: UpdateEventPayload
  ): Promise<ApiResponse<EventDTO>> {
    eventIdParamSchema.parse({ id });

    const res = await fetch(`${API_URL}/api/turmas/eventos/${id}`, {
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

    return (await res.json()) as ApiResponse<EventDTO>;
  },

  /**
   * Exclui um evento da turma.
   * Rota: DELETE /api/turmas/eventos/:id
   */
  async deleteEvent(
    token: string,
    id: string
  ): Promise<ApiResponse<{ message: string }>> {
    eventIdParamSchema.parse({ id });

    const res = await fetch(`${API_URL}/api/turmas/eventos/${id}`, {
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

  /**
   * Realiza o upload de anexo físico para o evento via multipart/form-data.
   * Rota: POST /api/turmas/eventos/:id/anexos
   */
  async uploadAttachment(
    token: string,
    eventId: string,
    file: File
  ): Promise<ApiResponse<EventAttachmentDTO>> {
    eventIdParamSchema.parse({ id: eventId });

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/turmas/eventos/${eventId}/anexos`, {
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

    return (await res.json()) as ApiResponse<EventAttachmentDTO>;
  },

  /**
   * Exclui um anexo específico de um evento.
   * Rota: DELETE /api/turmas/eventos/:id/anexos/:anexoId
   */
  async deleteAttachment(
    token: string,
    eventId: string,
    anexoId: string
  ): Promise<ApiResponse<{ message: string }>> {
    attachmentParamSchema.parse({ id: eventId, anexoId });

    const res = await fetch(`${API_URL}/api/turmas/eventos/${eventId}/anexos/${anexoId}`, {
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

  /**
   * Obtém a URL assinada temporária para download/visualização segura do anexo.
   * Rota: GET /api/turmas/eventos/:id/anexos/:anexoId/download
   */
  async getAttachmentDownloadUrl(
    token: string,
    eventId: string,
    anexoId: string
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    attachmentParamSchema.parse({ id: eventId, anexoId });

    const res = await fetch(`${API_URL}/api/turmas/eventos/${eventId}/anexos/${anexoId}/download`, {
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

    return (await res.json()) as ApiResponse<{ downloadUrl: string }>;
  },
};
