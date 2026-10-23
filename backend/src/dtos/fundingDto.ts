import { Database } from '@shared/types/database.types';
import { FundingDTO } from '@shared/types/funding.types';

export type RawFunding = Database['public']['Tables']['configuracao_global']['Row'];

export class FundingDTOConverter {
  static toDTO(raw: RawFunding): FundingDTO {
    return {
      metaArrecadadaMes: Number(raw.meta_arrecadada_mes),
      updatedAt: raw.updated_at,
    };
  }
}
