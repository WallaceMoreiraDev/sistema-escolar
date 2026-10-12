import { MiddlewareHandler } from "hono";
import { ZodError } from "zod";

export type ValidatedBody<T> = {
  validBody: T;
};

export interface ParseableSchema<T> {
  parse(data: unknown): T;
}

type ZodLikeIssue = {
  path: (string | number)[];
  message: string;
};

type ZodLikeError = {
  issues: ZodLikeIssue[];
};

/**
 * Middleware genérico para validação de payload com Zod (GEMINI.md Seções 4 e 6).
 * Utiliza 'unknown' para payloads não confiáveis (zero 'any') e padroniza erros de validação.
 */
export const validateBody = <T>(
  schema: ParseableSchema<T>
): MiddlewareHandler<{ Variables: ValidatedBody<T> }> => {
  return async (c, next) => {
    try {
      const raw: unknown = await c.req.json();
      const parsed = schema.parse(raw);
      c.set("validBody", parsed);
      await next();
    } catch (err) {
      if (
        err instanceof ZodError ||
        (err instanceof Error &&
          "issues" in err &&
          Array.isArray((err as unknown as ZodLikeError).issues))
      ) {
        const issues = (err as unknown as ZodLikeError).issues;
        return c.json(
          {
            success: false,
            code: "VALIDATION_ERROR",
            details: issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          400
        );
      }
      throw err;
    }
  };
};
