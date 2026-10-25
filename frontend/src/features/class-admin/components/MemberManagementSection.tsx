import { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  User,
  ArrowUp,
  ArrowDown,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  useClassMembers,
  usePromoteMember,
  useDemoteMember,
  useExpelMember,
} from '../hooks/useClassMembers';
import { ClassMemberDTO } from '@shared/types';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { ApiError } from '@/utils/apiError';
import { getErrorMessage } from '@/utils/errorMessages';

interface MemberManagementSectionProps {
  turmaId?: string;
}

export function MemberManagementSection({ turmaId }: MemberManagementSectionProps = {}) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useClassMembers(page, turmaId);
  const promoteMutation = usePromoteMember();
  const demoteMutation = useDemoteMember();
  const expelMutation = useExpelMember();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-dismiss da mensagem de sucesso
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);



  // Controle do Modal de Confirmação
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive: boolean;
    confirmText?: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    action: () => {},
  });

  const loggedUserId = user?.id;
  const isCurrentUserLeaderOrAdmin = user?.role === 'LIDER' || user?.role === 'ADMIN';
  const members: ClassMemberDTO[] = data?.data || [];
  const totalPages = data?.meta?.pagination?.totalPages || 1;
  const isActionPending =
    promoteMutation.isPending || demoteMutation.isPending || expelMutation.isPending;

  const extractApiErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof ApiError) {
      if (err.code === 'LAST_LEADER_CONFLICT') {
        return getErrorMessage(
          'LAST_LEADER_CONFLICT',
          'A turma não pode ficar sem nenhum líder. Promova outro membro antes.'
        );
      }
      if (err.code === 'CANNOT_MODIFY_SELF') {
        return getErrorMessage(
          'CANNOT_MODIFY_SELF',
          'Você não pode realizar esta ação consigo mesmo pelo painel de moderação.'
        );
      }
      return getErrorMessage(err.code, err.message || fallback);
    }
    if (err instanceof Error) {
      return err.message;
    }
    return fallback;
  };

  const handlePromote = (member: ClassMemberDTO) => {
    setErrorMsg(null);
    setConfirmModal({
      isOpen: true,
      title: 'Promover a Líder',
      message: `Tem certeza que deseja promover ${member.nome} a Líder da turma? O membro passará a ter permissão para gerenciar a sala.`,
      isDestructive: false,
      confirmText: 'Promover a Líder',
      action: () => {
        promoteMutation.mutate(member.id, {
          onSuccess: (res) => {
            setSuccessMsg(res.data.message || 'Membro promovido a líder com sucesso.');
          },
          onError: (err: unknown) => {
            setErrorMsg(extractApiErrorMessage(err, 'Erro ao promover membro a líder.'));
          },
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDemote = (member: ClassMemberDTO) => {
    setErrorMsg(null);
    if (member.id === loggedUserId) {
      setErrorMsg('Você não pode realizar esta ação consigo mesmo pelo painel de moderação.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Rebaixar Líder',
      message: `Tem certeza que deseja remover o cargo de líder de ${member.nome}? O membro voltará a ser Aluno comum.`,
      isDestructive: true,
      confirmText: 'Rebaixar para Aluno',
      action: () => {
        demoteMutation.mutate(member.id, {
          onSuccess: (res) => {
            setSuccessMsg(res.data.message || 'Líder rebaixado para aluno com sucesso.');
          },
          onError: (err: unknown) => {
            setErrorMsg(extractApiErrorMessage(err, 'Erro ao rebaixar líder.'));
          },
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRemove = (member: ClassMemberDTO) => {
    setErrorMsg(null);
    if (member.id === loggedUserId) {
      setErrorMsg('Você não pode remover a si mesmo da turma por aqui. Use a opção "Sair da Turma".');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Remover Aluno da Turma',
      message: `Tem certeza que deseja remover ${member.nome} da turma? Essa ação revoga o acesso do aluno à sala.`,
      isDestructive: true,
      confirmText: 'Remover da Turma',
      action: () => {
        expelMutation.mutate(member.id, {
          onSuccess: (res) => {
            setSuccessMsg(res.data.message || 'Aluno removido da turma com sucesso.');
            if (members.length === 1 && page > 1) {
              setPage((p) => Math.max(1, p - 1));
            }
          },
          onError: (err: unknown) => {
            setErrorMsg(extractApiErrorMessage(err, 'Erro ao remover aluno da turma.'));
          },
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <section className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Membros</h2>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 font-bold ml-4"
          >
            Fechar
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900 font-medium text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-600 hover:text-red-800 dark:hover:text-red-200 font-bold ml-4"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        {isError ? (
          <div className="p-8 text-center text-red-500 font-bold">
            Erro ao carregar os membros da turma.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Membro</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Data de Entrada</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-member-${i}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 font-medium">
                      Nenhum membro encontrado nesta turma.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const isLeader = member.role === 'LIDER';
                    const isAdmin = member.role === 'ADMIN';
                    const isMe = member.id === loggedUserId;

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {member.nome}
                              {isMe && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 uppercase tracking-widest font-semibold">
                                  Você
                                </span>
                              )}
                              {isLeader && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest font-semibold">
                                  Líder
                                </span>
                              )}
                              {isAdmin && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 uppercase tracking-widest font-semibold">
                                  Admin
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-500">{member.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isLeader ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Líder
                            </span>
                          ) : member.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              <User className="w-3.5 h-3.5" />
                              Aluno
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                          {member.dataEntradaTurma
                            ? new Date(member.dataEntradaTurma).toLocaleDateString('pt-BR')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isCurrentUserLeaderOrAdmin ? (
                            <div className="flex justify-end gap-2">
                              {member.role === 'ALUNO' && (
                                <button
                                  onClick={() => handlePromote(member)}
                                  disabled={isActionPending}
                                  title="Promover a Líder"
                                  className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                              )}

                              {member.role === 'LIDER' && (
                                <button
                                  onClick={() => handleDemote(member)}
                                  disabled={isMe || isActionPending}
                                  title={isMe ? 'Você não pode rebaixar a si mesmo' : 'Rebaixar para Aluno'}
                                  className="p-2 text-slate-400 hover:text-amber-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleRemove(member)}
                                disabled={isMe || member.role === 'ADMIN' || isActionPending}
                                title={
                                  isMe
                                    ? 'Você não pode remover a si mesmo'
                                    : member.role === 'ADMIN'
                                    ? 'Administradores gerais não podem ser removidos'
                                    : 'Remover Aluno da Turma'
                                }
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-sm font-bold text-slate-500">
              Página <span className="text-slate-900 dark:text-white">{page}</span> de {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        confirmText={confirmModal.confirmText || (confirmModal.isDestructive ? 'Sim, tenho certeza' : 'Confirmar')}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </section>
  );
}
