import {
  ApiResponse,
  ApiErrorResponse,
  FundingDTO,
  UpdateFundingPayload,
} from '@shared/types';
import { updateFundingSchema } from '@shared/schemas/fundingSchema';
import { ApiError } from '@/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fundingApi = {
  /**
   * Consulta a arrecadação global mensal da plataforma (GET /api/financiamento).
   * Liberado para qualquer usuário autenticado.
   */
  async getFunding(token: string): Promise<ApiResponse<FundingDTO>> {
    const res = await fetch(`${API_URL}/api/financiamento`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = (await res.json().catch(() => null)) as ApiErrorResponse | null;
      throw new ApiError(
        errorData?.code || 'UNKNOWN_ERROR',
        res.status,
        errorData?.details,
        errorData?.message
      );
    }

    return (await res.json()) as ApiResponse<FundingDTO>;
  },

  /**
   * Atualiza o valor arrecadado mensalmente (PUT /api/financiamento).
   * Acesso restrito a Administradores Gerais (ADMIN).
   */
  async updateFunding(
    token: string,
    payload: UpdateFundingPayload
  ): Promise<ApiResponse<FundingDTO>> {
    updateFundingSchema.parse(payload);

    const res = await fetch(`${API_URL}/api/financiamento`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = (await res.json().catch(() => null)) as ApiErrorResponse | null;
      throw new ApiError(
        errorData?.code || 'UNKNOWN_ERROR',
        res.status,
        errorData?.details,
        errorData?.message
      );
    }

    return (await res.json()) as ApiResponse<FundingDTO>;
  },
};
