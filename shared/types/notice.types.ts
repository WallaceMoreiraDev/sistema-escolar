import { Database } from './database.types';

export type AvisoRemetente = Database['public']['Enums']['aviso_remetente'];
export type AvisoBadge = Database['public']['Enums']['aviso_badge'];

/**
 * DTO Oficial de Aviso Geral mapeado para camelCase (GEMINI.md Seções 2 e 4).
 * SSOT compartilhado entre Backend e Frontend.
 */
export interface NoticeDTO {
  id: string;
  titulo: string;
  mensagem: string;
  remetente: AvisoRemetente;
  badgeDestaque: AvisoBadge;
  dataPostagem: string; // ISO 8601 UTC
}

/**
 * Payload para criação de aviso geral.
 */
export interface CreateNoticePayload {
  titulo: string;
  mensagem: string;
  remetente: AvisoRemetente;
  badgeDestaque: AvisoBadge;
}

/**
 * Payload para edição de aviso geral.
 */
export type UpdateNoticePayload = CreateNoticePayload;
