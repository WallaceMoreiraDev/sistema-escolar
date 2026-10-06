import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProfile } from '@/features/auth/hooks/useProfile';

// === CONSTANTES DOS LINKS PARA REUTILIZAR ===
const NAV_LINKS = [
  { path: '/app/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { path: '/app/minha-turma', label: 'Minha Turma', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
  { path: '/app/mural', label: 'Mural Geral', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
  { path: '/app/painel-turma', label: 'Painel Turma', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
];

const ADMIN_LINKS = [
  { path: '/app/painel-admin', label: 'Admin Geral', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> }
];

// === SIDEBAR DESKTOP ===
export function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { data: profile } = useProfile();
  
  const userName = profile?.name || 'Aluno';
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-slate-200/50 bg-white/40 backdrop-blur-3xl dark:bg-black/20 z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/30">
          P
        </div>
        <span className="font-bold tracking-tight text-lg">Prumo</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {NAV_LINKS.map(link => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}

        {ADMIN_LINKS.map(link => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium mt-4 ${isActive(link.path) ? 'bg-red-500/10 text-red-500' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-6">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-white/80 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-[2px]">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-sm font-bold text-primary">
              {userInitials}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">3º B - DS</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// === NAVEGAÇÃO MOBILE (BOTTOM BAR + DRAWER) ===
export function MobileNav() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;
  const { data: profile } = useProfile();
  
  const userName = profile?.name || 'Aluno';
  const userInitials = userName.substring(0, 2).toUpperCase();

  // Fecha o drawer automaticamente ao mudar de rota
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Bloqueia o scroll do body quando o drawer estiver aberto
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isDrawerOpen]);

  // Os 3 links principais para a Bottom Bar
  const bottomNavLinks = NAV_LINKS.slice(0, 3);

  return (
    <>
      {/* 1. Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 z-40 md:hidden flex items-center justify-around pb-safe pt-2 px-2 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
        {bottomNavLinks.map(link => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${isActive(link.path) ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <div className="scale-90 mb-1">{link.icon}</div>
            <span className="text-[10px] font-bold tracking-tight">{link.label}</span>
          </Link>
        ))}
        
        {/* Botão Menu */}
        <button 
          onClick={() => setIsDrawerOpen(true)} 
          className="flex flex-col items-center py-2 px-3 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <div className="scale-90 mb-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </div>
          <span className="text-[10px] font-bold tracking-tight">Menu</span>
        </button>
      </nav>

      {/* 2. Overlay do Drawer */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* 3. Drawer Lateral (Todas as Opções) */}
      <div className={`fixed top-0 right-0 h-full w-[280px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-l border-slate-200/50 dark:border-slate-800/50 z-[70] transform transition-transform duration-300 md:hidden flex flex-col shadow-2xl ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/30">
              P
            </div>
            <span className="font-bold tracking-tight text-lg dark:text-white">Prumo</span>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Navegação Principal</p>
          {NAV_LINKS.map(link => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          <div className="h-4"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Administração</p>
          {ADMIN_LINKS.map(link => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${isActive(link.path) ? 'bg-red-500/10 text-red-500' : 'text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600'}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-[2px] shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                {userInitials}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">3º B - DS</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// === LAYOUT PRINCIPAL ===
export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50/30 flex overflow-x-hidden pb-20 md:pb-0">
      <Sidebar />
      <MobileNav />
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
