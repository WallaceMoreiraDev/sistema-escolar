import { Hono } from 'hono';
import { AdminClassController } from '../controllers/adminClassController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import {
  validateBody,
  validateParam,
  validateQuery,
} from '../middlewares/validationMiddleware';
import {
  adminClassPaginationQuerySchema,
  approveClassRequestSchema,
  classRequestIdParamSchema,
  adminActiveClassesPaginationQuerySchema,
  classIdParamSchema,
} from '@shared/schemas/classSchema';

const adminRoutes = new Hono<{ Variables: Variables }>();

// Todas as rotas administrativas exigem autenticação e perfil ADMIN
adminRoutes.use('*', authMiddleware, requireRole(['ADMIN']));

// GET /api/admin/pedidos-turma - Listagem de solicitações pendentes (FIFO, 5 por página)
adminRoutes.get(
  '/pedidos-turma',
  validateQuery(adminClassPaginationQuerySchema),
  AdminClassController.listPending
);

// POST /api/admin/pedidos-turma/:id/aprovar - Aprovação da solicitação e criação da turma
adminRoutes.post(
  '/pedidos-turma/:id/aprovar',
  validateParam(classRequestIdParamSchema),
  validateBody(approveClassRequestSchema),
  AdminClassController.approveRequest
);

// DELETE /api/admin/pedidos-turma/:id - Rejeição da solicitação da turma
adminRoutes.delete(
  '/pedidos-turma/:id',
  validateParam(classRequestIdParamSchema),
  AdminClassController.rejectRequest
);

// GET /api/admin/turmas - Listagem de turmas ativas com paginação
adminRoutes.get(
  '/turmas',
  validateQuery(adminActiveClassesPaginationQuerySchema),
  AdminClassController.listActiveClasses
);

// GET /api/admin/turmas/:id - Detalhes cadastrais de uma turma ativa
adminRoutes.get(
  '/turmas/:id',
  validateParam(classIdParamSchema),
  AdminClassController.getClassDetails
);

// DELETE /api/admin/turmas/:id - Exclusão/destruição de turma ativa e desvinculação de membros
adminRoutes.delete(
  '/turmas/:id',
  validateParam(classIdParamSchema),
  AdminClassController.deleteClass
);

export { adminRoutes };
