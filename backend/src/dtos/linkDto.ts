import { Database } from '@shared/types/database.types';
import { LinkDTO } from '@shared/types/link.types';

export type RawLink = Database['public']['Tables']['links_uteis']['Row'];

export class LinkDTOConverter {
  static toDTO(raw: RawLink): LinkDTO {
    return {
      id: raw.id,
      turmaId: raw.turma_id,
      titulo: raw.titulo,
      urlLink: raw.url_link,
      criadoPor: raw.criado_por,
      createdAt: raw.created_at || new Date().toISOString(),
    };
  }

  static toDTOList(rawList: RawLink[]): LinkDTO[] {
    return rawList.map(LinkDTOConverter.toDTO);
  }
}
