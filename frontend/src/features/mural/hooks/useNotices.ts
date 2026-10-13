import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { noticeApi } from '../api/noticeApi';
import { CreateNoticePayload, UpdateNoticePayload } from '@shared/types';

/**
 * Hook para listagem paginada de avisos gerais do mural (5 itens por página).
 */
export function useNotices(page: number = 1) {
  const { session } = useAuth();
  const token = session?.access_token;

  return useQuery({
    queryKey: ['notices', page],
    queryFn: () => noticeApi.getNotices(token!, page),
    enabled: !!token,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
  });
}

/**
 * Hook para buscar detalhes de um aviso específico por ID.
 */
export function useNotice(id?: string) {
  const { session } = useAuth();
  const token = session?.access_token;

  return useQuery({
    queryKey: ['notice', id],
    queryFn: () => noticeApi.getNoticeById(token!, id!),
    enabled: !!id && !!token,
  });
}

/**
 * Hook de mutação para criar aviso geral (ADMIN).
 */
export function useCreateNotice() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: (data: CreateNoticePayload) => {
      if (!token) throw new Error('Não autenticado');
      return noticeApi.createNotice(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

/**
 * Hook de mutação para editar aviso geral (ADMIN).
 */
export function useUpdateNotice() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoticePayload }) => {
      if (!token) throw new Error('Não autenticado');
      return noticeApi.updateNotice(token, id, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notice', variables.id] });
    },
  });
}

/**
 * Hook de mutação para excluir aviso geral (ADMIN).
 */
export function useDeleteNotice() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('Não autenticado');
      return noticeApi.deleteNotice(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}
