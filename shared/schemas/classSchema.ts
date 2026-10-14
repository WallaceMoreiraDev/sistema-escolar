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
  ano: z.preprocess((val) => {
    if (val === '1') return '1º';
    if (val === '2') return '2º';
    if (val === '3') return '3º';
    return val;
  }, anoTurmaEnum),
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
