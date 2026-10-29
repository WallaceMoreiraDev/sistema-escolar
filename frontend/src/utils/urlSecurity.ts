const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

export function isSafeUrl(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();

  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeSafeUrl(rawUrl?: string | null): string {
  return isSafeUrl(rawUrl) ? rawUrl!.trim() : '#';
}
