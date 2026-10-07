import { useState } from 'react'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { CrowdfundingBanner } from './components/CrowdfundingBanner'
import { WeeklySummary } from './components/WeeklySummary'
import { FixedLinks } from './components/FixedLinks'
import { MuralPreview } from './components/MuralPreview'
import { NoClassBanner } from './components/NoClassBanner'

export function DashboardPage() {
  // Mock State de UI para testar visualmente os dois cenários do documento de UX
  const [hasClass, setHasClass] = useState(false)
  const { user } = useAuth()
  
  const firstName = user?.nome?.split(' ')[0] || 'Aluno'

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Bom dia, {firstName} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {hasClass ? "Aqui está o que você precisa focar hoje na Turma 3º B." : "Bem-vindo! Descubra as ferramentas que a plataforma oferece."}
          </p>
        </div>
        
        {/* Switcher visual de testes - Fica flutuando no canto */}
        <div className="flex gap-2 p-1.5 glass rounded-lg">
           <button 
             onClick={() => setHasClass(false)} 
             className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${!hasClass ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
             Sem Turma
           </button>
           <button 
             onClick={() => setHasClass(true)} 
             className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${hasClass ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
             Com Turma
           </button>
        </div>
      </header>

      {/* Visível em AMBOS os cenários */}
      <CrowdfundingBanner />
      
      {/* Visível em AMBOS os cenários */}
      <div className="mb-10">
        <MuralPreview />
      </div>

      {/* Renderização Condicional do Resumo vs CTA Vazio */}
      {hasClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <WeeklySummary />
          <FixedLinks />
        </div>
      ) : (
        <NoClassBanner />
      )}
    </div>
  )
}
