import { z } from 'zod';

export const updateFundingSchema = z.object({
  metaArrecadadaMes: z
    .number({
      required_error: 'O valor arrecadado é obrigatório.',
      invalid_type_error: 'O valor arrecadado deve ser um número.',
    })
    .min(0, 'O valor arrecadado não pode ser negativo.')
    .max(100000, 'O valor arrecadado excede o limite permitido.'),
});

export type UpdateFundingInput = z.infer<typeof updateFundingSchema>;
