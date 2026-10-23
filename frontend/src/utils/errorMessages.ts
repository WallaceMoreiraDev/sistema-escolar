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

  // Fluxo de Turmas (Solicitação, Moderação e Ingresso)
  ALREADY_IN_CLASS: 'Você já está vinculado a uma turma.',
  CLASS_REQUEST_DUPLICATE: 'Você já possui uma solicitação de turma em andamento. Aguarde a avaliação do administrador da plataforma.',
  INVITE_CODE_ALREADY_EXISTS: 'O código de convite informado já está em uso por outra turma.',
  AUTH_FORBIDDEN: 'Você não possui permissão para realizar esta operação de moderação.',
  NOT_FOUND: 'O recurso solicitado não foi encontrado ou já foi processado.',
  CLASS_NOT_FOUND: 'Turma não encontrada.',
  INVALID_INVITE_CODE: 'Código de convite inválido ou expirado.',
  LAST_LEADER_CONFLICT: 'A turma não pode ficar sem nenhum líder. Promova outro membro antes.',
  CANNOT_MODIFY_SELF: 'Você não pode realizar esta ação consigo mesmo pelo painel de moderação.',
  ALREADY_LEADER: 'O usuário já é um líder desta turma.',
  NOT_A_LEADER: 'O usuário não possui o cargo de líder.',
  CANNOT_ALTER_ADMIN: 'Administradores gerais não podem ter seu cargo alterado na turma.',
  USER_WITHOUT_CLASS: 'Você precisa estar enturmado para gerenciar eventos.',
  TURMA_REQUIRED: 'A identificação da turma é obrigatória para esta operação.',
  LAST_LEADER_CANNOT_LEAVE: 'Você é o único líder da turma. Promova outro membro a líder antes de sair da turma.',
  USER_ALREADY_WITHOUT_CLASS: 'Você já não pertence a nenhuma turma.',

  // Validação e Genéricos
  VALIDATION_ERROR: 'Por favor, revise os dados informados.',
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
