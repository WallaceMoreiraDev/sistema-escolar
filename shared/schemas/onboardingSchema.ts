import { z } from 'zod';

export const onboardingSchema = z.object({
  nome: z
    .string()
    .min(3, "O nome deve ter no mínimo 3 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres.")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "O nome deve conter apenas letras e espaços.")
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
