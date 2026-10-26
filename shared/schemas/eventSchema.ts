import { z } from 'zod';

export const eventoCategoriaEnum = z.enum(['Prova', 'Trabalho', 'Tarefa', 'Aviso'], {
  errorMap: () => ({ message: 'Categoria inválida. Opções válidas: Prova, Trabalho, Tarefa, Aviso.' }),
});

export type EventoCategoriaSchema = z.infer<typeof eventoCategoriaEnum>;

/**
 * Schema de validação para links externos de apoio da atividade.
 */
export const eventLinkSchema = z.object({
  titulo: z
    .string({ required_error: 'O título do link é obrigatório.' })
    .trim()
    .min(1, 'O título do link deve ter no mínimo 1 caractere.')
    .max(100, 'O título do link deve ter no máximo 100 caracteres.'),
  url: z
    .string({ required_error: 'A URL do link é obrigatória.' })
    .trim()
    .url('A URL do link deve ser válida.')
    .max(500, 'A URL do link deve ter no máximo 500 caracteres.'),
});

export type EventLinkInput = z.infer<typeof eventLinkSchema>;

/**
 * Schema de validação para criação de eventos da turma (POST /api/turmas/eventos).
 */
export const createEventSchema = z.object({
  materia: z
    .string({ required_error: 'A matéria é obrigatória.' })
    .trim()
    .min(2, 'A matéria deve ter no mínimo 2 caracteres.')
    .max(100, 'A matéria deve ter no máximo 100 caracteres.'),
  categoria: eventoCategoriaEnum,
  dataHoraLimite: z
    .string({ required_error: 'A data e horário limite são obrigatórios.' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'A data e horário limite devem estar em formato de data/hora válido (ISO 8601 UTC).',
    }),
  descricao: z
    .string()
    .trim()
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres.')
    .nullable()
    .optional(),
  anexoUrl: z
    .string()
    .trim()
    .url('A URL do anexo deve ser válida.')
    .max(500, 'A URL do anexo deve ter no máximo 500 caracteres.')
    .nullable()
    .optional(),
  links: z
    .array(eventLinkSchema)
    .max(2, 'No máximo 2 links permitidos.')
    .optional()
    .default([]),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

/**
 * Schema de validação para atualização parcial de evento (PUT /api/turmas/eventos/:id).
 */
export const updateEventSchema = createEventSchema.partial();

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

/**
 * Schema de validação de parâmetro de rota :id do evento.
 */
export const eventIdParamSchema = z.object({
  id: z.string().uuid('ID do evento deve ser um UUID válido.'),
});

export type EventIdParam = z.infer<typeof eventIdParamSchema>;

/**
 * Schema de validação para rotas de anexos compostas por :id (evento) e :anexoId.
 */
export const attachmentParamSchema = z.object({
  id: z.string().uuid('ID do evento deve ser um UUID válido.'),
  anexoId: z.string().uuid('ID do anexo deve ser um UUID válido.'),
});

export type AttachmentParam = z.infer<typeof attachmentParamSchema>;

/**
 * Schema de validação de query params para listagem de eventos por período (GET /api/turmas/eventos).
 * REGRA CRÍTICA DE DOMÍNIO (GEMINI.md Seção 1 e Seção 9):
 * Limite matemático estrito de diferença máxima de 45 dias entre startDate e endDate.
 */
export const listEventsQuerySchema = z
  .object({
    startDate: z
      .string({ required_error: 'startDate é obrigatório.' })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'startDate deve ser uma data válida.',
      }),
    endDate: z
      .string({ required_error: 'endDate é obrigatório.' })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'endDate deve ser uma data válida.',
      }),
    turmaId: z
      .string()
      .uuid('turmaId deve ser um UUID válido.')
      .optional(),
  })
  .refine(
    (data) => new Date(data.endDate).getTime() >= new Date(data.startDate).getTime(),
    {
      message: 'endDate deve ser posterior ou igual a startDate.',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate).getTime();
      const end = new Date(data.endDate).getTime();
      const diffMs = end - start;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays <= 45;
    },
    {
      message: 'O intervalo entre startDate e endDate não pode exceder 45 dias.',
      path: ['endDate'],
    }
  );

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

// ============================================================================
// Schemas Legados de Formulário (Preservados para compatibilidade do Frontend)
// ============================================================================

export const eventSchema = z.object({
  subject: z.string().min(2, 'A matéria deve ter no mínimo 2 caracteres'),
  category: z.enum(['Prova', 'Trabalho', 'Tarefa', 'Lembrete'], {
    required_error: 'Selecione uma categoria',
  }),
  dueDate: z.string().min(1, 'A data e horário limite são obrigatórios'),
  description: z.string().optional(),
  attachment: z.any().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
