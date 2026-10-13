import { Database } from '@shared/types/database.types';
import { NoticeDTO, AvisoRemetente, AvisoBadge } from '@shared/types/notice.types';

export type RawNotice = Database['public']['Tables']['avisos_gerais']['Row'];

/**
 * Data Transfer Object Mapper para Avisos Gerais (GEMINI.md Seção 2 e Seção 4).
 * Mapeia snake_case do banco de dados para camelCase na API HTTP.
 */
export class NoticeDTOConverter {
  static toDTO(raw: RawNotice): NoticeDTO {
    return {
      id: raw.id,
      titulo: raw.titulo,
      mensagem: raw.mensagem,
      remetente: raw.remetente as AvisoRemetente,
      badgeDestaque: raw.badge_destaque as AvisoBadge,
      dataPostagem: raw.data_postagem || new Date().toISOString(),
    };
  }

  static toDTOList(rawList: RawNotice[]): NoticeDTO[] {
    return rawList.map(this.toDTO);
  }
}
