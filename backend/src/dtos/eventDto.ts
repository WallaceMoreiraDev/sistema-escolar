import { Database, Json } from '@shared/types/database.types';
import {
  EventDTO,
  EventLinkDTO,
  EventAttachmentDTO,
} from '@shared/types/event.types';

export type RawEvent = Database['public']['Tables']['eventos']['Row'];
export type RawEventAttachment = Database['public']['Tables']['eventos_anexos']['Row'];

export type RawEventWithAttachments = RawEvent & {
  eventos_anexos?: RawEventAttachment[] | null;
};

/**
 * Data Transfer Object Mapper para Anexos Físicos de Eventos.
 */
export class EventAttachmentDTOConverter {
  static toDTO(raw: RawEventAttachment, downloadUrl?: string): EventAttachmentDTO {
    return {
      id: raw.id,
      eventoId: raw.evento_id,
      turmaId: raw.turma_id,
      nomeArquivo: raw.nome_arquivo,
      storagePath: raw.storage_path,
      tamanhoBytes: raw.tamanho_bytes,
      mimeType: raw.mime_type,
      downloadUrl,
      createdAt: raw.created_at,
    };
  }

  static toDTOList(rawList: RawEventAttachment[]): EventAttachmentDTO[] {
    return rawList.map((item) => EventAttachmentDTOConverter.toDTO(item));
  }
}

/**
 * Data Transfer Object Mapper (GEMINI.md Seção 4: DTOs e Boundary Mapping).
 * Mapeia as entidades cruas do banco (snake_case) para contratos da API (camelCase).
 */
export class EventDTOConverter {
  static parseLinks(rawLinks: Json | undefined | null): EventLinkDTO[] {
    if (Array.isArray(rawLinks)) {
      return rawLinks
        .filter((l): l is { titulo: string; url: string } =>
          typeof l === 'object' && l !== null && 'titulo' in l && 'url' in l
        )
        .map((l) => ({
          titulo: String(l.titulo),
          url: String(l.url),
        }));
    }
    return [];
  }

  static toDTO(raw: RawEventWithAttachments): EventDTO {
    const anexos = Array.isArray(raw.eventos_anexos)
      ? EventAttachmentDTOConverter.toDTOList(raw.eventos_anexos)
      : [];

    return {
      id: raw.id,
      turmaId: raw.turma_id,
      materia: raw.materia,
      categoria: raw.categoria,
      dataHoraLimite: raw.data_hora_limite,
      descricao: raw.descricao,
      anexoUrl: raw.anexo_url,
      links: EventDTOConverter.parseLinks(raw.links),
      anexos,
      criadoPor: raw.criado_por,
      createdAt: raw.created_at,
    };
  }

  static toDTOList(rawList: RawEventWithAttachments[]): EventDTO[] {
    return rawList.map(EventDTOConverter.toDTO);
  }
}

