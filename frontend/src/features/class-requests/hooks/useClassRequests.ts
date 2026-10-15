import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { classRequestApi } from '../api/classRequestApi';
import { CreateClassRequestPayload, JoinClassPayload, JoinClassResponse } from '@shared/types';
import { ApiError } from '@/utils/apiError';

/**
 * Hook para consultar a solicitação pendente ativa do aluno autenticado.
 * Só executa a query se houver sessão e o usuário ainda não tiver turma vinculada.
 */
export function useMyPendingClassRequest() {
  const { session, user } = useAuth();
  const token = session?.access_token;

  return useQuery({
    queryKey: ['my-pending-class-request'],
    queryFn: () => classRequestApi.getMyPendingRequest(token!),
    enabled: !!token && !user?.turma,
    staleTime: 1000 * 60, // 1 minuto de cache
  });
}

/**
 * Hook de mutação para envio de solicitação de turma (POST /api/turmas/pedidos).
 * Ao obter sucesso, invalida a query de pedido pendente para atualizar o Dashboard imediatamente.
 */
export function useCreateClassRequest() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: (payload: CreateClassRequestPayload) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return classRequestApi.createRequest(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pending-class-request'] });
    },
  });
}

/**
 * Hook de mutação para cancelamento de solicitação pendente (DELETE /api/turmas/pedidos/meu).
 * Ao obter sucesso, invalida a query de pedido pendente para restaurar o banner vazio da Dashboard.
 */
export function useCancelClassRequest() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: () => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return classRequestApi.cancelMyPendingRequest(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pending-class-request'] });
    },
  });
}

/**
 * Hook de mutação para ingresso em turma por código de convite (POST /api/turmas/entrar).
 * Ao obter sucesso, invalida a query de perfil ['me'] e solicitação pendente ['my-pending-class-request']
 * para atualizar reativamente a Dashboard e o layout para a visão "Com Turma".
 */
export function useJoinClass() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation({
    mutationFn: (payload: JoinClassPayload): Promise<JoinClassResponse> => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      return classRequestApi.joinByCode(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-class-request'] });
    },
  });
}
