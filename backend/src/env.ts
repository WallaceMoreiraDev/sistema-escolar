import { z } from "zod";

export const envSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  GEMINI_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(env: unknown): EnvConfig {
  const mergedEnv = {
    ...(typeof process !== 'undefined' && process.env ? process.env : {}),
    ...(typeof env === 'object' && env !== null ? env : {}),
  };

  const parsed = envSchema.safeParse(mergedEnv);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten());
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}
