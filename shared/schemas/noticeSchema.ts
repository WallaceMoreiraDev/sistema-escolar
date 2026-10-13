import { z } from 'zod';

// ============================================================================
// Schemas Oficiais do Mural de Avisos (GEMINI.md - camelCase em Português)
// ============================================================================

export const avisoRemetenteEnum = z.enum(
  ['Diretoria ETEC', 'Coordenação', 'Administração da Plataforma'],
  {
    errorMap: () => ({ message: 'Selecione um remetente válido.' }),
  }
);

export const avisoBadgeEnum = z.enum(
  ['Urgente', 'Informativo', 'Evento'],
  {
    errorMap: () => ({ message: 'Selecione uma badge de destaque válida.' }),
  }
);

export const createNoticeSchema = z.object({
  titulo: z
    .string()
    .min(5, 'O título deve ter no mínimo 5 caracteres.')
    .max(255, 'O título deve ter no máximo 255 caracteres.'),
  mensagem: z
    .string()
    .min(10, 'A mensagem deve ter no mínimo 10 caracteres.')
    .max(5000, 'A mensagem deve ter no máximo 5000 caracteres.'),
  remetente: avisoRemetenteEnum,
  badgeDestaque: avisoBadgeEnum,
});

export const updateNoticeSchema = createNoticeSchema;

export const noticeIdParamSchema = z.object({
  id: z.string().uuid('ID do aviso inválido.'),
});

export const noticePaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
export type NoticeIdParam = z.infer<typeof noticeIdParamSchema>;
export type NoticePaginationQuery = z.infer<typeof noticePaginationQuerySchema>;

// ============================================================================
// Compatibilidade Temporária com o Frontend Existente (Mock antigo)
// ============================================================================

export const noticeSchema = z.object({
  sender: z.enum(['Diretoria', 'Coordenação', 'Administração da Plataforma'], {
    errorMap: () => ({ message: 'Selecione um remetente válido' }),
  }),
  badge: z.enum(['Urgente', 'Informativo', 'Evento'], {
    errorMap: () => ({ message: 'Selecione uma badge de destaque válida' }),
  }),
  title: z
    .string()
    .min(5, 'O título deve ter no mínimo 5 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  message: z
    .string()
    .min(10, 'A mensagem deve ter no mínimo 10 caracteres')
    .max(1000, 'A mensagem deve ter no máximo 1000 caracteres'),
});

export type NoticeFormValues = z.infer<typeof noticeSchema>;
