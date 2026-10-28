import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { usefulLinkApi } from '../api/usefulLinkApi';
import { CreateLinkPayload } from '@shared/types';
import { ApiError } from '@/utils/apiError';

/**
 * Hook para buscar todos os links úteis da turma do usuário autenticado.
 * Rota: GET /api/turmas/links
 */
export function useUsefulLinks(turmaId?: string) {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const hasAccess = !!user?.turma || (user?.role === 'ADMIN' && !!turmaId);

  return useQuery({
    queryKey: ['useful-links', turmaId],
    queryFn: async () => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      const response = await usefulLinkApi.list(token, turmaId);
      return response.data;
    },
    enabled: !!token && hasAccess,
    retry: false,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
  });
}

/**
 * Hook de mutação para criar um novo link útil na turma.
 * Rota: POST /api/turmas/links
 */
export function useCreateLink() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async ({
      payload,
      turmaId,
    }: {
      payload: CreateLinkPayload;
      turmaId?: string;
    }) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return usefulLinkApi.create(token, payload, turmaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['useful-links'] });
    },
  });
}

/**
 * Hook de mutação para excluir um link útil da turma.
 * Rota: DELETE /api/turmas/links/:id
 */
export function useDeleteLink() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return usefulLinkApi.delete(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['useful-links'] });
    },
  });
}
