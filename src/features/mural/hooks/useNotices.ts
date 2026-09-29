import { useQuery } from '@tanstack/react-query';
import { Notice } from '../types';
import { MOCK_NOTICES } from '../data/mockNotices';

let noticesDB: Notice[] = [...MOCK_NOTICES] as Notice[];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useNotices() {
  return useQuery({
    queryKey: ['notices'],
    queryFn: async (): Promise<Notice[]> => {
      await delay(600); // Simulando delay de rede
      return [...noticesDB];
    }
  });
}
