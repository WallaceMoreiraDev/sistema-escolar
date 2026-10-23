import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorHandler } from "./middlewares/errorMiddleware";
import { Variables } from "./middlewares/authMiddleware";
import { EnvConfig } from "./env";
import { userRoutes } from "./routes/userRoutes";
import { noticeRoutes } from "./routes/noticeRoutes";
import { classRoutes } from "./routes/classRoutes";
import { eventRoutes } from "./routes/eventRoutes";
import { linkRoutes } from "./routes/linkRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { fundingRoutes } from "./routes/fundingRoutes";

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
app.route("/api/avisos", noticeRoutes);
app.route("/api/turmas/eventos", eventRoutes);
app.route("/api/turmas/links", linkRoutes);
app.route("/api/turmas", classRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/financiamento", fundingRoutes);


export default app;
