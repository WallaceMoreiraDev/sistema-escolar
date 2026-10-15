import { Database } from './database.types';

export type AnoTurma = Database['public']['Enums']['ano_type'];
export type TurnoTurma = Database['public']['Enums']['turno_type'];
export type PedidoStatus = Database['public']['Enums']['pedido_status'];

/**
 * DTO Oficial de Solicitação de Criação de Turma mapeado para camelCase (GEMINI.md Seções 2 e 4).
 * SSOT compartilhado entre Backend e Frontend.
 */
export interface ClassRequestDTO {
  id: string;
  usuarioId: string;
  ano: AnoTurma;
  turno: TurnoTurma;
  curso: string;
  localSala: string | null;
  justificativa: string | null;
  status: PedidoStatus;
  createdAt: string; // ISO 8601 UTC
}

/**
 * Payload para envio de solicitação de turma pelo aluno (POST /api/turmas/pedidos).
 */
export interface CreateClassRequestPayload {
  ano: AnoTurma;
  turno: TurnoTurma;
  curso: string;
  localSala?: string | null;
  justificativa?: string | null;
}

/**
  * DTO Oficial para a visualização do Administrador Geral na fila de moderação.
  * Inclui os dados do aluno solicitante (join com usuarios).
  */
export interface AdminClassRequestDTO extends ClassRequestDTO {
  solicitante: {
    id: string;
    nome: string;
    email: string;
  };
}

/**
  * Payload para aprovação de pedido de turma (POST /api/admin/pedidos-turma/:id/aprovar).
  */
export interface ApproveClassRequestPayload {
  nomeOficial?: string;
  codigoConvite?: string;
}

/**
  * Resposta de sucesso na aprovação de turma.
  */
export interface ApproveClassRequestResponse {
  turmaId: string;
  nomeOficial: string;
  codigoConvite: string;
}
