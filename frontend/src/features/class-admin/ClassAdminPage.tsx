import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { adminClassApi } from '../system-admin/api/adminClassApi';
import { InviteSection } from './components/InviteSection';
import { EventManagementSection } from './components/EventManagementSection';
import { MemberManagementSection } from './components/MemberManagementSection';
import { UsefulLinksSection } from './components/UsefulLinksSection';

export function ClassAdminPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const turmaId = searchParams.get('turmaId') || undefined;

  const { user, session } = useAuth();
  const token = session?.access_token;
  const isGodMode = user?.role === 'ADMIN' && !!turmaId;

  const { data: classResponse, isLoading: isLoadingClass } = useQuery({
    queryKey: ['admin-class-details', turmaId],
    queryFn: async () => {
      if (!token || !turmaId) return null;
      return adminClassApi.getClassById(token, turmaId);
    },
    enabled: !!token && isGodMode,
    staleTime: 1000 * 60,
  });

  const inspectedClass = classResponse?.data;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Banner de Modo God / Inspeção pelo Administrador Geral */}
      {isGodMode && (
        <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300/80 dark:border-amber-600/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  Modo God / Inspeção
                </span>
                {inspectedClass?.turno && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    • Turno {inspectedClass.turno}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {isLoadingClass
                  ? 'Carregando turma...'
                  : inspectedClass?.nomeOficial || inspectedClass?.name || 'Turma Selecionada'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Você está visualizando e gerenciando esta turma com privilégios de Administrador Geral.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/admin-turmas')}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shrink-0 shadow-sm self-start sm:self-center"
            title="Voltar para Turmas da Escola"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Turmas
          </button>
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {isGodMode ? 'Administração da Turma (Modo God)' : 'Administração da Turma'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {isGodMode
            ? 'Painel de controle com acesso irrestrito para inspeção e gestão da sala.'
            : 'Área restrita para líderes. Gerencie convites, eventos e membros.'}
        </p>
      </header>

      <div className="space-y-8 max-w-4xl">
        {/* ÁREA 1: Gestão de Convites */}
        <InviteSection
          turma={
            isGodMode && inspectedClass
              ? {
                  codigoConvite: inspectedClass.codigoConvite,
                  nomeOficial: inspectedClass.nomeOficial || inspectedClass.name,
                }
              : undefined
          }
        />

        {/* ÁREA 2: Gestão de Eventos (CRUD) */}
        <EventManagementSection turmaId={turmaId} />

        {/* ÁREA 3: Gestão de Membros */}
        <MemberManagementSection turmaId={turmaId} />

        {/* ÁREA 4: Gestão de Links Úteis */}
        <UsefulLinksSection turmaId={turmaId} />
      </div>
    </div>
  );
}
