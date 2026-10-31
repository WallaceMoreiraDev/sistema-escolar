import { useAuth } from '@/features/auth/contexts/AuthContext';
import { WelcomeBanner } from './components/WelcomeBanner';
import { CrowdfundingBanner } from './components/CrowdfundingBanner';
import { WeeklySummary } from './components/WeeklySummary';
import { FixedLinks } from './components/FixedLinks';
import { MuralPreview } from './components/MuralPreview';
import { NoClassBanner } from './components/NoClassBanner';

export function DashboardPage() {
  const { user } = useAuth();
  
  const hasClass = !!user?.turma;
  const firstName = user?.nome?.split(' ')[0] || 'Aluno';

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <WelcomeBanner />

      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Bom dia, {firstName}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {hasClass && user?.turma
              ? `Aqui está o que você precisa focar hoje na Turma ${user.turma.nomeOficial}.`
              : 'Bem-vindo! Descubra as ferramentas que a plataforma oferece.'}
          </p>
        </div>
      </header>

      {/* Visível em AMBOS os cenários */}
      <CrowdfundingBanner />
      
      {/* Visível em AMBOS os cenários */}
      <div className="mb-10">
        <MuralPreview />
      </div>

      {/* Renderização Condicional do Resumo vs CTA Vazio baseado na presença real de turma */}
      {hasClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <WeeklySummary />
          <FixedLinks />
        </div>
      ) : (
        <NoClassBanner />
      )}
    </div>
  );
}
