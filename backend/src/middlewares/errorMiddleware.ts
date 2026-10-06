import { ErrorHandler } from "hono";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[Error] ${c.req.method} ${c.req.url}:`, err);

  if (err instanceof AppError) {
    // Hono typing for status codes is strict, but setting it via Response or c.status works
    c.status(err.statusCode as any);
    return c.json({
      success: false,
      code: err.code,
      message: err.message, // Used mostly for internal logs, frontend relies on 'code'
    });
  }

  if (err instanceof ZodError) {
    c.status(400);
    return c.json({
      success: false,
      code: "VALIDATION_ERROR",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Fallback for unexpected errors
  c.status(500);
  return c.json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};
