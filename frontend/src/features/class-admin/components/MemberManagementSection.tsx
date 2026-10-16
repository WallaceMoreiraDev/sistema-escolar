import { useState } from 'react';
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
} from 'lucide-react';
import { useClassMembers, useUpdateMemberRole, useRemoveMember } from '../hooks/useClassMembers';
import { ClassMemberDTO } from '@shared/types';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

export function MemberManagementSection() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useClassMembers(page);
  const updateRoleMutation = useUpdateMemberRole();
  const removeMutation = useRemoveMember();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Controle do Modal de Confirmação
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive: boolean;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    action: () => {},
  });

  const loggedUserId = user?.id;
  const members: ClassMemberDTO[] = data?.data || [];
  const totalPages = data?.meta?.pagination?.totalPages || 1;

  const handlePromote = (member: ClassMemberDTO) => {
    setErrorMsg(null);
    updateRoleMutation.mutate(
      { id: member.id, newRole: 'leader' },
      {
        onError: (err: unknown) =>
          setErrorMsg(err instanceof Error ? err.message : 'Erro ao promover membro.'),
      }
    );
  };

  const handleDemote = (member: ClassMemberDTO) => {
    setErrorMsg(null);
    if (member.id === loggedUserId) {
      setErrorMsg('Você não pode rebaixar a si mesmo.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Rebaixar Líder',
      message: `Tem certeza que deseja remover o cargo de líder de ${member.nome}?`,
      isDestructive: true,
      action: () => {
        updateRoleMutation.mutate(
          { id: member.id, newRole: 'student' },
          {
            onError: (err: unknown) =>
              setErrorMsg(err instanceof Error ? err.message : 'Erro ao rebaixar membro.'),
          }
        );
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
      title: 'Remover Aluno',
      message: `Tem certeza que deseja expulsar ${member.nome} da turma? Essa ação não pode ser desfeita.`,
      isDestructive: true,
      action: () => {
        removeMutation.mutate(member.id, {
          onError: (err: unknown) =>
            setErrorMsg(err instanceof Error ? err.message : 'Erro ao remover membro.'),
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

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900 font-medium text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
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
                          <div className="flex justify-end gap-2">
                            {isLeader ? (
                              <button
                                onClick={() => handleDemote(member)}
                                disabled={isMe || updateRoleMutation.isPending}
                                title="Rebaixar para Aluno"
                                className="p-2 text-slate-400 hover:text-amber-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePromote(member)}
                                disabled={updateRoleMutation.isPending}
                                title="Promover a Líder"
                                className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleRemove(member)}
                              disabled={isMe || removeMutation.isPending}
                              title="Remover Aluno da Turma"
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <UserMinus className="w-4 h-4" />
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
        confirmText={confirmModal.isDestructive ? 'Sim, tenho certeza' : 'Confirmar'}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </section>
  );
}

