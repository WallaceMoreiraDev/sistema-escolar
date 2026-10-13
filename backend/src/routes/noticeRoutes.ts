import { Hono } from 'hono';
import { NoticeController } from '../controllers/noticeController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import {
  validateBody,
  validateParam,
  validateQuery,
} from '../middlewares/validationMiddleware';
import {
  createNoticeSchema,
  updateNoticeSchema,
  noticeIdParamSchema,
  noticePaginationQuerySchema,
} from '@shared/schemas/noticeSchema';

const noticeRoutes = new Hono<{ Variables: Variables }>();

// Todas as rotas do Mural exigem autenticação prévia
noticeRoutes.use('*', authMiddleware);

// GET /api/avisos - Listagem paginada (acesso livre para qualquer usuário autenticado)
noticeRoutes.get(
  '/',
  validateQuery(noticePaginationQuerySchema),
  NoticeController.list
);

// GET /api/avisos/:id - Detalhes do aviso (acesso livre para qualquer usuário autenticado)
noticeRoutes.get(
  '/:id',
  validateParam(noticeIdParamSchema),
  NoticeController.getById
);

// POST /api/avisos - Criação de aviso (apenas ADMIN)
noticeRoutes.post(
  '/',
  requireRole(['ADMIN']),
  validateBody(createNoticeSchema),
  NoticeController.create
);

// PUT /api/avisos/:id - Edição de aviso (apenas ADMIN)
noticeRoutes.put(
  '/:id',
  requireRole(['ADMIN']),
  validateParam(noticeIdParamSchema),
  validateBody(updateNoticeSchema),
  NoticeController.update
);

// DELETE /api/avisos/:id - Exclusão de aviso (apenas ADMIN)
noticeRoutes.delete(
  '/:id',
  requireRole(['ADMIN']),
  validateParam(noticeIdParamSchema),
  NoticeController.delete
);

export { noticeRoutes };
