import { useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useClassEvents, useDeleteEvent } from '../hooks/useClassEvents';
import { EventDTO } from '@shared/types';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { getErrorMessage } from '@/utils/errorMessages';
import { ApiError } from '@/utils/apiError';

interface EventListProps {
  onEdit: (event: EventDTO) => void;
  turmaId?: string;
}

export function EventList({ onEdit, turmaId }: EventListProps) {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: response, isLoading, isError, error } = useClassEvents(undefined, undefined, turmaId);
  const deleteMutation = useDeleteEvent();
  const [eventToDelete, setEventToDelete] = useState<EventDTO | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleDelete = (event: EventDTO) => {
    setActionError(null);
    setEventToDelete(event);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete.id, {
        onSuccess: () => {
          setEventToDelete(null);
          setActionSuccess(`Evento "${eventToDelete.materia}" excluído com sucesso.`);
          setTimeout(() => setActionSuccess(null), 4000);
        },
        onError: (err) => {
          setEventToDelete(null);
          if (err instanceof ApiError) {
            setActionError(getErrorMessage(err.code, err.message));
          } else {
            setActionError('Ocorreu um erro ao excluir o evento.');
          }
        },
      });
    }
  };

  const allEvents = response?.data || [];
  const total = allEvents.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedEvents = allEvents.slice((page - 1) * limit, page * limit);

  return (
    <>
      {actionSuccess && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Eventos Cadastrados
          </h3>
          <span className="text-sm text-slate-500 font-medium">
            Total: {total}
          </span>
        </div>

        {isError && (
          <div className="p-8 text-center text-red-500 font-bold flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <span>
              {error instanceof ApiError
                ? getErrorMessage(error.code, error.message)
                : 'Erro ao carregar os eventos da turma.'}
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
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
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum evento cadastrado para o período.
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event) => {
                  const isProva = event.categoria === 'Prova';
                  const isTrab = event.categoria === 'Trabalho';
                  const isAviso = event.categoria === 'Aviso';

                  let badgeClass =
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                  if (isProva)
                    badgeClass =
                      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
                  if (isTrab)
                    badgeClass =
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                  if (isAviso)
                    badgeClass =
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';

                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {event.materia}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}
                        >
                          {event.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs xl:max-w-md">
                        <p className="text-slate-500 dark:text-slate-400 truncate">
                          {event.descricao || (
                            <span className="italic opacity-50">Sem descrição</span>
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                        {new Date(event.dataHoraLimite).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEdit(event)}
                            className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700"
                            title="Editar Evento"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(event)}
                            disabled={
                              deleteMutation.isPending && eventToDelete?.id === event.id
                            }
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                            title="Excluir Evento"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Paginação padronizada em 5 itens */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <span className="text-sm font-bold text-slate-500">
              Página <span className="text-slate-900 dark:text-white">{page}</span> de{' '}
              {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!eventToDelete}
        title="Excluir Evento"
        message={`Tem certeza que deseja excluir o evento "${eventToDelete?.materia}"? Essa ação apagará a tarefa para todos os alunos da turma e não pode ser desfeita.`}
        isDestructive={true}
        confirmText="Excluir Evento"
        onConfirm={confirmDelete}
        onCancel={() => setEventToDelete(null)}
      />
    </>
  );
}
