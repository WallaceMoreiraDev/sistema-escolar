import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, EventFormValues } from '../schemas/eventSchema';
import { useCreateEvent, useUpdateEvent } from '../hooks/useClassEvents';
import { ClassEvent } from '../types';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: ClassEvent | null;
}

export function EventForm({ isOpen, onClose, eventToEdit }: EventFormProps) {
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      category: 'Tarefa',
    }
  });

  useEffect(() => {
    if (eventToEdit && isOpen) {
      // Pré-preenche o formulário se estivermos no modo de edição
      // O input datetime-local requer o formato YYYY-MM-DDThh:mm
      const formattedDate = new Date(eventToEdit.dueDate).toISOString().slice(0, 16);
      reset({
        subject: eventToEdit.subject,
        category: eventToEdit.category,
        dueDate: formattedDate,
        description: eventToEdit.description || '',
      });
    } else if (isOpen && !eventToEdit) {
      // Reseta para padrão de criação ao abrir
      reset({ category: 'Tarefa', subject: '', dueDate: '', description: '' });
    }
  }, [eventToEdit, isOpen, reset]);

  const isEditing = !!eventToEdit;
  const isPending = createEventMutation.isPending || updateEventMutation.isPending;

  const onSubmit = (data: EventFormValues) => {
    if (isEditing) {
      updateEventMutation.mutate({ id: eventToEdit.id, data }, {
        onSuccess: () => {
          onClose();
        }
      });
    } else {
      createEventMutation.mutate(data, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10"
        >
          ✕
        </button>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
          {isEditing ? 'Editar Evento' : 'Cadastrar Novo Evento'}
        </h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Matéria */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Matéria *</label>
            <input 
              {...register('subject')}
              type="text" 
              placeholder="Ex: Matemática"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.subject ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all`}
            />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria *</label>
            <select 
              {...register('category')}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.category ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all appearance-none`}
            >
              <option value="Prova">Prova</option>
              <option value="Trabalho">Trabalho</option>
              <option value="Tarefa">Tarefa</option>
              <option value="Lembrete">Lembrete</option>
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>
        </div>

        {/* Data Limite */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Data e Horário *</label>
          <input 
            {...register('dueDate')}
            type="datetime-local" 
            className={`w-full px-4 py-2.5 rounded-xl border ${errors.dueDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all`}
          />
          {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição Detalhada</label>
          <textarea 
            {...register('description')}
            rows={3}
            placeholder="Ex: Capítulos 4 e 5. Trazer calculadora."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all resize-none"
          ></textarea>
        </div>

        {/* Anexo */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Anexo (Opcional)</label>
          <input 
            {...register('attachment')}
            type="file" 
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />
          {errors.attachment && <p className="text-xs text-red-500 mt-1">{errors.attachment.message as string}</p>}
        </div>

        <div className="flex justify-end pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold transition-colors mr-2"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Evento')}
          </button>
        </div>
      </form>
      </div>
    </div>,
    document.body
  );
}
