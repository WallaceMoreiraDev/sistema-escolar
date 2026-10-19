import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { classMemberApi } from '../api/classMemberApi';
import { ApiError } from '@/utils/apiError';

/**
 * Hook para buscar os membros da turma do usuário autenticado de forma paginada.
 * Rota: GET /api/turmas/membros?page=${page}
 */
export function useClassMembers(page: number = 1) {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const hasClass = !!user?.turma;

  return useQuery({
    queryKey: ['class-members', page],
    queryFn: async () => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return classMemberApi.listMembers(token, page);
    },
    enabled: !!token && hasClass,
    staleTime: 1000 * 30, // 30 segundos de cache
  });
}

/**
 * Hook de mutação para promover um aluno a líder da turma.
 * Rota: PATCH /api/turmas/membros/:id/promover
 */
export function usePromoteMember() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async (memberId: string) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return classMemberApi.promoteMember(token, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-members'] });
    },
  });
}

/**
 * Hook de mutação para rebaixar um líder da turma a aluno.
 * Rota: PATCH /api/turmas/membros/:id/rebaixar
 */
export function useDemoteMember() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async (memberId: string) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return classMemberApi.demoteMember(token, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-members'] });
    },
  });
}

/**
 * Hook de mutação para expulsar/remover um aluno da turma.
 * Rota: DELETE /api/turmas/membros/:id
 */
export function useExpelMember() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: async (memberId: string) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return classMemberApi.expelMember(token, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-members'] });
    },
  });
}

