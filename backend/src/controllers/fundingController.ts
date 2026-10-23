import { Context } from 'hono';
import { FundingRepository } from '../repositories/fundingRepository';
import { FundingService } from '../services/fundingService';
import { FundingDTOConverter } from '../dtos/fundingDto';
import { ApiResponse, FundingDTO, UpdateFundingPayload } from '@shared/types';

export class FundingController {
  /**
   * GET /api/financiamento
   * Retorna os dados atuais da meta de contribuição e arrecadação global.
   */
  static async get(c: Context) {
    const supabase = c.get('supabase');

    const fundingRepo = new FundingRepository(supabase);
    const service = new FundingService(fundingRepo);

    const raw = await service.getFunding();
    const dto = FundingDTOConverter.toDTO(raw);

    const response: ApiResponse<FundingDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }

  /**
   * PUT /api/financiamento
   * Atualiza o valor arrecadado do mês na configuração global (exclusivo para ADMIN).
   */
  static async update(c: Context) {
    const supabase = c.get('supabase');
    const body = c.get('validBody') as UpdateFundingPayload;

    const fundingRepo = new FundingRepository(supabase);
    const service = new FundingService(fundingRepo);

    const updated = await service.updateFunding(body);
    const dto = FundingDTOConverter.toDTO(updated);

    const response: ApiResponse<FundingDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }
}
