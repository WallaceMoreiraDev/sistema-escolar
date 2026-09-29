import { FundingSection } from './components/FundingSection';

export function SystemAdminPage() {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Painel do Administrador Geral</h1>
        <p className="text-slate-500">QG do Sistema. Acesso restrito à diretoria e administração da plataforma.</p>
      </header>

      <div className="space-y-8">
        {/* BLOCO A: Gestão de Financiamento */}
        <FundingSection />

        {/* Os próximos blocos virão nas etapas seguintes */}
      </div>
    </div>
  );
}
