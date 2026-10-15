/**
 * Dicionário oficial de mapeamento de códigos de erro do backend para mensagens amigáveis em pt-BR.
 * Mandatório conforme GEMINI.md Seção 3 (Exception Propagation e Códigos de Erro).
 */
export const errorMessages: Record<string, string> = {
  // Fluxo de Autenticação e Usuário
  UNAUTHORIZED: 'Sessão expirada ou não autorizada. Por favor, realize login novamente.',
  FORBIDDEN: 'Você não possui permissão para realizar esta operação.',
  USER_NOT_FOUND: 'Usuário não encontrado no sistema.',
  AUTH_INVALID_TOKEN: 'Token de autenticação inválido ou corrompido.',
  AUTH_REQUIRED: 'Autenticação necessária para acessar este recurso.',

  // Fluxo de Turmas (Solicitação e Moderação)
  ALREADY_IN_CLASS: 'Você já está vinculado a uma turma e não pode solicitar uma nova.',
  CLASS_REQUEST_DUPLICATE: 'Você já possui uma solicitação de turma em andamento. Aguarde a avaliação do administrador da plataforma.',
  INVITE_CODE_ALREADY_EXISTS: 'O código de convite informado já está em uso por outra turma.',
  AUTH_FORBIDDEN: 'Acesso negado. Apenas o Administrador Geral pode executar esta moderação.',
  NOT_FOUND: 'O recurso solicitado não foi encontrado ou já foi processado.',
  CLASS_NOT_FOUND: 'Turma não encontrada.',
  INVALID_INVITE_CODE: 'Código de convite inválido ou expirado.',

  // Validação e Genéricos
  VALIDATION_ERROR: 'Por favor, revise os dados preenchidos no formulário.',
  INTERNAL_SERVER_ERROR: 'Ocorreu um erro interno no servidor. Tente novamente em instantes.',
  UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
};

/**
 * Retorna uma mensagem amigável a partir do código tipado recebido da API.
 */
export function getErrorMessage(code?: string, fallback = errorMessages.UNKNOWN_ERROR): string {
  if (!code) return fallback;
  return errorMessages[code] || fallback;
}
