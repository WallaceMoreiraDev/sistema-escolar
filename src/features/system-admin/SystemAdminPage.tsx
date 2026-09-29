import { useNavigate } from 'react-router-dom';
import { FundingSection } from './components/FundingSection';
import { MuralManagementSection } from './components/MuralManagementSection';

export function SystemAdminPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Painel do Administrador Geral</h1>
          <p className="text-slate-500">QG do Sistema. Acesso restrito à diretoria e administração da plataforma.</p>
        </div>
        <button 
          onClick={() => navigate('/app/admin-turmas')}
          className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/30 text-slate-900 dark:text-white rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-primary/20 font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          Gerenciar Turmas
        </button>
      </header>

      <div className="space-y-8">
        {/* BLOCO A: Gestão de Financiamento */}
        <FundingSection />

        {/* BLOCO B: Gestão do Mural Geral */}
        <MuralManagementSection />

        {/* Os próximos blocos virão nas etapas seguintes */}
      </div>
    </div>
  );
}
