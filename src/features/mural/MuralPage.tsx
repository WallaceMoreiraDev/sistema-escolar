import { Outlet, useNavigate } from 'react-router-dom'

export function MuralPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mural Geral</h1>
          <p className="text-muted-foreground">Avisos da diretoria e comunicados institucionais.</p>
        </header>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* AVISO 1 */}
          <div 
            onClick={() => navigate('aviso/1')}
            className="glass p-6 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
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
              <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">URGENTE</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Semana Paulo Freire - Cancelamento de Aulas</h2>
            <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
              Aviso oficial: Devido aos eventos da Semana Paulo Freire, não haverá aulas regulares na próxima quarta-feira. A presença será computada através da participação nos workshops.
            </p>
          </div>

          {/* AVISO 2 */}
          <div 
            onClick={() => navigate('aviso/2')}
            className="glass p-6 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
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
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">INFORMATIVO</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Sábado Letivo (Reposição)</h2>
            <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
              Teremos sábado letivo para todas as turmas do período da manhã. Horário de funcionamento: 08:00 às 12:00. 
            </p>
          </div>
          
          {/* AVISO 3 */}
          <div 
            onClick={() => navigate('aviso/3')}
            className="glass p-6 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                </div>
                <div>
                  <h3 className="font-bold">Administração</h3>
                  <p className="text-xs text-muted-foreground">12 Set, 09:15</p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">EVENTO</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Campanha do Agasalho ETEC</h2>
            <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
              As caixas de arrecadação para a nossa Campanha do Agasalho já estão disponíveis na entrada principal.
            </p>
          </div>
        </div>
      </div>
      
      <Outlet />
    </>
  )
}
