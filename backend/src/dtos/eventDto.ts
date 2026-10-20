import { Database } from '@shared/types/database.types';
import { EventDTO } from '@shared/types/event.types';

export type RawEvent = Database['public']['Tables']['eventos']['Row'];

/**
 * Data Transfer Object Mapper (GEMINI.md Seção 4: DTOs e Boundary Mapping).
 * Mapeia as entidades cruas do banco (snake_case) para contratos da API (camelCase).
 */
export class EventDTOConverter {
  static toDTO(raw: RawEvent): EventDTO {
    return {
      id: raw.id,
      turmaId: raw.turma_id,
      materia: raw.materia,
      categoria: raw.categoria,
      dataHoraLimite: raw.data_hora_limite,
      descricao: raw.descricao,
      anexoUrl: raw.anexo_url,
      criadoPor: raw.criado_por,
      createdAt: raw.created_at,
    };
  }

  static toDTOList(rawList: RawEvent[]): EventDTO[] {
    return rawList.map(EventDTOConverter.toDTO);
  }
}
