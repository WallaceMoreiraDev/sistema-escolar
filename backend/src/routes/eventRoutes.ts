import { Hono } from 'hono';
import { EventController } from '../controllers/eventController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import {
  validateBody,
  validateQuery,
  validateParam,
} from '../middlewares/validationMiddleware';
import {
  createEventSchema,
  updateEventSchema,
  eventIdParamSchema,
  listEventsQuerySchema,
  attachmentParamSchema,
} from '@shared/schemas/eventSchema';

const eventRoutes = new Hono<{ Variables: Variables }>();

// Todas as rotas de eventos exigem autenticação prévia
eventRoutes.use('*', authMiddleware);

// GET /api/turmas/eventos - Lista eventos por período (máximo 45 dias)
eventRoutes.get(
  '/',
  validateQuery(listEventsQuerySchema),
  EventController.list
);

// POST /api/turmas/eventos - Cria novo evento (apenas Líder ou Admin)
eventRoutes.post(
  '/',
  requireRole(['LIDER', 'ADMIN']),
  validateBody(createEventSchema),
  EventController.create
);

// GET /api/turmas/eventos/:id - Consulta dados completos de um evento individual
eventRoutes.get(
  '/:id',
  validateParam(eventIdParamSchema),
  EventController.getById
);

// PUT /api/turmas/eventos/:id - Atualiza evento existente (apenas Líder ou Admin)
eventRoutes.put(
  '/:id',
  requireRole(['LIDER', 'ADMIN']),
  validateParam(eventIdParamSchema),
  validateBody(updateEventSchema),
  EventController.update
);

// DELETE /api/turmas/eventos/:id - Exclui evento existente (apenas Líder ou Admin)
eventRoutes.delete(
  '/:id',
  requireRole(['LIDER', 'ADMIN']),
  validateParam(eventIdParamSchema),
  EventController.delete
);

// POST /api/turmas/eventos/:id/anexos - Upload de anexo físico (apenas Líder ou Admin)
eventRoutes.post(
  '/:id/anexos',
  requireRole(['LIDER', 'ADMIN']),
  validateParam(eventIdParamSchema),
  EventController.uploadAttachment
);

// DELETE /api/turmas/eventos/:id/anexos/:anexoId - Exclusão de anexo individual (apenas Líder ou Admin)
eventRoutes.delete(
  '/:id/anexos/:anexoId',
  requireRole(['LIDER', 'ADMIN']),
  validateParam(attachmentParamSchema),
  EventController.deleteAttachment
);

// GET /api/turmas/eventos/:id/anexos/:anexoId/download - Download / visualização segura de anexo
eventRoutes.get(
  '/:id/anexos/:anexoId/download',
  validateParam(attachmentParamSchema),
  EventController.getAttachmentDownloadUrl
);

export { eventRoutes };
