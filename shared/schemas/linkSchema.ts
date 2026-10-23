import { z } from 'zod';

export const createLinkSchema = z.object({
  titulo: z
    .string({ required_error: 'O título é obrigatório.' })
    .trim()
    .min(2, 'O título deve ter no mínimo 2 caracteres.')
    .max(100, 'O título deve ter no máximo 100 caracteres.'),
  urlLink: z
    .string({ required_error: 'A URL é obrigatória.' })
    .trim()
    .url('Informe uma URL válida.')
    .max(500, 'A URL deve ter no máximo 500 caracteres.'),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const linkIdParamSchema = z.object({
  id: z.string().uuid('ID do link deve ser um UUID válido.'),
});

export type LinkIdParam = z.infer<typeof linkIdParamSchema>;

// Compatibilidade retroativa para código de frontend existente durante migração progressiva
export const linkSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres').max(50, 'O título pode ter no máximo 50 caracteres'),
  url: z.string().url('Insira uma URL válida (ex: https://drive.google.com/...)'),
});

export type LinkFormValues = z.infer<typeof linkSchema>;

