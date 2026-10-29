/**
 * Erro customizado para encapsular respostas de erro padronizadas da API Node.js.
 * Transporta o código de erro tipado (code) e o status HTTP retornado pelo backend.
 */
export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(
    code: string,
    status: number,
    details?: unknown,
    message?: string
  ) {
    super(message || code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  // Alias retrocompatível com statusCode
  get statusCode(): number {
    return this.status;
  }
}
