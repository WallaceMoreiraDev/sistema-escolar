import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { fundingApi } from '../api/fundingApi';
import { ApiError } from '@/utils/apiError';
import { FundingDTO, UpdateFundingPayload } from '@shared/types';

/**
 * Hook para consultar o status de arrecadação global mensal (GET /api/financiamento).
 * Retorna FundingDTO contendo metaArrecadadaMes e updatedAt.
 */
export function useFunding() {
  const { session } = useAuth();
  const token = session?.access_token;

  return useQuery<FundingDTO>({
    queryKey: ['funding'],
    queryFn: async () => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      const response = await fundingApi.getFunding(token);
      return response.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minuto de cache
  });
}

/**
 * Hook de mutação para atualizar o valor arrecadado mensalmente (PUT /api/financiamento).
 * Apenas ADMIN. Invalida a query ['funding'] no sucesso.
 */
export function useUpdateFunding() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;

  return useMutation<FundingDTO, ApiError, UpdateFundingPayload | number>({
    mutationFn: async (payload) => {
      if (!token) {
        throw new ApiError('UNAUTHORIZED', 401, undefined, 'Usuário não autenticado.');
      }
      const data: UpdateFundingPayload =
        typeof payload === 'number' ? { metaArrecadadaMes: payload } : payload;
      const response = await fundingApi.updateFunding(token, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding'] });
    },
  });
}
