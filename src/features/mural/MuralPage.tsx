export function MuralPage() {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mural Geral</h1>
        <p className="text-muted-foreground">Avisos da diretoria e comunicados institucionais.</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
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
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
              </div>
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
