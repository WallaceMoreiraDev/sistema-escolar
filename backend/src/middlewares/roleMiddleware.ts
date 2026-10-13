import { MiddlewareHandler } from "hono";
import { UserRole } from "@shared/types/user.types";
import { AppError } from "../utils/AppError";
import { Variables } from "./authMiddleware";

/**
 * Middleware para controle de acesso baseado em perfis (GEMINI.md Seção 9: Middlewares como Único Guarda-Costas).
 * Interrompe a requisição com 403 AUTH_FORBIDDEN caso o usuário logado não possua a role permitida.
 */
export const requireRole = (
  allowedRoles: UserRole[]
): MiddlewareHandler<{ Variables: Variables }> => {
  return async (c, next) => {
    const supabase = c.get("supabase");
    const user = c.get("user");

    if (!user || !supabase) {
      throw new AppError("AUTH_UNAUTHORIZED", 401, "Usuário não autenticado.");
    }

    // Se já estiver cacheado no contexto da requisição, reutiliza
    let role = c.get("userRole");

    if (!role) {
      const { data, error } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !data || !data.role) {
        throw new AppError("AUTH_FORBIDDEN", 403, "Perfil do usuário não encontrado ou sem permissão.");
      }

      role = data.role as UserRole;
      c.set("userRole", role);
    }

    if (!allowedRoles.includes(role)) {
      throw new AppError("AUTH_FORBIDDEN", 403, "Acesso restrito para o perfil de usuário atual.");
    }

    await next();
  };
};
