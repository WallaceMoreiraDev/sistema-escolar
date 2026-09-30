import { useState, useMemo } from 'react';
import { usePendingRequests, useApproveRequest, useRejectRequest } from '../hooks/usePendingRequests';
import { PendingRequest } from '../data/mockPendingRequests';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { PendingRequestModal } from './PendingRequestModal';

export function PendingRequestsSection() {
  const { data: requests, isLoading, isError } = usePendingRequests();
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const [requestToApprove, setRequestToApprove] = useState<PendingRequest | null>(null);
  const [requestToReject, setRequestToReject] = useState<PendingRequest | null>(null);
  const [requestToView, setRequestToView] = useState<PendingRequest | null>(null);

  // Pagination logic
  const [page, setPage] = useState(1);
  const limit = 5;

  const paginatedRequests = useMemo(() => {
    if (!requests) return [];
    const startIndex = (page - 1) * limit;
    return requests.slice(startIndex, startIndex + limit);
  }, [requests, page]);

  const totalPages = requests ? Math.ceil(requests.length / limit) : 0;

  const confirmApprove = () => {
    if (requestToApprove) {
      approveMutation.mutate(requestToApprove.id, {
        onSuccess: () => setRequestToApprove(null)
      });
    }
  };

  const confirmReject = () => {
    if (requestToReject) {
      rejectMutation.mutate(requestToReject.id, {
        onSuccess: () => setRequestToReject(null)
      });
    }
  };

  // Format date to show "X dias atrás" or locale string
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <section className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pedidos Pendentes</h2>
              {requests && requests.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-bold">
                  {requests.length} aguardando
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">Aprovação de criação de novas turmas.</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Turma Solicitada</th>
                  <th className="px-6 py-4">Solicitante</th>
                  <th className="px-6 py-4">Justificativa</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Moderação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-red-500 font-bold">
                      Erro ao carregar os pedidos.
                    </td>
                  </tr>
                ) : !requests || requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Tudo limpo por aqui!</h3>
                        <p className="text-sm text-slate-500 max-w-sm">Não há nenhum pedido de criação de turma aguardando moderação no momento.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req) => (
                    <tr 
                      key={req.id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                        onClick={() => setRequestToView(req)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white mb-1">
                              {req.year}º Ano {req.course}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold uppercase tracking-wider">
                                {req.shift}
                              </span>
                              {req.room && <span>• {req.room}</span>}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                              {req.requesterName.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {req.requesterName}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 max-w-[200px] xl:max-w-xs">
                          {req.justification ? (
                            <p className="text-slate-500 dark:text-slate-400 truncate italic" title={req.justification}>
                              "{req.justification}"
                            </p>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 italic">Nenhuma</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                          {formatDate(req.createdAt)}
                        </td>
                        
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setRequestToApprove(req)}
                              disabled={approveMutation.isPending && requestToApprove?.id === req.id}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                              title="Aprovar Pedido"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button
                              onClick={() => setRequestToReject(req)}
                              disabled={rejectMutation.isPending && requestToReject?.id === req.id}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                              title="Rejeitar Pedido"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>

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
                    Página <span className="text-slate-900 dark:text-white">{page}</span> de {totalPages}
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

      <PendingRequestModal
        isOpen={!!requestToView}
        onClose={() => setRequestToView(null)}
        request={requestToView}
        onApprove={(req) => {
          setRequestToView(null);
          setRequestToApprove(req);
        }}
        onReject={(req) => {
          setRequestToView(null);
          setRequestToReject(req);
        }}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!requestToApprove}
        title="Aprovar Criação de Turma"
        message={`Você está prestes a aprovar a turma "${requestToApprove?.year}º Ano ${requestToApprove?.course}". O aluno ${requestToApprove?.requesterName} será definido como líder da turma.`}
        confirmText="Aprovar e Criar"
        onConfirm={confirmApprove}
        onCancel={() => setRequestToApprove(null)}
      />

      <ConfirmModal
        isOpen={!!requestToReject}
        title="Rejeitar Criação de Turma"
        message={`Tem certeza que deseja rejeitar o pedido do aluno ${requestToReject?.requesterName}? Essa ação removerá a solicitação do sistema.`}
        isDestructive={true}
        confirmText="Rejeitar Pedido"
        onConfirm={confirmReject}
        onCancel={() => setRequestToReject(null)}
      />
    </section>
  );
}
