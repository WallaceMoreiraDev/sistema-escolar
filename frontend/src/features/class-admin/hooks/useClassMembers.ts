import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { classMemberApi } from '../api/classMemberApi';
import { MemberRole } from '../types';
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
 * Hook de mutação para atualizar o cargo de um membro da turma (Fase 2).
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: MemberRole }) => {
      // Será implementado na Fase 2 integrado aos endpoints de promoção/rebaixamento
      return { id, newRole };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-members'] });
    },
  });
}

/**
 * Hook de mutação para remover/expulsar um aluno da turma (Fase 2).
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Será implementado na Fase 2 integrado ao endpoint de remoção
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-members'] });
    },
  });
}
