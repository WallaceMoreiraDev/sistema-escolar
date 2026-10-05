import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsefulLink } from '../types';
import { LinkFormValues } from '../schemas/linkSchema';

let linksDB: UsefulLink[] = [
  { id: 'lnk-1', title: 'Pasta do Drive da Sala', url: 'https://drive.google.com', createdAt: new Date().toISOString() },
  { id: 'lnk-2', title: 'Grupo do WhatsApp', url: 'https://chat.whatsapp.com', createdAt: new Date().toISOString() },
  { id: 'lnk-3', title: 'Portal NSA (Notas)', url: 'https://nsa.cps.sp.gov.br', createdAt: new Date().toISOString() },
  { id: 'lnk-4', title: 'Plano de Ensino (PDF)', url: 'https://docs.google.com/document/d/...', createdAt: new Date().toISOString() },
  { id: 'lnk-5', title: 'Cronograma do Semestre', url: 'https://docs.google.com/spreadsheets/d/...', createdAt: new Date().toISOString() },
  { id: 'lnk-6', title: 'Canal do YouTube (Aulas Gravação)', url: 'https://youtube.com', createdAt: new Date().toISOString() },
  { id: 'lnk-7', title: 'Link Extra para Teste de Pág 2', url: 'https://example.com', createdAt: new Date().toISOString() },
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useUsefulLinks() {
  return useQuery({
    queryKey: ['useful-links'],
    queryFn: async (): Promise<UsefulLink[]> => {
      await delay(500);
      return [...linksDB];
    }
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LinkFormValues) => {
      await delay(600);
      const newLink: UsefulLink = {
        id: `lnk-${Date.now()}`,
        title: data.title,
        url: data.url,
        createdAt: new Date().toISOString()
      };
      linksDB = [newLink, ...linksDB];
      return newLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['useful-links'] });
    }
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(500);
      linksDB = linksDB.filter(l => l.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['useful-links'] });
    }
  });
}
