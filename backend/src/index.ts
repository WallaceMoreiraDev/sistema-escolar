import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorHandler } from "./middlewares/errorMiddleware";
import { authMiddleware, Variables } from "./middlewares/authMiddleware";
import { EnvConfig } from "./env";
import { userRoutes } from "./routes/userRoutes";

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

// Register Route Groups
app.route("/api/me", userRoutes);

export default app;
