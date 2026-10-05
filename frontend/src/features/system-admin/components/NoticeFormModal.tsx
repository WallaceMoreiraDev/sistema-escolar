import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noticeSchema, NoticeFormValues } from '../../mural/schemas/noticeSchema';
import { Notice } from '../../mural/types';
import { useCreateNotice, useUpdateNotice } from '../../mural/hooks/useNotices';

interface NoticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticeToEdit?: Notice | null;
}

export function NoticeFormModal({ isOpen, onClose, noticeToEdit }: NoticeFormModalProps) {
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (noticeToEdit) {
        setValue('title', noticeToEdit.title);
        setValue('message', noticeToEdit.message);
        setValue('sender', noticeToEdit.sender as NoticeFormValues['sender']);
        setValue('badge', noticeToEdit.badge);
      } else {
        reset({ title: '', message: '', sender: undefined, badge: undefined });
      }
    }
  }, [isOpen, noticeToEdit, setValue, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: NoticeFormValues) => {
    if (noticeToEdit) {
      updateMutation.mutate(
        { id: noticeToEdit.id, data },
        {
          onSuccess: () => {
            onClose();
            reset();
          }
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onClose();
          reset();
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {noticeToEdit ? 'Editar Aviso' : 'Novo Aviso'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Remetente</label>
              <select 
                {...register('sender')}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Selecione...</option>
                <option value="Diretoria">Diretoria</option>
                <option value="Coordenação">Coordenação</option>
                <option value="Administração da Plataforma">Administração da Plataforma</option>
              </select>
              {errors.sender && <span className="text-xs font-bold text-red-500">{errors.sender.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Badge (Destaque)</label>
              <select 
                {...register('badge')}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Selecione...</option>
                <option value="Urgente">Urgente (Vermelho)</option>
                <option value="Informativo">Informativo (Azul)</option>
                <option value="Evento">Evento (Verde)</option>
              </select>
              {errors.badge && <span className="text-xs font-bold text-red-500">{errors.badge.message}</span>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Título</label>
            <input 
              type="text" 
              {...register('title')}
              placeholder="Ex: Feriado Nacional"
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.title && <span className="text-xs font-bold text-red-500">{errors.title.message}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mensagem</label>
            <textarea 
              {...register('message')}
              placeholder="Digite o conteúdo do aviso..."
              rows={5}
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            ></textarea>
            {errors.message && <span className="text-xs font-bold text-red-500">{errors.message.message}</span>}
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center transition-all disabled:opacity-50 min-w-[150px]"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar Aviso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
