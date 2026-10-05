import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveClasses, useDeleteClass, ActiveClass } from './hooks/useActiveClasses';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export function ActiveClassesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 5;
  const { data: response, isLoading, isError, isPlaceholderData } = useActiveClasses(page, limit);
  const deleteMutation = useDeleteClass();
  const [classToDelete, setClassToDelete] = useState<ActiveClass | null>(null);

  const confirmDelete = () => {
    if (classToDelete) {
      deleteMutation.mutate(classToDelete.id, {
        onSuccess: () => setClassToDelete(null)
      });
    }
  };

  const handleGodMode = (cls: ActiveClass) => {
    // Navigate to class admin panel. In a real app, we'd pass the class ID to load specific context.
    navigate('/app/painel-turma', { state: { godModeClassId: cls.id } });
  };

  const classes = response?.data || [];
  const meta = response?.meta;
  const totalPages = meta?.totalPages || 1;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/painel-admin')}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl shadow-sm transition-colors"
            title="Voltar ao Painel Geral"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Turmas da Escola</h1>
            <p className="text-slate-500">Gestão global de todas as turmas ativas na plataforma.</p>
          </div>
        </div>
      </header>

      <div className="w-full">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              Lista de Turmas
            </h3>
            <span className="text-sm text-slate-500 font-medium">Total: {meta?.total || 0}</span>
          </div>

          <div className={`overflow-x-auto transition-opacity duration-200 ${isPlaceholderData ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
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
                          <div className="w-10 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
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
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Nenhuma turma ativa!</h3>
                        <p className="text-sm text-slate-500 max-w-sm">Os pedidos aprovados aparecerão nesta listagem.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => {
                    let badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                    if (cls.shift === 'Manhã') badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                    if (cls.shift === 'Tarde') badgeClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
                    if (cls.shift === 'Noite') badgeClass = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
                    if (cls.shift === 'Integral') badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';

                    return (
                      <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          {cls.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}>
                            {cls.shift}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            {cls.activeMembers} alunos
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {new Date(cls.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleGodMode(cls)}
                              className="px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 transition-colors shadow-sm rounded-lg flex items-center gap-2"
                              title="Acessar como Deus (God Mode)"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              Acessar Painel
                            </button>
                            <button
                              onClick={() => setClassToDelete(cls)}
                              disabled={deleteMutation.isPending && classToDelete?.id === cls.id}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                              title="Excluir Turma"
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
          {totalPages > 1 && !isLoading && !isError && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 transition-colors flex items-center gap-2"
              >
                &larr; Anterior
              </button>
              
              <span className="text-sm font-bold text-slate-500">
                Página <span className="text-slate-900 dark:text-white">{meta?.page}</span> de {totalPages}
              </span>
              
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 transition-colors flex items-center gap-2"
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
        message={`Tem absoluta certeza que deseja destruir a turma "${classToDelete?.name}"? Esta ação removerá a turma do banco de dados, expulsará todos os alunos e apagará o calendário inteiramente. Esta ação não pode ser desfeita.`}
        isDestructive={true}
        confirmText="Sim, Destruir Turma"
        onConfirm={confirmDelete}
        onCancel={() => setClassToDelete(null)}
      />
    </div>
  );
}
