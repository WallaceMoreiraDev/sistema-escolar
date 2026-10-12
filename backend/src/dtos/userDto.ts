import { UserProfileDTO, UserRole } from '@shared/types/user.types';

export type RawTurmaJoin = {
  id: string;
  nome_oficial: string;
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
          }
        : null,
    };
  }
}
