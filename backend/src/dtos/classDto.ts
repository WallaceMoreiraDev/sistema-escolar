import { Database } from '@shared/types/database.types';
import {
  ClassRequestDTO,
  ClassMemberDTO,
  AnoTurma,
  TurnoTurma,
  PedidoStatus,
} from '@shared/types/class.types';
import { UserRole } from '@shared/types/user.types';

export type RawPedidoTurma = Database['public']['Tables']['pedidos_turma']['Row'];

export type RawClassMember = Pick<
  Database['public']['Tables']['usuarios']['Row'],
  'id' | 'nome' | 'email' | 'role' | 'data_entrada_turma'
>;

/**
 * Data Transfer Object Mapper para Solicitações e Membros de Turma (GEMINI.md Seção 2 e Seção 4).
 * Mapeia snake_case do banco de dados para camelCase na API HTTP.
 */
export class ClassDTOConverter {
  static toRequestDTO(raw: RawPedidoTurma): ClassRequestDTO {
    return {
      id: raw.id,
      usuarioId: raw.usuario_id,
      ano: raw.ano as AnoTurma,
      turno: raw.turno as TurnoTurma,
      curso: raw.curso,
      localSala: raw.local_sala,
      justificativa: raw.justificativa,
      status: (raw.status as PedidoStatus) || 'pendente',
      createdAt: raw.created_at,
    };
  }

  static toRequestDTOList(rawList: RawPedidoTurma[]): ClassRequestDTO[] {
    return rawList.map((item) => this.toRequestDTO(item));
  }

  static toMemberDTO(raw: RawClassMember): ClassMemberDTO {
    return {
      id: raw.id,
      nome: raw.nome,
      email: raw.email,
      role: (raw.role as UserRole) || 'ALUNO',
      dataEntradaTurma: raw.data_entrada_turma,
    };
  }

  static toMemberDTOList(rawList: RawClassMember[]): ClassMemberDTO[] {
    return rawList.map((item) => this.toMemberDTO(item));
  }
}
