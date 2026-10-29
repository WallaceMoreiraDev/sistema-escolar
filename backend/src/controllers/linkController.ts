import { Context } from 'hono';
import { LinkRepository } from '../repositories/linkRepository';
import { UserRepository } from '../repositories/userRepository';
import { LinkService } from '../services/linkService';
import { LinkDTOConverter } from '../dtos/linkDto';
import { ApiResponse, LinkDTO, CreateLinkPayload } from '@shared/types';
import { LinkIdParam, ClassIdQuery } from '@shared/schemas/linkSchema';

export class LinkController {
  /**
   * GET /api/turmas/links
   * Lista os links úteis da turma do aluno/líder autenticado.
   */
  static async list(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const query = (c.get('validQuery') ?? c.req.query()) as ClassIdQuery;

    const linkRepo = new LinkRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new LinkService(linkRepo, userRepo);

    const rawLinks = await service.listLinks(user.id, query.turmaId);
    const dtos = LinkDTOConverter.toDTOList(rawLinks);

    const response: ApiResponse<LinkDTO[]> = {
      success: true,
      data: dtos,
    };

    return c.json(response, 200);
  }

  /**
   * POST /api/turmas/links
   * Cria um novo link útil para a turma (apenas Líder ou Admin).
   */
  static async create(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const body = c.get('validBody') as CreateLinkPayload;
    const query = (c.get('validQuery') ?? c.req.query()) as ClassIdQuery;

    const linkRepo = new LinkRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new LinkService(linkRepo, userRepo);

    const rawLink = await service.createLink(user.id, body, query.turmaId);
    const dto = LinkDTOConverter.toDTO(rawLink);

    const response: ApiResponse<LinkDTO> = {
      success: true,
      data: dto,
    };

    return c.json(response, 201);
  }

  /**
   * DELETE /api/turmas/links/:id
   * Exclui um link útil existente (apenas Líder ou Admin).
   */
  static async delete(c: Context) {
    const supabase = c.get('supabase');
    const user = c.get('user');
    const { id } = c.get('validParams') as LinkIdParam;

    const linkRepo = new LinkRepository(supabase);
    const userRepo = new UserRepository(supabase);
    const service = new LinkService(linkRepo, userRepo);

    await service.deleteLink(user.id, id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Link útil excluído com sucesso.',
      },
    };

    return c.json(response, 200);
  }
}
