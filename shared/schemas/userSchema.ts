import { z } from 'zod';

export const updateSubgrupoSchema = z.object({
  subgrupo: z.enum(['GERAL', 'TURMA_A', 'TURMA_B'], {
    errorMap: () => ({ message: 'Subgrupo inválido. Escolha entre GERAL, TURMA_A ou TURMA_B.' }),
  }),
});

export type UpdateSubgrupoInput = z.infer<typeof updateSubgrupoSchema>;
