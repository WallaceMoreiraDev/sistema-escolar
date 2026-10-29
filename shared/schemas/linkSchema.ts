import { z } from 'zod';

/**
 * Validador estrito de URL que impede esquemas perigosos como javascript: e data: (Prevenção contra Stored XSS).
 */
export const safeHttpUrlSchema = (fieldName: string = 'A URL') =>
  z
    .string({ required_error: `${fieldName} é obrigatória.` })
    .trim()
    .url(`${fieldName} deve ser uma URL válida.`)
    .regex(/^https?:\/\//i, `${fieldName} deve utilizar exclusivamente os protocolos HTTP ou HTTPS.`)
    .max(500, `${fieldName} deve ter no máximo 500 caracteres.`);

/**
 * Validação de query param para filtrar ou vincular operações à turma por ID.
 */
export const classIdQuerySchema = z.object({
  turmaId: z.string().uuid('ID da turma deve ser um UUID válido.').optional(),
});

export type ClassIdQuery = z.infer<typeof classIdQuerySchema>;

export const createLinkSchema = z.object({
  titulo: z
    .string({ required_error: 'O título é obrigatório.' })
    .trim()
    .min(2, 'O título deve ter no mínimo 2 caracteres.')
    .max(100, 'O título deve ter no máximo 100 caracteres.'),
  urlLink: safeHttpUrlSchema('A URL do link'),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const linkIdParamSchema = z.object({
  id: z.string().uuid('ID do link deve ser um UUID válido.'),
});

export type LinkIdParam = z.infer<typeof linkIdParamSchema>;

// Compatibilidade retroativa para código de frontend existente durante migração progressiva
export const linkSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres').max(50, 'O título pode ter no máximo 50 caracteres'),
  url: safeHttpUrlSchema('A URL'),
});

export type LinkFormValues = z.infer<typeof linkSchema>;
