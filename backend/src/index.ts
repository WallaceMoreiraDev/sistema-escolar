import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorHandler } from "./middlewares/errorMiddleware";
import { authMiddleware, Variables } from "./middlewares/authMiddleware";
import { EnvConfig } from "./env";

// Define the Bindings (Env Vars) and Variables (Context State) for the app
type AppBindings = {
  Bindings: EnvConfig;
  Variables: Variables;
};

const app = new Hono<AppBindings>();

// Setup Global Middlewares
app.use("*", logger());
app.use("*", cors());

// Setup Global Error Handler
app.onError(errorHandler);

// Public Health Check Route
app.get("/health", (c) => {
  return c.json({ success: true, message: "Backend is running and healthy!" });
});

// Example pattern for protected routes (to be moved to /routes later)
// app.get("/api/me", authMiddleware, (c) => {
//   const user = c.get("user");
//   return c.json({ success: true, data: user });
// });

export default app;
