import { Hono } from 'hono';
import { FundingController } from '../controllers/fundingController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { updateFundingSchema } from '@shared/schemas/fundingSchema';

const fundingRoutes = new Hono<{ Variables: Variables }>();

// Todas as rotas de financiamento exigem autenticação prévia
fundingRoutes.use('*', authMiddleware);

// GET /api/financiamento - Leitura liberada para qualquer usuário autenticado (ALUNO, LIDER, ADMIN)
fundingRoutes.get('/', FundingController.get);

// PUT /api/financiamento - Atualização restrita para Administrador Geral (ADMIN)
fundingRoutes.put(
  '/',
  requireRole(['ADMIN']),
  validateBody(updateFundingSchema),
  FundingController.update
);

export { fundingRoutes };
