import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, AlertCircle, Loader2 } from 'lucide-react';

import { useUsefulLinks } from '../../class-admin/hooks/useUsefulLinks';
import { useClassMembers, useLeaveClass } from '../../class-admin/hooks/useClassMembers';
import { ApiError } from '@/utils/apiError';
import { getErrorMessage } from '@/utils/errorMessages';

export function ClassSidebar() {
  const navigate = useNavigate();
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [linksPage, setLinksPage] = useState(1);
  const [membersPage, setMembersPage] = useState(1);
  const linksLimit = 4;
  
  const { data: links, isLoading: isLoadingLinks } = useUsefulLinks();
  const { data: membersResponse, isLoading: isLoadingMembers } = useClassMembers(membersPage);
  const { mutate: leaveClass, isPending: isLeaving } = useLeaveClass();
  
  const safeLinks = links || [];
  const linksTotalPages = Math.ceil(safeLinks.length / linksLimit) || 1;
  const currentLinksPage = Math.min(linksPage, linksTotalPages);
  const paginatedLinks = safeLinks.slice((currentLinksPage - 1) * linksLimit, currentLinksPage * linksLimit);

  const membersList = membersResponse?.data || [];
  const membersTotalPages = membersResponse?.meta?.pagination?.totalPages || 1;
  const totalMembersCount = membersResponse?.meta?.pagination?.total || membersList.length;
  const isSoleMember = totalMembersCount === 1;

  const handleLeaveClass = () => {
    setLeaveError(null);
    leaveClass(undefined, {
      onSuccess: () => {
        setShowConfirmLeave(false);
        navigate('/app/dashboard');
      },
      onError: (err: unknown) => {
        if (err instanceof ApiError) {
          setLeaveError(getErrorMessage(err.code));
        } else {
          setLeaveError('Ocorreu um erro ao sair da turma. Tente novamente.');
        }
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Bloco D: Acesso Rápido */}
      <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 h-fit">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          Links Rápidos
        </h3>
        <div className="flex flex-col gap-2">
          {isLoadingLinks ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`sk-link-${i}`} className="px-4 py-3 bg-white/50 dark:bg-slate-900/50 rounded-xl flex items-center justify-between shadow-sm border border-transparent animate-pulse h-[46px]">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))
          ) : paginatedLinks.length > 0 ? paginatedLinks.map(link => (
            <a 
              key={link.id} 
              href={link.urlLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between group shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <span className="line-clamp-1">{link.titulo}</span>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          )) : (
            <p className="text-xs font-medium text-slate-500 text-center py-2">Nenhum link útil.</p>
          )}

          {linksTotalPages > 1 && (
            <div className="flex justify-between items-center p-2 mt-1">
              <button 
                onClick={() => setLinksPage(p => Math.max(1, p - 1))}
                disabled={currentLinksPage === 1}
                className="px-2 py-1 text-[10px] font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors"
              >
                &larr; Ant
              </button>
              <span className="text-[10px] font-bold text-slate-500">
                Página {currentLinksPage} de {linksTotalPages}
              </span>
              <button 
                onClick={() => setLinksPage(p => Math.min(linksTotalPages, p + 1))}
                disabled={currentLinksPage === linksTotalPages}
                className="px-2 py-1 text-[10px] font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors"
              >
                Próx &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Bloco E: Lista de Membros */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Membros
            </h3>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-bold">
              {totalMembersCount} Alunos
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {isLoadingMembers ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={`sk-member-${i}`} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-transparent animate-pulse h-10">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              ))
            ) : membersList.map(member => {
              const isLeader = member.role === 'LIDER';
              const isAdmin = member.role === 'ADMIN';
              const isAuthority = isLeader || isAdmin;

              return (
                <div 
                  key={member.id} 
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    isAdmin
                      ? 'bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40'
                      : isLeader 
                      ? 'bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className={`text-sm font-semibold truncate ${isAuthority ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {member.nome}
                  </span>
                  
                  {isLeader && (
                    <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      Líder
                    </span>
                  )}

                  {isAdmin && (
                    <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/50 border border-amber-300/60 dark:border-amber-700/50 px-2 py-1 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {membersTotalPages > 1 && (
            <div className="flex justify-between items-center p-3 mt-4 border-t border-slate-100 dark:border-slate-800/50">
              <button 
                onClick={() => setMembersPage(p => Math.max(1, p - 1))}
                disabled={membersPage === 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors"
              >
                &larr; Anterior
              </button>
              <span className="text-xs font-bold text-slate-500">
                Página <span className="text-slate-900 dark:text-white">{membersPage}</span> de {membersTotalPages}
              </span>
              <button 
                onClick={() => setMembersPage(p => Math.min(membersTotalPages, p + 1))}
                disabled={membersPage === membersTotalPages}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors"
              >
                Próxima &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Bloco F: Sair da Turma */}
        <div className="mt-2">
          {!showConfirmLeave ? (
            <button 
              onClick={() => {
                setLeaveError(null);
                setShowConfirmLeave(true);
              }}
              className="w-full md:w-auto md:px-8 py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 dark:bg-rose-950/30 dark:hover:bg-rose-600 rounded-2xl transition-all border border-rose-100 dark:border-rose-900/50 ml-auto"
            >
              <LogOut className="w-4 h-4" />
              Sair da Turma
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 animate-in fade-in zoom-in-95 duration-200 ml-auto w-full md:w-96 space-y-3">
              {leaveError && (
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{leaveError}</span>
                </div>
              )}

              {isSoleMember && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2 text-left leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <span>
                    Atenção: Você é o único membro restante nesta turma. Ao sair, a turma será <strong>permanentemente encerrada e excluída</strong>, e todos os seus eventos apagados.
                  </span>
                </div>
              )}

              <p className="text-sm font-bold text-rose-700 dark:text-rose-300 text-center">
                {isSoleMember ? 'Deseja sair e encerrar a turma?' : 'Tem certeza que deseja sair da turma?'}
              </p>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setLeaveError(null);
                    setShowConfirmLeave(false);
                  }}
                  disabled={isLeaving}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleLeaveClass}
                  disabled={isLeaving}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isLeaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saindo...
                    </>
                  ) : isSoleMember ? (
                    'Sair e Encerrar Turma'
                  ) : (
                    'Sim, Sair'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
