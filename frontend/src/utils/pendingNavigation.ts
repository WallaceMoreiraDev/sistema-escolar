/**
 * Utilitário de persistência temporária via localStorage para o fluxo de
 * convite direto (/convite/:codigo) e preservação de redirect pós-login.
 *
 * Usa localStorage (em vez de sessionStorage) para sobreviver ao fluxo de
 * redirecionamento externo do Google OAuth em navegadores móveis (iOS Safari / Chrome Android),
 * sempre com TTL de 30 minutos para evitar dados obsoletos.
 */

const PENDING_INVITE_KEY = 'prumo_pending_invite_code';
const POST_LOGIN_REDIRECT_KEY = 'prumo_post_login_redirect';
const PENDING_NAVIGATION_TTL_MS = 30 * 60 * 1000; // 30 minutos

interface StoredInvitePayload {
  code: string;
  expiresAt: number;
}

interface StoredRedirectPayload {
  path: string;
  expiresAt: number;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isStoredInvitePayload(value: unknown): value is StoredInvitePayload {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.code === 'string' &&
    record.code.trim().length > 0 &&
    typeof record.expiresAt === 'number' &&
    Number.isFinite(record.expiresAt)
  );
}

function isStoredRedirectPayload(value: unknown): value is StoredRedirectPayload {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.path === 'string' &&
    record.path.trim().length > 0 &&
    typeof record.expiresAt === 'number' &&
    Number.isFinite(record.expiresAt)
  );
}

/**
 * Validação estrita Anti-Open-Redirect:
 * Aceita exclusivamente caminhos internos da área autenticada que iniciem com '/app/'
 * e rejeita URLs externas, protocol-relative ('//'), backslashes ou caracteres de controle.
 */
function isValidInternalAppPath(path: string): boolean {
  const trimmed = path.trim();
  if (!trimmed.startsWith('/app/')) return false;
  if (trimmed.startsWith('//')) return false;
  if (trimmed.includes('\\') || /[\r\n]/.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed, 'http://prumo.local');
    return parsed.origin === 'http://prumo.local' && parsed.pathname.startsWith('/app/');
  } catch {
    return false;
  }
}

/**
 * Salva o código de convite normalizado em caixa alta com expiração de 30 minutos.
 */
export function savePendingInviteCode(code: string): void {
  const storage = getStorage();
  if (!storage) return;

  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    clearPendingInviteCode();
    return;
  }

  const payload: StoredInvitePayload = {
    code: normalized,
    expiresAt: Date.now() + PENDING_NAVIGATION_TTL_MS,
  };

  try {
    storage.setItem(PENDING_INVITE_KEY, JSON.stringify(payload));
  } catch {
    // Falha silenciosa em ambientes com quota esgotada ou modo privado restrito
  }
}

/**
 * Recupera o código de convite pendente se válido e dentro da janela de expiração.
 * Limpa automaticamente registros expirados ou malformados.
 */
export function getPendingInviteCode(): string | null {
  const storage = getStorage();
  if (!storage) return null;

  let raw: string | null = null;
  try {
    raw = storage.getItem(PENDING_INVITE_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  const parsed = safeParseJson(raw);
  if (!isStoredInvitePayload(parsed) || Date.now() > parsed.expiresAt) {
    clearPendingInviteCode();
    return null;
  }

  return parsed.code.trim().toUpperCase();
}

/**
 * Remove o código de convite pendente armazenado.
 */
export function clearPendingInviteCode(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(PENDING_INVITE_KEY);
  } catch {
    // Ignora falhas de acesso ao storage
  }
}

/**
 * Salva um destino interno seguro ('/app/...') para retorno automático após o login.
 */
export function savePostLoginRedirect(path: string): void {
  const storage = getStorage();
  if (!storage) return;

  const trimmed = path.trim();
  if (!isValidInternalAppPath(trimmed)) return;

  const payload: StoredRedirectPayload = {
    path: trimmed,
    expiresAt: Date.now() + PENDING_NAVIGATION_TTL_MS,
  };

  try {
    storage.setItem(POST_LOGIN_REDIRECT_KEY, JSON.stringify(payload));
  } catch {
    // Falha silenciosa em ambientes com storage restrito
  }
}

/**
 * Consulta (sem remover) o destino pós-login salvo, validando expiração e segurança.
 * Limpa automaticamente caso esteja expirado ou corrompido.
 */
export function getPostLoginRedirect(): string | null {
  const storage = getStorage();
  if (!storage) return null;

  let raw: string | null = null;
  try {
    raw = storage.getItem(POST_LOGIN_REDIRECT_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  const parsed = safeParseJson(raw);
  if (
    !isStoredRedirectPayload(parsed) ||
    Date.now() > parsed.expiresAt ||
    !isValidInternalAppPath(parsed.path)
  ) {
    try {
      storage.removeItem(POST_LOGIN_REDIRECT_KEY);
    } catch {
      // Ignora falhas de remoção
    }
    return null;
  }

  return parsed.path.trim();
}

/**
 * Lê, remove imediatamente e retorna o destino pós-login caso ainda seja válido e não expirado.
 */
export function consumePostLoginRedirect(): string | null {
  const storage = getStorage();
  if (!storage) return null;

  let raw: string | null = null;
  try {
    raw = storage.getItem(POST_LOGIN_REDIRECT_KEY);
    storage.removeItem(POST_LOGIN_REDIRECT_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  const parsed = safeParseJson(raw);
  if (
    !isStoredRedirectPayload(parsed) ||
    Date.now() > parsed.expiresAt ||
    !isValidInternalAppPath(parsed.path)
  ) {
    return null;
  }

  return parsed.path.trim();
}
