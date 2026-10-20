import {
  ApiResponse,
  ApiErrorResponse,
  EventDTO,
  CreateEventPayload,
  UpdateEventPayload,
} from '@shared/types';
import {
  eventIdParamSchema,
  listEventsQuerySchema,
} from '@shared/schemas/eventSchema';
import { ApiError } from '@/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const eventApi = {
  /**
   * Lista cronologicamente os eventos de turma no período solicitado (teto de 45 dias).
   * Rota: GET /api/turmas/eventos?startDate=${start}&endDate=${end}
   */
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
};
