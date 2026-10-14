import { Database } from '@shared/types/database.types';
import { ClassRequestDTO, AnoTurma, TurnoTurma, PedidoStatus } from '@shared/types/class.types';

export type RawPedidoTurma = Database['public']['Tables']['pedidos_turma']['Row'];

/**
 * Data Transfer Object Mapper para Solicitações de Turma (GEMINI.md Seção 2 e Seção 4).
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
    return rawList.map(this.toRequestDTO);
  }
}
