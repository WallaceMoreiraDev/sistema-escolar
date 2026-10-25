import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  School,
  Users,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useActiveClasses, useDeleteClass, ActiveClass } from './hooks/useActiveClasses';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { ApiError } from '@/utils/apiError';
import { getErrorMessage } from '@/utils/errorMessages';

export function ActiveClassesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: response, isLoading, isError, isPlaceholderData } = useActiveClasses(page, limit);
  const deleteMutation = useDeleteClass();

  const [classToDelete, setClassToDelete] = useState<ActiveClass | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const confirmDelete = () => {
    if (classToDelete) {
      deleteMutation.mutate(classToDelete.id, {
        onSuccess: (data) => {
          setClassToDelete(null);
          setFeedback({
            type: 'success',
            message: data?.message || 'Turma destruída com sucesso.',
          });
          setTimeout(() => setFeedback(null), 4000);
        },
        onError: (err: unknown) => {
          setClassToDelete(null);
          if (err instanceof ApiError) {
            setFeedback({
              type: 'error',
              message: getErrorMessage(err.code, err.message),
            });
          } else {
            setFeedback({
              type: 'error',
              message: 'Ocorreu um erro ao excluir a turma. Tente novamente.',
            });
          }
          setTimeout(() => setFeedback(null), 5000);
        },
      });
    }
  };

  const handleGodMode = (cls: ActiveClass) => {
    navigate(`/app/painel-turma?turmaId=${cls.id}`);
  };

  const classes = response?.data || [];
  const pagination = response?.meta?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || page;
  const totalCount = pagination?.total || classes.length;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/painel-admin')}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl shadow-sm transition-colors"
            title="Voltar ao Painel Geral"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Turmas da Escola</h1>
            <p className="text-slate-500">Gestão global de todas as turmas ativas na plataforma.</p>
          </div>
        </div>
      </header>

      {feedback && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 text-sm font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="w-full">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
              Lista de Turmas
            </h3>
            <span className="text-sm text-slate-500 font-medium">Total: {totalCount}</span>
          </div>

          <div
            className={`overflow-x-auto transition-opacity duration-200 ${
              isPlaceholderData ? 'opacity-50 pointer-events-none' : 'opacity-100'
            }`}
          >
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Nome da Turma</th>
                  <th className="px-6 py-4">Turno</th>
                  <th className="px-6 py-4">Membros Ativos</th>
                  <th className="px-6 py-4">Data de Criação</th>
                  <th className="px-6 py-4 text-right">Controles (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="w-28 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                          <div className="w-10 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-red-500 font-bold">
                      Erro ao carregar as turmas.
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                          <School className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                          Nenhuma turma ativa!
                        </h3>
                        <p className="text-sm text-slate-500 max-w-sm">
                          Os pedidos aprovados aparecerão nesta listagem.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => {
                    const shift = cls.turno || cls.shift;
                    let badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                    if (shift === 'Manhã') badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                    if (shift === 'Tarde') badgeClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
                    if (shift === 'Noite') badgeClass = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
                    if (shift === 'Integral') badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';

                    const className = cls.nomeOficial || cls.name || `${cls.ano} ${cls.curso}`;
                    const createdDate = cls.dataCriacao || cls.createdAt;
                    const formattedDate = createdDate
                      ? new Date(createdDate).toLocaleDateString('pt-BR')
                      : '—';

                    return (
                      <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          <div>
                            <span>{className}</span>
                            {cls.codigoConvite && (
                              <span className="block text-xs font-mono text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                                Código: {cls.codigoConvite}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}
                          >
                            {shift}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-400">
                            <Users className="w-4 h-4 text-slate-400" />
                            {cls.activeMembers} {cls.activeMembers === 1 ? 'aluno' : 'alunos'}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formattedDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleGodMode(cls)}
                              className="px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 transition-colors shadow-sm rounded-lg flex items-center gap-2"
                              title="Acessar como Deus (God Mode)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Acessar Painel
                            </button>
                            <button
                              onClick={() => setClassToDelete(cls)}
                              disabled={deleteMutation.isPending && classToDelete?.id === cls.id}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                              title="Excluir Turma"
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

          {/* Paginação */}
          {totalPages > 1 && !isLoading && !isError && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isPlaceholderData}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                &larr; Anterior
              </button>

              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Página <span className="text-slate-900 dark:text-white">{currentPage}</span> de {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isPlaceholderData}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                Próxima &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!classToDelete}
        title="Destruir Turma"
        message={`Tem absoluta certeza que deseja destruir a turma "${
          classToDelete?.nomeOficial || classToDelete?.name || ''
        }"? Esta ação removerá a turma do banco de dados, desvinculará todos os alunos e apagará todos os eventos associados. Esta ação não pode ser desfeita.`}
        isDestructive={true}
        confirmText="Sim, Destruir Turma"
        onConfirm={confirmDelete}
        onCancel={() => setClassToDelete(null)}
      />
    </div>
  );
}
