import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileMock';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    retry: false, // Não tentar de novo se der 404
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      // Atualiza o cache automaticamente com o novo nome
      queryClient.setQueryData(['profile'], { name: data.data.name });
    },
  });
}
