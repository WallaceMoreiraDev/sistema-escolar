import { Hono } from 'hono';
import { ClassController } from '../controllers/classController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import {
  validateBody,
  validateQuery,
  validateParam,
} from '../middlewares/validationMiddleware';
import {
  createClassRequestSchema,
  joinClassSchema,
  classMembersPaginationQuerySchema,
  classMemberIdParamSchema,
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

// PATCH /api/turmas/membros/:id/promover - Promove membro a líder
classRoutes.patch(
  '/membros/:id/promover',
  requireRole(['LIDER', 'ADMIN']),
  validateParam(classMemberIdParamSchema),
  ClassController.promoteMember
);

// PATCH /api/turmas/membros/:id/rebaixar - Rebaixa líder a aluno
classRoutes.patch(
  '/membros/:id/rebaixar',
  requireRole(['LIDER', 'ADMIN']),
  validateParam(classMemberIdParamSchema),
  ClassController.demoteMember
);

// DELETE /api/turmas/membros/:id - Expulsa aluno da turma
classRoutes.delete(
  '/membros/:id',
  requireRole(['LIDER', 'ADMIN']),
  validateParam(classMemberIdParamSchema),
  ClassController.expelMember
);

// POST /api/turmas/sair - Desvinculação voluntária da turma pelo usuário autenticado
classRoutes.post(
  '/sair',
  ClassController.leaveClass
);

export { classRoutes };

