import { z } from 'zod';

// ============================================================================
// Schemas Oficiais do Fluxo de Turmas (GEMINI.md - camelCase em Português)
// ============================================================================

export const anoTurmaEnum = z.enum(['1º', '2º', '3º'], {
  errorMap: () => ({ message: 'Selecione um ano válido (1º, 2º ou 3º).' }),
});

export const turnoTurmaEnum = z.enum(['Manhã', 'Tarde', 'Noite', 'Integral'], {
  errorMap: () => ({ message: 'Selecione um turno válido (Manhã, Tarde, Noite ou Integral).' }),
});

export const pedidoStatusEnum = z.enum(['pendente', 'aprovado', 'rejeitado'], {
  errorMap: () => ({ message: 'Status do pedido inválido.' }),
});

export const createClassRequestSchema = z.object({
  ano: anoTurmaEnum,
  turno: turnoTurmaEnum,
  curso: z
    .string({ required_error: 'O curso é obrigatório.' })
    .trim()
    .min(3, 'O curso deve ter no mínimo 3 caracteres.')
    .max(255, 'O curso deve ter no máximo 255 caracteres.'),
  localSala: z
    .string()
    .trim()
    .max(255, 'O local/sala deve ter no máximo 255 caracteres.')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  justificativa: z
    .string()
    .trim()
    .max(1000, 'A justificativa deve ter no máximo 1000 caracteres.')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export type CreateClassRequestInput = z.infer<typeof createClassRequestSchema>;
export type CreateClassRequestFormInput = z.input<typeof createClassRequestSchema>;

// ============================================================================
// Schemas de Moderação e Aprovação de Turma (Admin Geral - GEMINI.md)
// ============================================================================

export const approveClassRequestSchema = z.object({
  nomeOficial: z
    .string()
    .trim()
    .min(3, 'O nome oficial da turma deve ter no mínimo 3 caracteres.')
    .max(255, 'O nome oficial da turma deve ter no máximo 255 caracteres.')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  codigoConvite: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9]{6}$/,
      'O código de convite deve ter exatamente 6 caracteres alfanuméricos.'
    )
    .transform((val) => val.toUpperCase())
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
});

export const classRequestIdParamSchema = z.object({
  id: z.string().uuid('ID do pedido de turma inválido.'),
});

export const adminClassPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'A página deve ser maior ou igual a 1.').default(1),
});

export type ApproveClassRequestInput = z.infer<typeof approveClassRequestSchema>;
export type ClassRequestIdParam = z.infer<typeof classRequestIdParamSchema>;
export type AdminClassPaginationQuery = z.infer<typeof adminClassPaginationQuerySchema>;

// ============================================================================
// Schemas de Ingresso na Turma via Código de Convite (Etapa 3 - GEMINI.md)
// ============================================================================

export const joinClassSchema = z.object({
  codigoConvite: z
    .string({ required_error: 'O código de convite é obrigatório.' })
    .trim()
    .regex(
      /^[A-Za-z0-9]{6}$/,
      'O código de convite deve ter exatamente 6 caracteres alfanuméricos.'
    )
    .transform((val) => val.toUpperCase()),
});

export type JoinClassInput = z.infer<typeof joinClassSchema>;

// ============================================================================
// Schemas da Gestão de Membros da Turma (Fase 1 - GEMINI.md)
// ============================================================================

export const classMembersPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'A página deve ser maior ou igual a 1.').default(1),
});

export type ClassMembersPaginationQuery = z.infer<typeof classMembersPaginationQuerySchema>;

// ============================================================================
// Schemas da Moderação de Membros da Turma (Fase 2 - GEMINI.md)
// ============================================================================

export const classMemberIdParamSchema = z.object({
  id: z.string().uuid('ID do membro deve ser um UUID válido.'),
});

export type ClassMemberIdParam = z.infer<typeof classMemberIdParamSchema>;
