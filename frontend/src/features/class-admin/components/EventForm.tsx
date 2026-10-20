import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
import { useCreateEvent, useUpdateEvent } from '../hooks/useClassEvents';
import { EventDTO, CreateEventPayload } from '@shared/types';
import { getErrorMessage } from '@/utils/errorMessages';
import { ApiError } from '@/utils/apiError';

const eventFormSchema = z.object({
  materia: z
    .string({ required_error: 'A matéria é obrigatória.' })
    .trim()
    .min(2, 'A matéria deve ter no mínimo 2 caracteres.')
    .max(100, 'A matéria deve ter no máximo 100 caracteres.'),
  categoria: z.enum(['Prova', 'Trabalho', 'Tarefa', 'Aviso'], {
    errorMap: () => ({ message: 'Selecione uma categoria válida.' }),
  }),
  dataHoraLimite: z
    .string({ required_error: 'A data e horário limite são obrigatórios.' })
    .min(1, 'A data e horário limite são obrigatórios.'),
  descricao: z
    .string()
    .trim()
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres.')
    .optional(),
  anexoUrl: z
    .string()
    .trim()
    .url('A URL do anexo deve ser válida (ex: https://...).')
    .max(500, 'A URL do anexo deve ter no máximo 500 caracteres.')
    .or(z.literal(''))
    .optional(),
});

type EventFormInput = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventDTO | null;
}

export function EventForm({ isOpen, onClose, eventToEdit }: EventFormProps) {
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      materia: '',
      categoria: 'Tarefa',
      dataHoraLimite: '',
      descricao: '',
      anexoUrl: '',
    },
  });

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  useEffect(() => {
    if (eventToEdit && isOpen) {
      // Converte data ISO UTC para o formato aceito pelo input datetime-local no fuso local
      const d = new Date(eventToEdit.dataHoraLimite);
      const pad = (n: number) => String(n).padStart(2, '0');
      const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

      reset({
        materia: eventToEdit.materia,
        categoria: eventToEdit.categoria,
        dataHoraLimite: formattedDate,
        descricao: eventToEdit.descricao || '',
        anexoUrl: eventToEdit.anexoUrl || '',
      });
    } else if (isOpen && !eventToEdit) {
      reset({
        materia: '',
        categoria: 'Tarefa',
        dataHoraLimite: '',
        descricao: '',
        anexoUrl: '',
      });
    }
  }, [eventToEdit, isOpen, reset]);

  const isEditing = !!eventToEdit;
  const isPending = createEventMutation.isPending || updateEventMutation.isPending;

  const onSubmit = (data: EventFormInput) => {
    setErrorMessage(null);

    // Converte datetime-local para ISO 8601 UTC
    const utcDate = new Date(data.dataHoraLimite).toISOString();

    const payload: CreateEventPayload = {
      materia: data.materia.trim(),
      categoria: data.categoria,
      dataHoraLimite: utcDate,
      descricao: data.descricao?.trim() ? data.descricao.trim() : null,
      anexoUrl: data.anexoUrl?.trim() ? data.anexoUrl.trim() : null,
    };

    if (isEditing && eventToEdit) {
      updateEventMutation.mutate(
        { id: eventToEdit.id, data: payload },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (err) => {
            if (err instanceof ApiError) {
              setErrorMessage(getErrorMessage(err.code, err.message));
            } else {
              setErrorMessage('Ocorreu um erro ao atualizar o evento.');
            }
          },
        }
      );
    } else {
      createEventMutation.mutate(
        { payload },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (err) => {
            if (err instanceof ApiError) {
              setErrorMessage(getErrorMessage(err.code, err.message));
            } else {
              setErrorMessage('Ocorreu um erro ao criar o evento.');
            }
          },
        }
      );
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
          {isEditing ? 'Editar Evento' : 'Cadastrar Novo Evento'}
        </h3>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Matéria */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Matéria *
              </label>
              <input
                {...register('materia')}
                type="text"
                placeholder="Ex: Matemática"
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.materia
                    ? 'border-red-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all`}
              />
              {errors.materia && (
                <p className="text-xs text-red-500 mt-1">{errors.materia.message}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Categoria *
              </label>
              <select
                {...register('categoria')}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.categoria
                    ? 'border-red-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all appearance-none`}
              >
                <option value="Prova">Prova</option>
                <option value="Trabalho">Trabalho</option>
                <option value="Tarefa">Tarefa</option>
                <option value="Aviso">Aviso</option>
              </select>
              {errors.categoria && (
                <p className="text-xs text-red-500 mt-1">{errors.categoria.message}</p>
              )}
            </div>
          </div>

          {/* Data e Horário Limite */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Data e Horário Limite *
            </label>
            <input
              {...register('dataHoraLimite')}
              type="datetime-local"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.dataHoraLimite
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-primary'
              } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all`}
            />
            {errors.dataHoraLimite && (
              <p className="text-xs text-red-500 mt-1">
                {errors.dataHoraLimite.message}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Descrição Detalhada
            </label>
            <textarea
              {...register('descricao')}
              rows={3}
              placeholder="Ex: Capítulos 4 e 5 do livro didático. Trazer calculadora científica."
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.descricao
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-primary'
              } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all resize-none`}
            />
            {errors.descricao && (
              <p className="text-xs text-red-500 mt-1">{errors.descricao.message}</p>
            )}
          </div>

          {/* Anexo URL */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Link de Anexo ou Material (Opcional)
            </label>
            <input
              {...register('anexoUrl')}
              type="url"
              placeholder="Ex: https://drive.google.com/..."
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.anexoUrl
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-primary'
              } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all`}
            />
            {errors.anexoUrl && (
              <p className="text-xs text-red-500 mt-1">{errors.anexoUrl.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-6 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold transition-colors mr-2 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md"
            >
              {isPending
                ? 'Salvando...'
                : isEditing
                ? 'Salvar Alterações'
                : 'Cadastrar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
