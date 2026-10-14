import { ClassRepository } from '../repositories/classRepository';
import { UserRepository } from '../repositories/userRepository';
import { RawPedidoTurma } from '../dtos/classDto';
import { CreateClassRequestPayload } from '@shared/types/class.types';
import { AppError } from '../utils/AppError';

interface DatabaseErrorLike {
  code?: string;
  message?: string;
  details?: string;
}

export class ClassService {
  constructor(
    private readonly classRepo: ClassRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Cria uma nova solicitação de turma para o aluno.
   * Regras de negócio:
   * 1. Aluno não pode ter turma vinculada.
   * 2. Aluno não pode ter outro pedido pendente ativo (anti-spam).
   */
  async createRequest(
    userId: string,
    payload: CreateClassRequestPayload
  ): Promise<RawPedidoTurma> {
    // 1. Valida se o usuário já possui turma vinculada
    const userProfile = await this.userRepo.getUserProfile(userId);
    if (userProfile?.turmas) {
      throw new AppError(
        'ALREADY_IN_CLASS',
        400,
        'Você já está vinculado a uma turma e não pode solicitar uma nova.'
      );
    }

    // 2. Valida se já existe solicitação pendente
    const existing = await this.classRepo.findPendingByUserId(userId);
    if (existing) {
      throw new AppError(
        'CLASS_REQUEST_DUPLICATE',
        409,
        'Você já possui uma solicitação de turma em andamento.'
      );
    }

    // 3. Persiste no banco com proteção adicional contra concorrência
    try {
      return await this.classRepo.createRequest({
        usuario_id: userId,
        ano: payload.ano,
        turno: payload.turno,
        curso: payload.curso,
        local_sala: payload.localSala || null,
        justificativa: payload.justificativa || null,
        status: 'pendente',
      });
    } catch (error: unknown) {
      const dbErr = error as DatabaseErrorLike;

      // Captura violação de unicidade (índice idx_unique_pedido_pendente)
      if (
        dbErr?.code === '23505' ||
        dbErr?.message?.includes('idx_unique_pedido_pendente') ||
        dbErr?.details?.includes('idx_unique_pedido_pendente')
      ) {
        throw new AppError(
          'CLASS_REQUEST_DUPLICATE',
          409,
          'Você já possui uma solicitação de turma em andamento.'
        );
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('INTERNAL_SERVER_ERROR', 500, 'Falha ao processar solicitação de turma.');
    }
  }

  /**
   * Consulta a solicitação pendente do aluno.
   * Retorna o registro ou null se não houver pedido em andamento.
   */
  async getMyPendingRequest(userId: string): Promise<RawPedidoTurma | null> {
    return await this.classRepo.findPendingByUserId(userId);
  }

  /**
   * Cancela a solicitação pendente ativa do aluno.
   */
  async cancelMyPendingRequest(userId: string): Promise<void> {
    const deleted = await this.classRepo.deletePendingByUserId(userId);

    if (!deleted) {
      throw new AppError(
        'NOT_FOUND',
        404,
        'Nenhuma solicitação pendente encontrada para cancelamento.'
      );
    }
  }
}
