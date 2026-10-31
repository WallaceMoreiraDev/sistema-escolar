import { Hono } from 'hono';
import { LinkController } from '../controllers/linkController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import {
  validateBody,
  validateParam,
  validateQuery,
} from '../middlewares/validationMiddleware';
import {
  createLinkSchema,
  linkIdParamSchema,
  classIdQuerySchema,
} from '@shared/schemas/linkSchema';

const linkRoutes = new Hono<{ Variables: Variables }>();

// Todas as rotas de links úteis exigem autenticação prévia
linkRoutes.use('*', authMiddleware);

// GET /api/turmas/links - Lista links úteis da turma
linkRoutes.get('/', validateQuery(classIdQuerySchema), LinkController.list);

// POST /api/turmas/links - Cria novo link útil (apenas Líder ou Admin)
linkRoutes.post(
  '/',
  requireRole(['LIDER', 'ADMIN']),
  validateQuery(classIdQuerySchema),
  validateBody(createLinkSchema),
  LinkController.create
);

// PUT /api/turmas/links/:id - Atualiza link útil (apenas Líder ou Admin)
linkRoutes.put(
  '/:id',
  requireRole(['LIDER', 'ADMIN']),
  validateParam(linkIdParamSchema),
  validateBody(createLinkSchema),
  LinkController.update
);

// DELETE /api/turmas/links/:id - Exclui link útil (apenas Líder ou Admin)
linkRoutes.delete(
  '/:id',
  requireRole(['LIDER', 'ADMIN']),
  validateParam(linkIdParamSchema),
  LinkController.delete
);

export { linkRoutes };
