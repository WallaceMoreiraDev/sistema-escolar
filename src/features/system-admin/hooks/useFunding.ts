import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock initial data
let currentFunding = 250.00;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useFunding() {
  return useQuery({
    queryKey: ['funding'],
    queryFn: async (): Promise<number> => {
      await delay(400);
      return currentFunding;
    }
  });
}

export function useUpdateFunding() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (amount: number) => {
      await delay(600);
      currentFunding = amount;
      return currentFunding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding'] });
    }
  });
}
