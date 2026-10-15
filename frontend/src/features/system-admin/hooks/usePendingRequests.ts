import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { adminClassApi } from '../api/adminClassApi';
import { ApproveClassRequestPayload } from '@shared/types';
import { ApiError } from '@/utils/apiError';

/**
 * Hook para listar solicitações de turma pendentes de moderação pelo Admin Geral (5 itens por página).
 */
export function usePendingRequests(page: number = 1) {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const isAdmin = user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin-pending-class-requests', page],
    queryFn: () => adminClassApi.listPendingRequests(token!, page),
    enabled: !!token && isAdmin,
    staleTime: 1000 * 60, // 1 minuto de cache
  });
}

/**
 * Hook de mutação para aprovar uma solicitação de turma (POST /api/admin/pedidos-turma/:id/aprovar).
 * Ao aprovar, invalida o cache da fila de moderação e também das turmas ativas.
 */
export function useApproveRequest() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: ApproveClassRequestPayload }) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return adminClassApi.approveRequest(token, id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-class-requests'] });
      queryClient.invalidateQueries({ queryKey: ['activeClasses'] });
    },
  });
}

/**
 * Hook de mutação para rejeitar uma solicitação de turma (DELETE /api/admin/pedidos-turma/:id).
 * Remove o registro pendente e invalida o cache da fila de moderação.
 */
export function useRejectRequest() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return adminClassApi.rejectRequest(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-class-requests'] });
    },
  });
}
