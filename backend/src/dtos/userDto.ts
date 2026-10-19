import { UserProfileDTO, UserRole, AnoTurma, TurnoTurma } from '@shared/types';

export type RawTurmaJoin = {
  id: string;
  nome_oficial: string;
  codigo_convite?: string | null;
  ano?: AnoTurma | null;
  curso?: string | null;
  turno?: TurnoTurma | null;
  local_sala?: string | null;
};

export type RawUserWithTurma = {
  id: string;
  nome: string;
  email: string;
  role: string | null;
  onboarding_concluido: boolean;
  turmas: RawTurmaJoin | RawTurmaJoin[] | null;
};

/**
 * Data Transfer Object Mapper (GEMINI.md Seção 4: DTOs e Boundary Mapping).
 * Converte as entidades cruas do banco (snake_case) para o contrato DTO (camelCase)
 * sem expor dados internos e garantindo conformidade com a tipagem compartilhada.
 */
export class UserDTO {
  static toProfile(raw: RawUserWithTurma): UserProfileDTO {
    const turmaRaw = Array.isArray(raw.turmas) ? raw.turmas[0] : raw.turmas;

    return {
      id: raw.id,
      nome: raw.nome,
      email: raw.email,
      role: (raw.role as UserRole) || 'ALUNO',
      onboardingConcluido: raw.onboarding_concluido,
      turma: turmaRaw
        ? {
            id: turmaRaw.id,
            nomeOficial: turmaRaw.nome_oficial,
            codigoConvite: turmaRaw.codigo_convite ?? null,
            ano: turmaRaw.ano ?? null,
            curso: turmaRaw.curso ?? null,
            turno: turmaRaw.turno ?? null,
            localSala: turmaRaw.local_sala ?? null,
          }
        : null,
    };
  }
}
