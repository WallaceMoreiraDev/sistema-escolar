import { useState } from 'react';
import { useClassEvents, useDeleteEvent } from '../hooks/useClassEvents';
import { ClassEvent } from '../types';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

interface EventListProps {
  onEdit: (event: ClassEvent) => void;
}

export function EventList({ onEdit }: EventListProps) {
  const [page, setPage] = useState(1);
  const limit = 5;
  const { data: response, isLoading, isError, isPlaceholderData } = useClassEvents(page, limit);
  const deleteMutation = useDeleteEvent();
  const [eventToDelete, setEventToDelete] = useState<ClassEvent | null>(null);

  const handleDelete = (event: ClassEvent) => {
    setEventToDelete(event);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete.id, {
        onSuccess: () => setEventToDelete(null)
      });
    }
  };

  if (isError) return <div className="p-8 text-center text-red-500 font-bold">Erro ao carregar os eventos.</div>;

  const events = response?.data || [];
  const meta = response?.meta;

  return (
    <>
      <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Eventos Cadastrados</h3>
        <span className="text-sm text-slate-500 font-medium">Total: {meta?.total}</span>
      </div>

      <div className={`overflow-x-auto transition-opacity duration-200 ${isPlaceholderData ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Matéria</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Data Limite</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={`sk-evt-${i}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nenhum evento cadastrado.
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const isProva = event.category === 'Prova';
                const isTrab = event.category === 'Trabalho';
                
                let badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                if (isProva) badgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
                if (isTrab) badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

                return (
                  <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {event.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}>
                        {event.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs xl:max-w-md">
                      <p className="text-slate-500 dark:text-slate-400 truncate">
                        {event.description || <span className="italic opacity-50">Sem descrição</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                      {new Date(event.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onEdit(event)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(event)}
                          disabled={deleteMutation.isPending && eventToDelete?.id === event.id}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {meta && meta.totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            &larr; Anterior
          </button>
          
          <span className="text-sm font-bold text-slate-500">
            Página <span className="text-slate-900 dark:text-white">{meta.page}</span> de {meta.totalPages}
          </span>
          
          <button 
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            Próxima &rarr;
          </button>
        </div>
      )}
    </div>

    <ConfirmModal
      isOpen={!!eventToDelete}
      title="Excluir Evento"
      message={`Tem certeza que deseja excluir o evento "${eventToDelete?.subject}"? Essa ação apagará a tarefa para todos os alunos e não pode ser desfeita.`}
      isDestructive={true}
      confirmText="Excluir Evento"
      onConfirm={confirmDelete}
      onCancel={() => setEventToDelete(null)}
    />
    </>
  );
}
