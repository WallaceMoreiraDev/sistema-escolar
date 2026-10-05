import { z } from 'zod';

export const linkSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres').max(50, 'O título pode ter no máximo 50 caracteres'),
  url: z.string().url('Insira uma URL válida (ex: https://drive.google.com/...)')
});

export type LinkFormValues = z.infer<typeof linkSchema>;
