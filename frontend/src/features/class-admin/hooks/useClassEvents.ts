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

/**
 * Hook para buscar todas as atividades da turma com paginação do banco de dados (histórico completo).
 * Rota: GET /api/turmas/eventos/gestao?page=${page}&limit=${limit}
 */
export function useAdminClassEvents(
  page = 1,
  limit = 5,
  turmaId?: string
) {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const hasClassAccess = !!user?.turma || user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin-class-events', { page, limit, turmaId }],
    queryFn: async () => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return eventApi.listAdminEvents(token, { page, limit, turmaId });
    },
    enabled: !!token && hasClassAccess,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
  });
}

export function useClassEvents(
  startDate?: string,
  endDate?: string,
  turmaId?: string
) {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const hasClassAccess = !!user?.turma || (user?.role === 'ADMIN' && !!turmaId);

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
    retry: false,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
  });
}

/**
 * Hook para consultar um evento individual pelo ID.
 * Rota: GET /api/turmas/eventos/:id
 */
export function useClassEvent(id?: string) {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const hasClassAccess = !!user?.turma || user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['class-event', id],
    queryFn: async () => {
      if (!token || !id) throw new Error('Parâmetros inválidos');
      const res = await eventApi.getEventById(token, id);
      return res.data;
    },
    enabled: !!token && !!id && hasClassAccess,
    staleTime: 1000 * 60 * 2,
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
      queryClient.invalidateQueries({ queryKey: ['admin-class-events'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-class-events'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-class-events'] });
    },
  });
}

/**
 * Hook de mutação para upload de anexo físico de atividade no Supabase Storage.
 * Rota: POST /api/turmas/eventos/:id/anexos
 */
export function useUploadAttachment() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async ({ eventId, file }: { eventId: string; file: File }) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return eventApi.uploadAttachment(token, eventId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-class-events'] });
    },
  });
}

/**
 * Hook de mutação para exclusão de anexo físico de atividade.
 * Rota: DELETE /api/turmas/eventos/:id/anexos/:anexoId
 */
export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async ({
      eventId,
      anexoId,
    }: {
      eventId: string;
      anexoId: string;
    }) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return eventApi.deleteAttachment(token, eventId, anexoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-class-events'] });
    },
  });
}
