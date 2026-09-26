import { Outlet, Link, useLocation } from 'react-router-dom'

export function Sidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-slate-200/50 bg-white/40 backdrop-blur-3xl dark:bg-black/20 z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/30">
          P
        </div>
        <span className="font-bold tracking-tight text-lg">Prumo</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link 
          to="/app/dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/app/dashboard') ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Dashboard
        </Link>
        <Link 
          to="/app/calendario" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/app/calendario') ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Calendário
        </Link>
        <Link 
          to="/app/mural" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/app/mural') ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
          Mural Geral
        </Link>
      </nav>

      <div className="p-6">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-white/80 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-[2px]">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-sm font-bold text-primary">
              AL
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">Aluno Comum</p>
            <p className="text-xs text-slate-500 truncate">3º B - DS</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50/30 flex overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-64 relative min-w-0 flex flex-col">
        {/* Container para os glows não vazarem a tela */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 right-[-10%] w-96 h-96 bg-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
