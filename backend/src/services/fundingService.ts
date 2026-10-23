import { FundingRepository } from '../repositories/fundingRepository';
import { RawFunding } from '../dtos/fundingDto';
import { UpdateFundingPayload } from '@shared/types/funding.types';

export class FundingService {
  constructor(private readonly fundingRepo: FundingRepository) {}

  /**
   * Obtém os dados da meta de contribuição e arrecadação global.
   */
  async getFunding(): Promise<RawFunding> {
    return this.fundingRepo.getFunding();
  }

  /**
   * Atualiza o valor arrecadado do mês na configuração global.
   */
  async updateFunding(payload: UpdateFundingPayload): Promise<RawFunding> {
    return this.fundingRepo.updateFunding(payload.metaArrecadadaMes);
  }
}
