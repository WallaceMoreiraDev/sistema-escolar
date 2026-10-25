import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { adminClassApi } from '../api/adminClassApi';
import { ApiError } from '@/utils/apiError';
import { ActiveClassDTO, ApiResponse } from '@shared/types';

export type ActiveClass = ActiveClassDTO;

/**
 * Hook para listar turmas ativas gerenciadas pelo Administrador Geral (GET /api/admin/turmas?page=X&limit=Y).
 */
export function useActiveClasses(page: number = 1, limit: number = 5) {
  const { session } = useAuth();
  const token = session?.access_token;

  return useQuery<ApiResponse<ActiveClassDTO[]>>({
    queryKey: ['admin-active-classes', page, limit],
    queryFn: async () => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return adminClassApi.listActiveClasses(token, page, limit);
    },
    placeholderData: keepPreviousData,
    enabled: !!token,
    staleTime: 1000 * 30, // 30 segundos de cache
  });
}

/**
 * Hook de mutação para excluir/destruir uma turma ativa permanentemente (DELETE /api/admin/turmas/:id).
 */
export function useDeleteClass() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: async (id: string) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return adminClassApi.deleteClass(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-active-classes'] });
    },
  });
}
