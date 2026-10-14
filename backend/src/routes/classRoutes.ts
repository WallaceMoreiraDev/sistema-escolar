import { Hono } from 'hono';
import { ClassController } from '../controllers/classController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { createClassRequestSchema } from '@shared/schemas/classSchema';

const classRoutes = new Hono<{ Variables: Variables }>();

// Todas as rotas de turmas exigem autenticação prévia
classRoutes.use('*', authMiddleware);

// POST /api/turmas/pedidos - Solicitação de nova turma pelo aluno
classRoutes.post(
  '/pedidos',
  validateBody(createClassRequestSchema),
  ClassController.createRequest
);

// GET /api/turmas/pedidos/meu - Consulta a solicitação pendente do aluno autenticado
classRoutes.get(
  '/pedidos/meu',
  ClassController.getMyPendingRequest
);

// DELETE /api/turmas/pedidos/meu - Cancelamento da solicitação pendente pelo aluno
classRoutes.delete(
  '/pedidos/meu',
  ClassController.cancelMyPendingRequest
);

export { classRoutes };
