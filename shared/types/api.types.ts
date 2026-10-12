/**
 * Contratos padronizados de resposta HTTP (GEMINI.md Seção 3).
 * Envelope de Sucesso: { success: true, data: T, meta?: { pagination?: ... } }
 * Envelope de Erro: { success: false, code: string, message?: string, details?: [...] }
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  code: string;
  message?: string;
  details?: ApiErrorDetail[];
}
