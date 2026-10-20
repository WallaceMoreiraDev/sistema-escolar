import { Database } from './database.types';
import { AnoTurma, TurnoTurma } from './class.types';

export type UserRole = NonNullable<Database['public']['Enums']['user_role']>;

/**
 * Resumo dos dados da Turma mapeados para o DTO em camelCase (GEMINI.md Seção 2).
 */
export interface TurmaSummaryDTO {
  id: string;
  nomeOficial: string;
  codigoConvite?: string | null;
  ano?: AnoTurma | null;
  curso?: string | null;
  turno?: TurnoTurma | null;
  localSala?: string | null;
}

/**
 * Perfil do usuário autenticado retornado por GET /api/me e PUT /api/me/profile.
 * SSOT (Única Fonte da Verdade) consumida tanto pelo Backend quanto pelo Frontend.
 */
export interface UserProfileDTO {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  onboardingConcluido: boolean;
  turma: TurmaSummaryDTO | null;
}

/**
 * Payload esperado para atualização de perfil (Onboarding).
 */
export interface UpdateProfilePayload {
  nome: string;
}
