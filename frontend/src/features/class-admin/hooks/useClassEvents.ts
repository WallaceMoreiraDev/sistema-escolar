import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ClassEvent, PaginatedResponse } from '../types';
import { EventFormValues } from '../schemas/eventSchema';
import { MOCK_CLASS_EVENTS } from '../data/mockEvents';

let eventsDB = [...MOCK_CLASS_EVENTS];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useClassEvents(page: number = 1, limit: number = 5) {
  return useQuery({
    queryKey: ['class-events', page, limit],
    queryFn: async (): Promise<PaginatedResponse<ClassEvent>> => {
      await delay(600); // Simulate network latency
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = eventsDB.slice(start, end);
      return {
        data: paginatedData,
        meta: {
          total: eventsDB.length,
          page,
          limit,
          totalPages: Math.ceil(eventsDB.length / limit)
        }
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache sem re-fetch automático
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: EventFormValues) => {
      await delay(800);
      const newEvent: ClassEvent = {
        id: `evt-${Date.now()}`,
        subject: data.subject,
        category: data.category,
        dueDate: data.dueDate,
        description: data.description || '',
        createdAt: new Date().toISOString(),
      };
      eventsDB = [newEvent, ...eventsDB]; // Add to top
      return newEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-events'] });
    }
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(500);
      eventsDB = eventsDB.filter(e => e.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-events'] });
    }
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: EventFormValues }) => {
      await delay(800);
      const index = eventsDB.findIndex(e => e.id === id);
      if (index !== -1) {
        eventsDB[index] = {
          ...eventsDB[index],
          subject: data.subject,
          category: data.category,
          dueDate: data.dueDate,
          description: data.description || '',
        };
        return eventsDB[index];
      }
      throw new Error('Evento não encontrado');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-events'] });
    }
  });
}
