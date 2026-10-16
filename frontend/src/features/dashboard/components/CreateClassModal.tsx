import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createClassRequestSchema,
  type CreateClassRequestInput,
  type CreateClassRequestFormInput,
} from '@shared/schemas/classSchema';
import { useCreateClassRequest } from '../../class-requests/hooks/useClassRequests';
import { ApiError } from '@/utils/apiError';
import { getErrorMessage } from '@/utils/errorMessages';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CURSOS_DISPONIVEIS = [
  'Administração',
  'Automação Industrial',
  'Desenvolvimento de Sistemas',
  'Eletroeletrônica',
  'Logística',
  'Marketing',
] as const;

export function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const createMutation = useCreateClassRequest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClassRequestFormInput, unknown, CreateClassRequestInput>({
    resolver: zodResolver(createClassRequestSchema),
    defaultValues: {
      ano: undefined,
      turno: undefined,
      curso: '',
      localSala: '',
      justificativa: '',
    },
  });

  const { reset: resetMutation } = createMutation;

  // Limpa o formulário e erros da mutação ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      reset();
      resetMutation();
    }
  }, [isOpen, reset, resetMutation]);

  if (!isOpen) return null;

  const onSubmit = (data: CreateClassRequestInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
        onSuccess?.();
      },
    });
  };

  // Extrai mensagem amigável de erro se a mutação falhar
  const apiErrorMessage = createMutation.error
    ? createMutation.error instanceof ApiError
      ? getErrorMessage(createMutation.error.code)
      : createMutation.error.message || 'Erro ao enviar solicitação.'
    : null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header do Modal */}
        <div className="flex-none p-5 sm:p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10"
            aria-label="Fechar modal"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                Solicitar Nova Turma
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sua solicitação passará por avaliação do administrador da plataforma.
              </p>
            </div>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {apiErrorMessage && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-600 dark:text-red-400">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm font-semibold">{apiErrorMessage}</div>
            </div>
          )}

          <form id="create-class-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ano *
                </label>
                <select
                  {...register('ano')}
                  defaultValue=""
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="" disabled>Selecione</option>
                  <option value="1º">1º Ano</option>
                  <option value="2º">2º Ano</option>
                  <option value="3º">3º Ano</option>
                </select>
                {errors.ano && (
                  <span className="text-xs font-bold text-red-500 mt-1 block">
                    {errors.ano.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Turno *
                </label>
                <select
                  {...register('turno')}
                  defaultValue=""
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="" disabled>Selecione</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                  <option value="Integral">Integral</option>
                </select>
                {errors.turno && (
                  <span className="text-xs font-bold text-red-500 mt-1 block">
                    {errors.turno.message}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Curso *
              </label>
              <select
                {...register('curso')}
                defaultValue=""
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="" disabled>Selecione o curso oficial</option>
                {CURSOS_DISPONIVEIS.map((curso) => (
                  <option key={curso} value={curso}>
                    {curso}
                  </option>
                ))}
              </select>
              {errors.curso && (
                <span className="text-xs font-bold text-red-500 mt-1 block">
                  {errors.curso.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Local / Sala <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                {...register('localSala')}
                placeholder="Ex: Sala 14 - Bloco B"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
              {errors.localSala && (
                <span className="text-xs font-bold text-red-500 mt-1 block">
                  {errors.localSala.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Justificativa <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                rows={3}
                {...register('justificativa')}
                placeholder="Ex: Sou o representante eleito da sala para este ano letivo..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
              />
              {errors.justificativa && (
                <span className="text-xs font-bold text-red-500 mt-1 block">
                  {errors.justificativa.message}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex-none p-5 sm:p-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl sm:rounded-b-3xl">
          <button
            onClick={onClose}
            type="button"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-class-form"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Enviando...</span>
              </>
            ) : (
              'Enviar Pedido'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
