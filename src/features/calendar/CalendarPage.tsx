import { useState } from 'react'

export function CalendarPage() {
  const [role, setRole] = useState<'ALUNO' | 'LIDER'>('ALUNO') // Mock para mostrar diferença UI
  
  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário da Turma</h1>
          <p className="text-muted-foreground">Filtre por tipo de evento e nunca perca prazos.</p>
        </div>
        
        {role === 'LIDER' && (
          <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg shadow-md hover:bg-primary/90 font-medium flex items-center gap-2">
            <span>+</span> Novo Evento
          </button>
        )}
      </header>

      {/* Mocking Role Switcher for preview purposes */}
      <div className="mb-6 p-4 glass rounded-lg flex gap-4 items-center">
        <span className="text-sm font-medium">Modo de visualização (Apenas Teste):</span>
        <button onClick={() => setRole('ALUNO')} className={`px-3 py-1 rounded-md text-sm ${role === 'ALUNO' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}>Aluno</button>
        <button onClick={() => setRole('LIDER')} className={`px-3 py-1 rounded-md text-sm ${role === 'LIDER' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}>Líder de Turma</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filtros Sidebar */}
        <div className="glass p-5 rounded-2xl h-fit">
          <h3 className="font-bold mb-4">Filtros</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
              <span className="text-sm">Provas (1)</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
              <span className="text-sm">Trabalhos (2)</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
              <span className="text-sm">Eventos / Feriados (0)</span>
            </label>
          </div>
        </div>

        {/* Visão Semanal Mockada */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-5 gap-4">
            {/* Day Column */}
            <div className="flex flex-col gap-4">
              <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs text-muted-foreground uppercase">Seg</p>
                <p className="text-lg font-bold">23</p>
              </div>
              <div className="glass p-3 rounded-lg border-l-4 border-l-destructive cursor-pointer hover:scale-105 transition-transform">
                <span className="text-[10px] font-bold text-destructive">PROVA</span>
                <p className="text-sm font-bold mt-1">Geometria</p>
              </div>
            </div>

            {/* Day Column */}
            <div className="flex flex-col gap-4">
              <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs text-muted-foreground uppercase">Ter</p>
                <p className="text-lg font-bold">24</p>
              </div>
            </div>

            {/* Day Column */}
            <div className="flex flex-col gap-4">
              <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs text-muted-foreground uppercase">Qua</p>
                <p className="text-lg font-bold text-primary">25</p>
              </div>
              <div className="glass p-3 rounded-lg border-l-4 border-l-blue-500 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-[10px] font-bold text-blue-500">TRABALHO</span>
                <p className="text-sm font-bold mt-1">Era Vargas (PDF)</p>
              </div>
            </div>
            
            {/* Day Column */}
            <div className="flex flex-col gap-4">
              <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs text-muted-foreground uppercase">Qui</p>
                <p className="text-lg font-bold">26</p>
              </div>
            </div>

            {/* Day Column */}
            <div className="flex flex-col gap-4">
              <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs text-muted-foreground uppercase">Sex</p>
                <p className="text-lg font-bold">27</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
