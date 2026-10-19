import { EventRepository } from '../repositories/eventRepository';
import { UserRepository } from '../repositories/userRepository';
import { RawEvent } from '../dtos/eventDto';
import { CreateEventPayload, UpdateEventPayload } from '@shared/types/event.types';
import { ListEventsQuery } from '@shared/schemas/eventSchema';
import { AppError } from '../utils/AppError';

export class EventService {
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Lista eventos da turma dentro do período solicitado (máximo 45 dias).
   * Alunos e líderes visualizam eventos de sua própria turma.
   * Administradores podem consultar eventos de sua turma ou de qualquer turma informada.
   */
  async listEvents(userId: string, query: ListEventsQuery): Promise<RawEvent[]> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';
    let turmaId: string | undefined;

    if (userProfile.turmas) {
      const turma = Array.isArray(userProfile.turmas) ? userProfile.turmas[0] : userProfile.turmas;
      turmaId = turma.id;
    } else if (isAdmin && query.turmaId) {
      turmaId = query.turmaId;
    }

    if (!turmaId) {
      if (isAdmin) {
        throw new AppError(
          'TURMA_REQUIRED',
          400,
          'Informe o turmaId nos parâmetros para consultar eventos como administrador.'
        );
      }
      throw new AppError(
        'USER_WITHOUT_CLASS',
        400,
        'Você não está vinculado a nenhuma turma para consultar eventos.'
      );
    }

    return this.eventRepo.findEventsByPeriod(turmaId, query.startDate, query.endDate);
  }

  /**
   * Cria um novo evento associado à turma do líder (ou administrada pelo admin).
   */
  async createEvent(
    userId: string,
    payload: CreateEventPayload,
    queryTurmaId?: string
  ): Promise<RawEvent> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';
    let turmaId: string | undefined;

    if (userProfile.turmas) {
      const turma = Array.isArray(userProfile.turmas) ? userProfile.turmas[0] : userProfile.turmas;
      turmaId = turma.id;
    } else if (isAdmin && queryTurmaId) {
      turmaId = queryTurmaId;
    }

    if (!turmaId) {
      throw new AppError(
        'USER_WITHOUT_CLASS',
        400,
        'Você não está vinculado a nenhuma turma para cadastrar eventos.'
      );
    }

    return this.eventRepo.create({
      turma_id: turmaId,
      materia: payload.materia,
      categoria: payload.categoria,
      data_hora_limite: payload.dataHoraLimite,
      descricao: payload.descricao,
      anexo_url: payload.anexoUrl,
      criado_por: userId,
    });
  }

  /**
   * Atualiza um evento existente.
   * Regra de autorização: Apenas Líder da respectiva turma ou Administrador Geral.
   */
  async updateEvent(
    userId: string,
    eventId: string,
    payload: UpdateEventPayload
  ): Promise<RawEvent> {
    const existing = await this.eventRepo.findById(eventId);
    if (!existing) {
      throw new AppError('NOT_FOUND', 404, 'Evento não encontrado.');
    }

    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';

    if (!isAdmin) {
      const userTurma = Array.isArray(userProfile.turmas)
        ? userProfile.turmas[0]
        : userProfile.turmas;

      if (!userTurma || userTurma.id !== existing.turma_id) {
        throw new AppError(
          'AUTH_FORBIDDEN',
          403,
          'Você não tem permissão para alterar eventos de outra turma.'
        );
      }
    }

    return this.eventRepo.update(eventId, {
      materia: payload.materia,
      categoria: payload.categoria,
      data_hora_limite: payload.dataHoraLimite,
      descricao: payload.descricao,
      anexo_url: payload.anexoUrl,
    });
  }

  /**
   * Exclui um evento da turma.
   * Regra de autorização: Apenas Líder da respectiva turma ou Administrador Geral.
   */
  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const existing = await this.eventRepo.findById(eventId);
    if (!existing) {
      throw new AppError('NOT_FOUND', 404, 'Evento não encontrado.');
    }

    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';

    if (!isAdmin) {
      const userTurma = Array.isArray(userProfile.turmas)
        ? userProfile.turmas[0]
        : userProfile.turmas;

      if (!userTurma || userTurma.id !== existing.turma_id) {
        throw new AppError(
          'AUTH_FORBIDDEN',
          403,
          'Você não tem permissão para excluir eventos de outra turma.'
        );
      }
    }

    await this.eventRepo.delete(eventId);
  }
}
