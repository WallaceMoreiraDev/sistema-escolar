import { EventRepository } from '../repositories/eventRepository';
import { UserRepository } from '../repositories/userRepository';
import { RawEventWithAttachments, RawEventAttachment } from '../dtos/eventDto';
import { CreateEventPayload, UpdateEventPayload } from '@shared/types/event.types';
import { ListEventsQuery } from '@shared/schemas/eventSchema';
import { AppError } from '../utils/AppError';

export class EventService {
  private static readonly MAX_EVENT_ATTACHMENT_BYTES = 5242880; // 5 MB cota cumulativa e individual
  private static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  constructor(
    private readonly eventRepo: EventRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Lista eventos da turma dentro do período solicitado (máximo 45 dias).
   * Alunos e líderes visualizam eventos de sua própria turma.
   * Administradores podem consultar eventos de sua turma ou de qualquer turma informada.
   */
  async listEvents(userId: string, query: ListEventsQuery): Promise<RawEventWithAttachments[]> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';
    let turmaId: string | undefined;

    if (isAdmin && query.turmaId) {
      turmaId = query.turmaId;
    } else if (userProfile.turmas) {
      const turma = Array.isArray(userProfile.turmas) ? userProfile.turmas[0] : userProfile.turmas;
      turmaId = turma.id;
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
   * Consulta os dados completos de um evento individual por ID (incluindo links e anexos).
   * Alunos e líderes visualizam eventos de sua própria turma.
   * Administradores podem consultar eventos de qualquer turma.
   */
  async getEventById(userId: string, eventId: string): Promise<RawEventWithAttachments> {
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
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

      if (!userTurma || userTurma.id !== event.turma_id) {
        throw new AppError(
          'FORBIDDEN',
          403,
          'Acesso negado a este evento.'
        );
      }
    }

    return event;
  }

  /**
   * Cria um novo evento associado à turma do líder (ou administrada pelo admin).
   */
  async createEvent(
    userId: string,
    payload: CreateEventPayload,
    queryTurmaId?: string
  ): Promise<RawEventWithAttachments> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';
    let turmaId: string | undefined;

    if (isAdmin && queryTurmaId) {
      turmaId = queryTurmaId;
    } else if (userProfile.turmas) {
      const turma = Array.isArray(userProfile.turmas) ? userProfile.turmas[0] : userProfile.turmas;
      turmaId = turma.id;
    }

    if (!turmaId) {
      if (isAdmin) {
        throw new AppError(
          'TURMA_REQUIRED',
          400,
          'Informe o turmaId nos parâmetros para cadastrar eventos como administrador.'
        );
      }
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
      links: payload.links,
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
  ): Promise<RawEventWithAttachments> {
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
      links: payload.links,
    });
  }

  /**
   * Exclui um evento da turma e limpa todos os anexos físicos correspondentes no storage.
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

    // Busca anexos físicos associados para remoção no storage
    const attachments = await this.eventRepo.findAttachmentsByEventId(eventId);
    if (attachments.length > 0) {
      const storagePaths = attachments.map((a) => a.storage_path);
      await this.eventRepo.removeStorageFiles(storagePaths);
    }

    await this.eventRepo.delete(eventId);
  }

  // ===========================================================================
  // MÉTODOS DE ANEXOS FÍSICOS (Upload, Download Seguro, Exclusão e Expurgo)
  // ===========================================================================

  /**
   * Realiza upload de anexo físico para o evento.
   * Valida autorização, tipo MIME, tamanho individual (<= 5 MB) e cota cumulativa (<= 5 MB).
   */
  async uploadAttachment(
    userId: string,
    eventId: string,
    file: { name: string; size: number; type: string; data: ArrayBuffer }
  ): Promise<RawEventAttachment> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new AppError('NOT_FOUND', 404, 'Evento não encontrado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';

    if (!isAdmin) {
      const userTurma = Array.isArray(userProfile.turmas)
        ? userProfile.turmas[0]
        : userProfile.turmas;

      if (!userTurma || userTurma.id !== event.turma_id || userProfile.role !== 'LIDER') {
        throw new AppError(
          'AUTH_FORBIDDEN',
          403,
          'Apenas líderes da respectiva turma ou administradores gerais podem enviar anexos.'
        );
      }
    }

    // Validação de tipo MIME
    if (!EventService.ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new AppError(
        'VALIDATION_ERROR',
        400,
        'Tipo de arquivo não permitido. Envie apenas PDF, JPEG, PNG ou WEBP.'
      );
    }

    // Validação de tamanho individual
    if (file.size <= 0 || file.size > EventService.MAX_EVENT_ATTACHMENT_BYTES) {
      throw new AppError(
        'VALIDATION_ERROR',
        400,
        'O arquivo deve ter no máximo 5 MB.'
      );
    }

    // Validação de cota cumulativa por evento (CRÍTICO)
    const currentTotalBytes = await this.eventRepo.getEventAttachmentsTotalBytes(eventId);
    if (currentTotalBytes + file.size > EventService.MAX_EVENT_ATTACHMENT_BYTES) {
      throw new AppError(
        'ATTACHMENT_LIMIT_EXCEEDED',
        400,
        'Cota cumulativa de 5 MB por atividade excedida. Exclua anexos anteriores para liberar espaço.'
      );
    }

    // Higienização do nome do arquivo e composição do caminho seguro no storage
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${event.turma_id}/${eventId}/${crypto.randomUUID()}-${sanitizedName}`;

    // Upload físico no bucket Supabase Storage
    await this.eventRepo.uploadStorageFile(storagePath, file.data, file.type);

    // Registro relacional no banco de dados com rollback de arquivo em caso de falha
    try {
      return await this.eventRepo.createAttachment({
        evento_id: eventId,
        turma_id: event.turma_id,
        nome_arquivo: file.name,
        storage_path: storagePath,
        tamanho_bytes: file.size,
        mime_type: file.type,
        criado_por: userId,
      });
    } catch (dbError) {
      try {
        await this.eventRepo.removeStorageFiles([storagePath]);
      } catch {
        // Falha no rollback de storage ignorada
      }
      throw dbError;
    }
  }

  /**
   * Remove um anexo individual (físico no Storage e registro no banco).
   */
  async deleteAttachment(
    userId: string,
    eventId: string,
    anexoId: string
  ): Promise<void> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new AppError('NOT_FOUND', 404, 'Evento não encontrado.');
    }

    const attachment = await this.eventRepo.findAttachmentById(anexoId);
    if (!attachment || attachment.evento_id !== eventId) {
      throw new AppError('ATTACHMENT_NOT_FOUND', 404, 'Anexo não encontrado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';

    if (!isAdmin) {
      const userTurma = Array.isArray(userProfile.turmas)
        ? userProfile.turmas[0]
        : userProfile.turmas;

      if (!userTurma || userTurma.id !== event.turma_id || userProfile.role !== 'LIDER') {
        throw new AppError(
          'AUTH_FORBIDDEN',
          403,
          'Você não tem permissão para excluir anexos desta turma.'
        );
      }
    }

    // Remove do storage e em seguida remove da tabela
    await this.eventRepo.removeStorageFiles([attachment.storage_path]);
    await this.eventRepo.deleteAttachment(anexoId);
  }

  /**
   * Gera URL assinada de download/visualização temporária (1h) para membro da turma ou Admin.
   */
  async getAttachmentDownloadUrl(
    userId: string,
    eventId: string,
    anexoId: string
  ): Promise<{ downloadUrl: string; attachment: RawEventAttachment }> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new AppError('NOT_FOUND', 404, 'Evento não encontrado.');
    }

    const attachment = await this.eventRepo.findAttachmentById(anexoId);
    if (!attachment || attachment.evento_id !== eventId) {
      throw new AppError('ATTACHMENT_NOT_FOUND', 404, 'Anexo não encontrado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';

    if (!isAdmin) {
      const userTurma = Array.isArray(userProfile.turmas)
        ? userProfile.turmas[0]
        : userProfile.turmas;

      if (!userTurma || userTurma.id !== event.turma_id) {
        throw new AppError(
          'AUTH_FORBIDDEN',
          403,
          'Você não tem permissão para visualizar anexos de outra turma.'
        );
      }
    }

    const downloadUrl = await this.eventRepo.createSignedUrl(attachment.storage_path, 3600);

    return { downloadUrl, attachment };
  }

  /**
   * Executa a rotina de auto-expurgo de anexos cujos eventos expiraram há mais de 7 dias.
   */
  async expurgateOldAttachments(): Promise<{
    expurgatedCount: number;
    storagePaths: string[];
  }> {
    const storagePaths = await this.eventRepo.expurgateOldAttachments();

    if (storagePaths.length > 0) {
      await this.eventRepo.removeStorageFiles(storagePaths);
    }

    return {
      expurgatedCount: storagePaths.length,
      storagePaths,
    };
  }
}

