import { z } from 'zod';

export const noticeSchema = z.object({
  sender: z.enum(['Diretoria', 'Coordenação', 'Administração da Plataforma'], {
    errorMap: () => ({ message: 'Selecione um remetente válido' })
  }),
  badge: z.enum(['Urgente', 'Informativo', 'Evento'], {
    errorMap: () => ({ message: 'Selecione uma badge de destaque válida' })
  }),
  title: z.string().min(5, 'O título deve ter no mínimo 5 caracteres').max(100, 'O título deve ter no máximo 100 caracteres'),
  message: z.string().min(10, 'A mensagem deve ter no mínimo 10 caracteres').max(1000, 'A mensagem deve ter no máximo 1000 caracteres')
});

export type NoticeFormValues = z.infer<typeof noticeSchema>;
