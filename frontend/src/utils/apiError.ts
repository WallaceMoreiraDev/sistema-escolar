import { ApiErrorDetail } from '@shared/types';

/**
 * Erro customizado para encapsular respostas de erro padronizadas da API Node.js/Hono.
 * Conforme o GEMINI.md Seção 3, transporta o código de erro tipado (code) retornado pelo backend.
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: ApiErrorDetail[],
    message?: string
  ) {
    super(message || code);
    this.name = 'ApiError';
  }
}
