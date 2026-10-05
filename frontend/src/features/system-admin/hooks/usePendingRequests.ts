import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MOCK_PENDING_REQUESTS, PendingRequest } from '../data/mockPendingRequests';

// Simulating database with a local variable for SSOT pattern
let pendingRequestsDB: PendingRequest[] = [...MOCK_PENDING_REQUESTS];

export function usePendingRequests() {
  return useQuery({
    queryKey: ['pendingRequests'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      // Sort by oldest first (standard moderation queue)
      return [...pendingRequestsDB].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      pendingRequestsDB = pendingRequestsDB.filter(req => req.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    }
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      pendingRequestsDB = pendingRequestsDB.filter(req => req.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    }
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<PendingRequest, 'id' | 'createdAt'>) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newRequest: PendingRequest = {
        ...data,
        id: `req-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      pendingRequestsDB.push(newRequest);
      return newRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    }
  });
}
