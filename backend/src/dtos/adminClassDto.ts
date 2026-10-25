import { Database } from '@shared/types/database.types';
import {
  AdminClassRequestDTO,
  ActiveClassDTO,
  AnoTurma,
  TurnoTurma,
  PedidoStatus,
} from '@shared/types/class.types';


export type RawAdminPedidoTurma = Database['public']['Tables']['pedidos_turma']['Row'] & {
  usuarios:
    | {
        id: string;
        nome: string;
        email: string;
      }
    | {
        id: string;
        nome: string;
        email: string;
      }[]
    | null;
};

/**
 * Data Transfer Object Mapper para Moderação de Turmas pelo Administrador Geral (GEMINI.md Seções 2 e 4).
 * Mapeia snake_case com join de usuários para camelCase na API HTTP.
 */
export class AdminClassDTOConverter {
  static toAdminRequestDTO(raw: RawAdminPedidoTurma): AdminClassRequestDTO {
    let solicitante = {
      id: raw.usuario_id,
      nome: 'Aluno Solicitante',
      email: '',
    };

    if (Array.isArray(raw.usuarios) && raw.usuarios.length > 0) {
      solicitante = {
        id: raw.usuarios[0].id,
        nome: raw.usuarios[0].nome,
        email: raw.usuarios[0].email,
      };
    } else if (raw.usuarios && !Array.isArray(raw.usuarios)) {
      solicitante = {
        id: raw.usuarios.id,
        nome: raw.usuarios.nome,
        email: raw.usuarios.email,
      };
    }

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
      solicitante,
    };
  }

  static toAdminRequestDTOList(rawList: RawAdminPedidoTurma[]): AdminClassRequestDTO[] {
    return rawList.map((item) => this.toAdminRequestDTO(item));
  }
}

export type RawActiveClass = Database['public']['Tables']['turmas']['Row'] & {
  usuarios?:
    | { count: number }[]
    | { count: number }
    | null;
};

/**
 * Data Transfer Object Mapper para Turmas Ativas no painel de Administrador Geral.
 */
export class ActiveClassDTOConverter {
  static toDTO(raw: RawActiveClass): ActiveClassDTO {
    let activeMembers = 0;
    if (Array.isArray(raw.usuarios) && raw.usuarios.length > 0) {
      activeMembers = raw.usuarios[0].count ?? 0;
    } else if (raw.usuarios && typeof raw.usuarios === 'object' && 'count' in raw.usuarios) {
      activeMembers = (raw.usuarios as { count: number }).count ?? 0;
    }

    const dataCriacao = raw.data_criacao || new Date().toISOString();

    return {
      id: raw.id,
      nomeOficial: raw.nome_oficial,
      codigoConvite: raw.codigo_convite,
      ano: raw.ano as AnoTurma,
      curso: raw.curso,
      turno: raw.turno as TurnoTurma,
      localSala: raw.local_sala,
      dataCriacao,
      activeMembers,
      // Campos opcionais de conveniência/compatibilidade
      name: raw.nome_oficial,
      shift: raw.turno as TurnoTurma,
      createdAt: dataCriacao,
    };
  }

  static toDTOList(rawList: RawActiveClass[]): ActiveClassDTO[] {
    return rawList.map((item) => this.toDTO(item));
  }
}

