import { Context } from 'hono';
import { EventRepository } from '../repositories/eventRepository';
import { UserRepository } from '../repositories/userRepository';
import { EventService } from '../services/eventService';
import { EventDTOConverter } from '../dtos/eventDto';
import {
  ApiResponse,
  EventDTO,
  CreateEventPayload,
  UpdateEventPayload,
} from '@shared/types';
import { ListEventsQuery, EventIdParam } from '@shared/schemas/eventSchema';

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
   * POST /api/turmas/eventos
   * Cria um novo evento para a turma do líder/admin autenticado.
   */
  static async create(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const body = c.get('validBody') as CreateEventPayload;
    const query = c.req.query() as { turmaId?: string };

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

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

    const eventRepo = new EventRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new EventService(eventRepo, userRepo);

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
   * Exclui um evento da turma.
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
}
