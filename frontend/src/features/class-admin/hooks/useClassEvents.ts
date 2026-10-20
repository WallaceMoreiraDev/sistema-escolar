import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { eventApi } from '../api/eventApi';
import {
  CreateEventPayload,
  UpdateEventPayload,
} from '@shared/types';
import { ApiError } from '@/utils/apiError';

/**
 * Hook para buscar eventos da turma por período (máximo de 45 dias).
 * Rota: GET /api/turmas/eventos?startDate=${start}&endDate=${end}
 */
export function useClassEvents(
  startDate?: string,
  endDate?: string,
  turmaId?: string
) {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const hasClassAccess = !!user?.turma || user?.role === 'ADMIN';

  // Se o período não for informado, calcula default de 35 dias a partir de hoje
  const now = new Date();
  const defaultStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  ).toISOString();
  const defaultEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 35,
    23,
    59,
    59,
    999
  ).toISOString();

  const start = startDate || defaultStart;
  const end = endDate || defaultEnd;

  return useQuery({
    queryKey: ['class-events', { startDate: start, endDate: end, turmaId }],
    queryFn: async () => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return eventApi.listEvents(token, {
        startDate: start,
        endDate: end,
        turmaId,
      });
    },
    enabled: !!token && hasClassAccess,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
  });
}

/**
 * Hook de mutação para criar um novo evento na turma.
 * Rota: POST /api/turmas/eventos
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async ({
      payload,
      turmaId,
    }: {
      payload: CreateEventPayload;
      turmaId?: string;
    }) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return eventApi.createEvent(token, payload, turmaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-events'] });
    },
  });
}

/**
 * Hook de mutação para atualizar parcialmente um evento existente.
 * Rota: PUT /api/turmas/eventos/:id
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEventPayload;
    }) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return eventApi.updateEvent(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-events'] });
    },
  });
}

/**
 * Hook de mutação para excluir um evento da turma.
 * Rota: DELETE /api/turmas/eventos/:id
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return eventApi.deleteEvent(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-events'] });
    },
  });
}
