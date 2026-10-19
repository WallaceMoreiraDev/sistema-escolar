import { Database } from './database.types';

export type EventoCategoria = Database['public']['Enums']['evento_categoria'];

/**
 * DTO canônico de Evento da Turma mapeado para camelCase (GEMINI.md Seções 2 e 4).
 * SSOT compartilhado entre Backend e Frontend.
 */
export interface EventDTO {
  id: string;
  turmaId: string;
  materia: string;
  categoria: EventoCategoria;
  dataHoraLimite: string; // ISO 8601 UTC
  descricao: string | null;
  anexoUrl: string | null;
  criadoPor: string | null;
  createdAt: string | null; // ISO 8601 UTC
}

/**
 * Payload esperado para criação de novo evento de turma (POST /api/turmas/eventos).
 */
export interface CreateEventPayload {
  materia: string;
  categoria: EventoCategoria;
  dataHoraLimite: string;
  descricao?: string | null;
  anexoUrl?: string | null;
}

/**
 * Payload esperado para atualização parcial de evento existente (PUT /api/turmas/eventos/:id).
 */
export interface UpdateEventPayload {
  materia?: string;
  categoria?: EventoCategoria;
  dataHoraLimite?: string;
  descricao?: string | null;
  anexoUrl?: string | null;
}
