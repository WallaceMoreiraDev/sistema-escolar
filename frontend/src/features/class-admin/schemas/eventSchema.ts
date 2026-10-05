import { z } from 'zod';

export const eventSchema = z.object({
  subject: z.string().min(2, "A matéria deve ter no mínimo 2 caracteres"),
  category: z.enum(['Prova', 'Trabalho', 'Tarefa'], {
    required_error: "Selecione uma categoria",
  }),
  dueDate: z.string().min(1, "A data e horário limite são obrigatórios"),
  description: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
