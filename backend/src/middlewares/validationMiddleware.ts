import { MiddlewareHandler } from "hono";
import { ZodError } from "zod";

export type ValidatedBody<T> = {
  validBody: T;
};

export type ValidatedParams<T> = {
  validParams: T;
};

export type ValidatedQuery<T> = {
  validQuery: T;
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

const formatZodErrorResponse = (err: unknown) => {
  if (
    err instanceof ZodError ||
    (err instanceof Error &&
      "issues" in err &&
      Array.isArray((err as unknown as ZodLikeError).issues))
  ) {
    const issues = (err as unknown as ZodLikeError).issues;
    return {
      success: false as const,
      code: "VALIDATION_ERROR",
      details: issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  return null;
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
      const errorResponse = formatZodErrorResponse(err);
      if (errorResponse) {
        return c.json(errorResponse, 400);
      }
      throw err;
    }
  };
};

/**
 * Middleware genérico para validação de route params (:id, etc.) com Zod.
 */
export const validateParam = <T>(
  schema: ParseableSchema<T>
): MiddlewareHandler<{ Variables: ValidatedParams<T> }> => {
  return async (c, next) => {
    try {
      const raw: unknown = c.req.param();
      const parsed = schema.parse(raw);
      c.set("validParams", parsed);
      await next();
    } catch (err) {
      const errorResponse = formatZodErrorResponse(err);
      if (errorResponse) {
        return c.json(errorResponse, 400);
      }
      throw err;
    }
  };
};

/**
 * Middleware genérico para validação de query parameters (?page=1, etc.) com Zod.
 */
export const validateQuery = <T>(
  schema: ParseableSchema<T>
): MiddlewareHandler<{ Variables: ValidatedQuery<T> }> => {
  return async (c, next) => {
    try {
      const raw: unknown = c.req.query();
      const parsed = schema.parse(raw);
      c.set("validQuery", parsed);
      await next();
    } catch (err) {
      const errorResponse = formatZodErrorResponse(err);
      if (errorResponse) {
        return c.json(errorResponse, 400);
      }
      throw err;
    }
  };
};
