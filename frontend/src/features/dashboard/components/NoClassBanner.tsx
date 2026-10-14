import { useState } from 'react';
import { JoinClassModal } from './JoinClassModal';
import { CreateClassModal } from './CreateClassModal';
import {
  useMyPendingClassRequest,
  useCancelClassRequest,
} from '../../class-requests/hooks/useClassRequests';
import { ApiError } from '@/utils/apiError';
import { getErrorMessage } from '@/utils/errorMessages';

import { createPortal } from 'react-dom';

export function NoClassBanner() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const { data: pendingRequest, isLoading } = useMyPendingClassRequest();
  const cancelMutation = useCancelClassRequest();

  const handleConfirmCancel = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        setIsCancelConfirmOpen(false);
      },
    });
  };

  const cancelErrorMessage = cancelMutation.error
    ? cancelMutation.error instanceof ApiError
      ? getErrorMessage(cancelMutation.error.code)
      : cancelMutation.error.message || 'Erro ao cancelar solicitação.'
    : null;

  // Estado de carregamento com Skeleton elegante (GEMINI.md Seção 5 - Anti Layout Shift)
  if (isLoading) {
    return (
      <div className="glass-panel p-8 sm:p-10 rounded-3xl animate-pulse">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-64" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-96 max-w-full" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-48 mt-4" />
        </div>
      </div>
    );
  }

  // Se houver solicitação pendente em análise, exibe o estado de moderação
  if (pendingRequest) {
    const formattedDate = new Date(pendingRequest.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-amber-200/50 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                  Aguardando Aprovação
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Enviado em {formattedDate}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Sua solicitação de turma está em análise
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsCancelConfirmOpen(true)}
            disabled={cancelMutation.isPending}
            className="px-5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Cancelar Solicitação</span>
          </button>
        </div>

        {cancelErrorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{cancelErrorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Turma Solicitada</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
              {pendingRequest.ano} {pendingRequest.curso}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Turno</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
              {pendingRequest.turno}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Local / Sala</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
              {pendingRequest.localSala || 'Não especificada'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Status do Pedido</span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-1 block capitalize">
              {pendingRequest.status}
            </span>
          </div>
        </div>

        {pendingRequest.justificativa && (
          <div className="mt-4 p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 text-sm">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Justificativa apresentada:</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed italic">
              "{pendingRequest.justificativa}"
            </p>
          </div>
        )}

        <div className="flex items-start gap-2.5 text-xs text-slate-400 mt-5 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            O administrador da plataforma avaliará sua solicitação. Assim que aprovada, a sala será criada automaticamente, você se tornará o Líder desta turma e receberá o Código de Convite para compartilhar com seus colegas.
          </p>
        </div>

        {isCancelConfirmOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => !cancelMutation.isPending && setIsCancelConfirmOpen(false)}
            />

            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-left">
              <div className="w-14 h-14 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Cancelar Solicitação?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Tem certeza de que deseja cancelar esta solicitação de turma? Seu pedido será removido da fila de análise e você poderá fazer uma nova solicitação se desejar.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={cancelMutation.isPending}
                  onClick={() => setIsCancelConfirmOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm"
                >
                  Manter Pedido
                </button>
                <button
                  type="button"
                  disabled={cancelMutation.isPending}
                  onClick={handleConfirmCancel}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {cancelMutation.isPending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Cancelando...</span>
                    </>
                  ) : (
                    'Sim, Cancelar'
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Estado padrão: Aluno sem turma e sem pedido pendente
  return (
    <>
      <div className="glass-panel p-8 sm:p-10 rounded-3xl flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Você ainda não faz parte de nenhuma turma.
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
          Vincule-se a uma sala usando o código de convite fornecido pelo seu líder, ou solicite a criação de uma nova sala caso você seja o representante.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 font-bold transition-all hover:-translate-y-1 active:scale-95 text-center"
          >
            Entrar em uma Turma
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-1 active:scale-95"
          >
            Solicitar Criação de Turma
          </button>
        </div>
      </div>

      <JoinClassModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={() => {
          setIsJoinOpen(false);
        }}
      />

      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
