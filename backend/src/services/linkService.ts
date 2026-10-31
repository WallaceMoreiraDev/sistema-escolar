import { LinkRepository } from '../repositories/linkRepository';
import { UserRepository } from '../repositories/userRepository';
import { ModerationService } from './moderationService';
import { RawLink } from '../dtos/linkDto';
import { CreateLinkPayload } from '@shared/types/link.types';
import { AppError } from '../utils/AppError';

export class LinkService {
  constructor(
    private readonly linkRepo: LinkRepository,
    private readonly userRepo: UserRepository,
    private readonly moderationService: ModerationService = new ModerationService()
  ) {}

  /**
   * Obtém os links úteis da turma do usuário autenticado.
   * Administradores podem consultar informando o queryTurmaId.
   */
  async listLinks(userId: string, queryTurmaId?: string): Promise<RawLink[]> {
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
          'Informe o turmaId nos parâmetros para consultar links úteis como administrador.'
        );
      }
      throw new AppError(
        'USER_WITHOUT_CLASS',
        400,
        'Você não está vinculado a nenhuma turma para consultar links úteis.'
      );
    }

    return this.linkRepo.listByTurma(turmaId);
  }

  /**
   * Cria um novo link útil associado à turma do líder (ou administrada pelo admin).
   */
  async createLink(
    userId: string,
    payload: CreateLinkPayload,
    queryTurmaId?: string
  ): Promise<RawLink> {
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
          'Informe o turmaId nos parâmetros para criar links úteis como administrador.'
        );
      }
      throw new AppError(
        'USER_WITHOUT_CLASS',
        400,
        'Você não está vinculado a nenhuma turma para criar links úteis.'
      );
    }

    // Moderação de Conteúdo em Duas Camadas
    await this.moderationService.validate(`${payload.titulo} ${payload.urlLink}`);

    return this.linkRepo.create(turmaId, userId, payload);
  }

  /**
   * Atualiza um link útil existente.
   * Regra de autorização: Apenas Líder da respectiva turma ou Administrador Geral.
   */
  async updateLink(
    userId: string,
    linkId: string,
    payload: CreateLinkPayload
  ): Promise<RawLink> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const existing = await this.linkRepo.findById(linkId);
    if (!existing) {
      throw new AppError('NOT_FOUND', 404, 'Link útil não encontrado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';
    let userTurmaId: string | undefined;

    if (userProfile.turmas) {
      const turma = Array.isArray(userProfile.turmas) ? userProfile.turmas[0] : userProfile.turmas;
      userTurmaId = turma.id;
    }

    if (!isAdmin && existing.turma_id !== userTurmaId) {
      throw new AppError(
        'AUTH_FORBIDDEN',
        403,
        'Você não tem permissão para alterar links úteis de outra turma.'
      );
    }

    // Moderação de Conteúdo em Duas Camadas
    await this.moderationService.validate(`${payload.titulo} ${payload.urlLink}`);

    return this.linkRepo.update(linkId, payload);
  }

  /**
   * Exclui um link útil.
   * Apenas líderes da mesma turma do link ou administradores gerais têm autorização.
   */
  async deleteLink(userId: string, linkId: string): Promise<void> {
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new AppError('AUTH_UNAUTHORIZED', 401, 'Usuário não autenticado.');
    }

    const link = await this.linkRepo.findById(linkId);
    if (!link) {
      throw new AppError('NOT_FOUND', 404, 'Link útil não encontrado.');
    }

    const isAdmin = userProfile.role === 'ADMIN';
    let userTurmaId: string | undefined;

    if (userProfile.turmas) {
      const turma = Array.isArray(userProfile.turmas) ? userProfile.turmas[0] : userProfile.turmas;
      userTurmaId = turma.id;
    }

    if (!isAdmin && link.turma_id !== userTurmaId) {
      throw new AppError(
        'AUTH_FORBIDDEN',
        403,
        'Você não tem permissão para excluir links úteis de outra turma.'
      );
    }

    await this.linkRepo.delete(linkId);
  }
}
