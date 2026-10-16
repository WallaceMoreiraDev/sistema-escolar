import { Hono } from 'hono';
import { ClassController } from '../controllers/classController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { validateBody, validateQuery } from '../middlewares/validationMiddleware';
import {
  createClassRequestSchema,
  joinClassSchema,
  classMembersPaginationQuerySchema,
} from '@shared/schemas/classSchema';

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

// POST /api/turmas/entrar - Entrada na turma via código de convite pelo aluno
classRoutes.post(
  '/entrar',
  validateBody(joinClassSchema),
  ClassController.joinByCode
);

// GET /api/turmas/membros - Listagem dos membros da turma do usuário autenticado
classRoutes.get(
  '/membros',
  validateQuery(classMembersPaginationQuerySchema),
  ClassController.listMembers
);

export { classRoutes };
