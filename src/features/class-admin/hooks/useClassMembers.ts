import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassMember, MemberRole } from '../types';
import { MOCK_CLASS_MEMBERS } from '../data/mockMembers';

let membersDB = [...MOCK_CLASS_MEMBERS];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useClassMembers() {
  return useQuery({
    queryKey: ['class-members'],
    queryFn: async (): Promise<ClassMember[]> => {
      await delay(600); // Simulate network latency
      return [...membersDB]; // We return all for simplicity in the MVP, not paginating members yet
    }
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, newRole }: { id: string, newRole: MemberRole }) => {
      await delay(500);
      
      // Regra de Negócio: Não pode rebaixar se for o último líder.
      if (newRole === 'student') {
        const leaderCount = membersDB.filter(m => m.role === 'leader').length;
        if (leaderCount <= 1) {
          throw new Error('A turma não pode ficar sem nenhum líder.');
        }
      }

      const index = membersDB.findIndex(m => m.id === id);
      if (index !== -1) {
        membersDB[index] = { ...membersDB[index], role: newRole };
        return membersDB[index];
      }
      throw new Error('Membro não encontrado');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-members'] });
    }
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(500);
      const member = membersDB.find(m => m.id === id);
      
      // Regra de Negócio: Não pode remover se for o último líder.
      if (member?.role === 'leader') {
        const leaderCount = membersDB.filter(m => m.role === 'leader').length;
        if (leaderCount <= 1) {
          throw new Error('Não é possível remover o único líder da turma. Promova outro membro primeiro.');
        }
      }

      membersDB = membersDB.filter(m => m.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-members'] });
    }
  });
}
