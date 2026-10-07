import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notice } from '../types';
import { MOCK_NOTICES } from '../data/mockNotices';
import { type NoticeFormValues } from '@shared/schemas/noticeSchema';

let noticesDB: Notice[] = [...MOCK_NOTICES] as Notice[];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useNotices() {
  return useQuery({
    queryKey: ['notices'],
    queryFn: async (): Promise<Notice[]> => {
      await delay(600); // Simulando delay de rede
      // Ordena decrescente por createdAt (mais novos primeiro)
      return [...noticesDB].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: NoticeFormValues) => {
      await delay(800);
      const newNotice: Notice = {
        id: `notice-${Date.now()}`,
        sender: data.sender,
        badge: data.badge,
        title: data.title,
        message: data.message,
        date: 'Agora', // Simplificação para o frontend (poderia usar date-fns no front real)
        createdAt: new Date().toISOString()
      };
      noticesDB = [newNotice, ...noticesDB];
      return newNotice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    }
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: NoticeFormValues }) => {
      await delay(800);
      const index = noticesDB.findIndex(n => n.id === id);
      if (index !== -1) {
        noticesDB[index] = {
          ...noticesDB[index],
          sender: data.sender,
          badge: data.badge,
          title: data.title,
          message: data.message
        };
        return noticesDB[index];
      }
      throw new Error('Aviso não encontrado');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    }
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(500);
      noticesDB = noticesDB.filter(n => n.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    }
  });
}
