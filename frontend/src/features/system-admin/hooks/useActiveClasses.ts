import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

export interface ActiveClass {
  id: string;
  name: string;
  shift: 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
  activeMembers: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

let mockActiveClasses: ActiveClass[] = [
  {
    id: 'cls-1',
    name: '3º B - Desenvolvimento de Sistemas',
    shift: 'Manhã',
    activeMembers: 32,
    createdAt: '2023-01-15T10:00:00.000Z'
  },
  {
    id: 'cls-2',
    name: '2º A - Enfermagem',
    shift: 'Tarde',
    activeMembers: 28,
    createdAt: '2023-02-20T14:30:00.000Z'
  },
  {
    id: 'cls-3',
    name: '1º C - Administração',
    shift: 'Noite',
    activeMembers: 45,
    createdAt: '2023-03-05T19:00:00.000Z'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useActiveClasses(page: number = 1, limit: number = 5) {
  return useQuery({
    queryKey: ['active-classes', page, limit],
    queryFn: async (): Promise<PaginatedResponse<ActiveClass>> => {
      await delay(600); // Fake network delay
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = mockActiveClasses.slice(start, end);
      return {
        data: paginatedData,
        meta: {
          total: mockActiveClasses.length,
          page,
          limit,
          totalPages: Math.ceil(mockActiveClasses.length / limit)
        }
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(800);
      mockActiveClasses = mockActiveClasses.filter(c => c.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-classes'] });
    }
  });
}
