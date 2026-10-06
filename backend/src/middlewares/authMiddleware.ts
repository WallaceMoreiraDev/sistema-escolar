import { MiddlewareHandler } from "hono";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { AppError } from "../utils/AppError";
import { validateEnv } from "../env";

// Extend Hono's Context Variables to include the authenticated Supabase client and User
export type Variables = {
  supabase: SupabaseClient;
  user: User;
};

export const authMiddleware: MiddlewareHandler<{ Variables: Variables }> = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("AUTH_UNAUTHORIZED", 401, "Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];

  // Cloudflare Workers pass environment variables via c.env
  // We validate them here to ensure they exist before trying to connect
  const env = validateEnv(c.env);

  // Instantiating the Supabase client PER REQUEST using the user's JWT
  // This ensures RLS (Row Level Security) is properly enforced by the database
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Verify if the token is valid by getting the user profile
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AppError("AUTH_UNAUTHORIZED", 401, "Invalid token or user not found");
  }

  // Inject the client and user into Hono's context so controllers/repositories can use them
  c.set("supabase", supabase);
  c.set("user", user);

  await next();
};
