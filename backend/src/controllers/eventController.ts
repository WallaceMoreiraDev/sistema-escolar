import { Context } from 'hono';
import { EventRepository } from '../repositories/eventRepository';
import { UserRepository } from '../repositories/userRepository';
import { EventService } from '../services/eventService';
import { ModerationService } from '../services/moderationService';
import { validateEnv } from '../env';
import {
  EventDTOConverter,
  EventAttachmentDTOConverter,
} from '../dtos/eventDto';
import {
  ApiResponse,
  EventDTO,
  EventAttachmentDTO,
  CreateEventPayload,
  UpdateEventPayload,
} from '@shared/types';
import {
  ListEventsQuery,
  ListAdminEventsQuery,
  EventIdParam,
  AttachmentParam,
} from '@shared/schemas/eventSchema';
import { ClassIdQuery } from '@shared/schemas/linkSchema';
import { AppError } from '../utils/AppError';

export class EventController {
  /**
   * GET /api/turmas/eventos
   * Lista cronologicamente os eventos de turma no período solicitado (teto de 45 dias).
   */
  static async list(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const query = c.get('validQuery') as ListEventsQuery;

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

    const rawEvents = await service.listEvents(user.id, query);
    const dtos = EventDTOConverter.toDTOList(rawEvents);

    const response: ApiResponse<EventDTO[]> = {
      success: true,
      data: dtos,
    };

    return c.json(response, 200);
  }

  /**
   * GET /api/turmas/eventos/gestao
   * Lista paginada de todos os eventos da turma para gestão de líderes e administradores.
   */
  static async listAdmin(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const query = c.get('validQuery') as ListAdminEventsQuery;

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

    const result = await service.listAdminEvents(user.id, query);
    const dtos = EventDTOConverter.toDTOList(result.events);

    const response: ApiResponse<EventDTO[]> = {
      success: true,
      data: dtos,
      meta: {
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };

    return c.json(response, 200);
  }

  /**
   * GET /api/turmas/eventos/:id
   * Consulta os dados completos de um evento individual por ID.
   */
  static async getById(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const { id } = c.get('validParams') as EventIdParam;

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

    const rawEvent = await service.getEventById(user.id, id);
    const dto = EventDTOConverter.toDTO(rawEvent);

    const response: ApiResponse<EventDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }

  /**
   * POST /api/turmas/eventos
   * Cria um novo evento para a turma do líder/admin autenticado.
   */
  static async create(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const body = c.get('validBody') as CreateEventPayload;
    const query = (c.get('validQuery') ?? c.req.query()) as ClassIdQuery;

    const env = validateEnv(c.env);
    const moderation = new ModerationService(env.GEMINI_API_KEY);
    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo, moderation);

    const rawEvent = await service.createEvent(user.id, body, query.turmaId);
    const dto = EventDTOConverter.toDTO(rawEvent);

    const response: ApiResponse<EventDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 201);
  }

  /**
   * PUT /api/turmas/eventos/:id
   * Atualiza parcialmente os dados de um evento da turma.
   */
  static async update(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const { id } = c.get('validParams') as EventIdParam;
    const body = c.get('validBody') as UpdateEventPayload;

    const env = validateEnv(c.env);
    const moderation = new ModerationService(env.GEMINI_API_KEY);
    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo, moderation);

    const updatedRaw = await service.updateEvent(user.id, id, body);
    const dto = EventDTOConverter.toDTO(updatedRaw);

    const response: ApiResponse<EventDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 200);
  }

  /**
   * DELETE /api/turmas/eventos/:id
   * Exclui um evento da turma e seus anexos físicos.
   */
  static async delete(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const { id } = c.get('validParams') as EventIdParam;

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

    await service.deleteEvent(user.id, id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Evento removido com sucesso.',
      },
    };

    return c.json(response, 200);
  }

  /**
   * POST /api/turmas/eventos/:id/anexos
   * Upload de anexo físico via multipart/form-data (máx 5 MB por arquivo e cumulativo).
   */
  static async uploadAttachment(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const { id } = c.get('validParams') as EventIdParam;

    // 1. Checagem prévia do cabeçalho Content-Length antes de ler o corpo na RAM (Prevenção contra OOM)
    const contentLength = Number(c.req.header('content-length'));
    if (contentLength && contentLength > 5 * 1024 * 1024 + 20480) { // 5 MB + margem multipart
      throw new AppError('VALIDATION_ERROR', 400, 'O payload excede o limite máximo permitido de 5 MB.');
    }

    const formData = await c.req.formData();
    const file = formData.get('file') || formData.get('anexo');

    if (!file || typeof file === 'string' || !(file instanceof File)) {
      throw new AppError(
        'VALIDATION_ERROR',
        400,
        'Nenhum arquivo válido enviado. Utilize o campo "file" em multipart/form-data.'
      );
    }

    // 2. Validação da extensão do arquivo contra o MIME type permitido (Prevenção contra Spoofing)
    const allowedExtensions: Record<string, string[]> = {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    };
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions[file.type] || !allowedExtensions[file.type].includes(ext)) {
      throw new AppError('VALIDATION_ERROR', 400, 'Extensão de arquivo incompatível com o tipo de conteúdo.');
    }

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

    const arrayBuffer = await file.arrayBuffer();
    const rawAttachment = await service.uploadAttachment(user.id, id, {
      name: file.name,
      size: file.size,
      type: file.type,
      data: arrayBuffer,
    });

    const dto = EventAttachmentDTOConverter.toDTO(rawAttachment);

    const response: ApiResponse<EventAttachmentDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 201);
  }

  /**
   * DELETE /api/turmas/eventos/:id/anexos/:anexoId
   * Exclui um anexo individual do evento.
   */
  static async deleteAttachment(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const { id, anexoId } = c.get('validParams') as AttachmentParam;

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

    await service.deleteAttachment(user.id, id, anexoId);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Anexo excluído com sucesso.',
      },
    };

    return c.json(response, 200);
  }

  /**
   * GET /api/turmas/eventos/:id/anexos/:anexoId/download
   * Gera uma URL assinada temporária (1h) para download/visualização segura do anexo.
   */
  static async getAttachmentDownloadUrl(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const { id, anexoId } = c.get('validParams') as AttachmentParam;

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

    const { downloadUrl } = await service.getAttachmentDownloadUrl(user.id, id, anexoId);

    const response: ApiResponse<{ downloadUrl: string }> = {
      success: true,
      data: {
        downloadUrl,
      },
    };

    return c.json(response, 200);
  }
}
