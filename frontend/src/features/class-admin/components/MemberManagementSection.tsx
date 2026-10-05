import { useState, useMemo, useEffect } from 'react';
import { useClassMembers, useUpdateMemberRole, useRemoveMember } from '../hooks/useClassMembers';
import { ClassMember } from '../types';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

export function MemberManagementSection() {
  const { data: members, isLoading, isError } = useClassMembers();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMutation = useRemoveMember();
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Paginação
  const [page, setPage] = useState(1);
  const limit = 5;
  
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
    action: () => {}
  });

  // Simulando o ID do usuário logado (Leader)
  const loggedUserId = 'usr-1';

  const handlePromote = (member: ClassMember) => {
    setErrorMsg(null);
    updateRoleMutation.mutate({ id: member.id, newRole: 'leader' }, {
      onError: (err: any) => setErrorMsg(err.message)
    });
  };

  const handleDemote = (member: ClassMember) => {
    setErrorMsg(null);
    if (member.id === loggedUserId) {
      setErrorMsg('Você não pode rebaixar a si mesmo.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Rebaixar Líder',
      message: `Tem certeza que deseja remover o cargo de líder de ${member.name}?`,
      isDestructive: true,
      action: () => {
        updateRoleMutation.mutate({ id: member.id, newRole: 'student' }, {
          onError: (err: any) => setErrorMsg(err.message)
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRemove = (member: ClassMember) => {
    setErrorMsg(null);
    if (member.id === loggedUserId) {
      setErrorMsg('Você não pode remover a si mesmo da turma por aqui. Use a opção "Sair da Turma".');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Remover Aluno',
      message: `Tem certeza que deseja expulsar ${member.name} da turma? Essa ação não pode ser desfeita.`,
      isDestructive: true,
      action: () => {
        removeMutation.mutate(member.id, {
          onError: (err: any) => setErrorMsg(err.message)
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const sortedMembers = useMemo(() => {
    if (!members) return [];
    return [...members].sort((a, b) => {
      if (a.role === 'leader' && b.role !== 'leader') return -1;
      if (a.role !== 'leader' && b.role === 'leader') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [members]);

  const totalPages = Math.ceil(sortedMembers.length / limit);
  const paginatedMembers = sortedMembers.slice((page - 1) * limit, page * limit);

  // Se a página atual ficar vazia (ex: deletou último item da pág), volta 1
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <section className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Membros</h2>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900 font-medium text-sm flex items-center gap-2 animate-in fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {errorMsg}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        {isError ? (
          <div className="p-8 text-center text-red-500 font-bold">Erro ao carregar os membros.</div>
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
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`sk-member-${i}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : paginatedMembers.map((member) => {
                  const isLeader = member.role === 'leader';
                  const isMe = member.id === loggedUserId;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {member.name}
                            {isMe && <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 uppercase tracking-widest">Você</span>}
                          </span>
                          <span className="text-xs text-slate-500">{member.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isLeader ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Líder
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Aluno
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                        {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handlePromote(member)}
                              disabled={updateRoleMutation.isPending}
                              title="Promover a Líder"
                              className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleRemove(member)}
                            disabled={isMe || removeMutation.isPending}
                            title="Remover Aluno da Turma"
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
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

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        confirmText={confirmModal.isDestructive ? 'Sim, tenho certeza' : 'Confirmar'}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </section>
  );
}
