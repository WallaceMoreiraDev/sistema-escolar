import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({ nome }: { nome: string }) => {
      if (!session?.access_token) throw new Error('Não autenticado');
      return authApi.updateProfile(session.access_token, nome);
    },
    onSuccess: (updatedUser) => {
      // Atualiza o cache imediatamente para que redirecionamentos pós-onboarding vejam onboardingConcluido=true
      if (session?.access_token) {
        queryClient.setQueryData(['me', session.access_token], updatedUser);
      }
      // Força a sincronização em segundo plano dos dados do usuário logado
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
