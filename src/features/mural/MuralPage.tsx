export function MuralPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mural Geral</h1>
        <p className="text-muted-foreground">Avisos da diretoria e comunicados institucionais.</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">🏛️</div>
              <div>
                <h3 className="font-bold">Diretoria ETEC</h3>
                <p className="text-xs text-muted-foreground">Hoje, 08:30</p>
              </div>
            </div>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">URGENTE</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Semana Paulo Freire - Cancelamento de Aulas</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Aviso oficial: Devido aos eventos da Semana Paulo Freire, não haverá aulas regulares na próxima quarta-feira. A presença será computada através da participação nos workshops.
          </p>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">🏫</div>
              <div>
                <h3 className="font-bold">Coordenação</h3>
                <p className="text-xs text-muted-foreground">Ontem, 14:00</p>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Sábado Letivo (Reposição)</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Teremos sábado letivo para todas as turmas do período da manhã. Horário de funcionamento: 08:00 às 12:00. 
          </p>
        </div>
      </div>
    </div>
  )
}
