import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LogOut, 
  Sparkles, 
  LayoutDashboard, 
  Calendar, 
  Megaphone, 
  Settings, 
  ShieldCheck, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { ConfirmModal } from '../ui/ConfirmModal';
import { WelcomeModal } from '@/features/dashboard/components/WelcomeModal';
import { ProfileModal } from './ProfileModal';

// === CONSTANTES DOS LINKS PARA REUTILIZAR ===
const NAV_LINKS = [
  { path: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/app/minha-turma', label: 'Minha Turma', icon: <Calendar className="w-5 h-5" /> },
  { path: '/app/mural', label: 'Mural Geral', icon: <Megaphone className="w-5 h-5" /> },
  { path: '/app/painel-turma', label: 'Painel Turma', icon: <Settings className="w-5 h-5" /> },
];

const ADMIN_LINKS = [
  { path: '/app/painel-admin', label: 'Admin Geral', icon: <ShieldCheck className="w-5 h-5" /> },
];

interface SidebarProps {
  onOpenWelcome: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

interface MobileNavProps {
  onOpenWelcome: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

// === SIDEBAR DESKTOP ===
export function Sidebar({ onOpenWelcome, onOpenProfile, onLogout }: SidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { user } = useAuth();
  
  const userName = user?.nome || 'Aluno';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const isTurmaLeaderOrAdmin = !!user?.turma && (user?.role === 'LIDER' || user?.role === 'ADMIN');
  const isAdmin = user?.role === 'ADMIN';

  const visibleNavLinks = NAV_LINKS.filter(link => {
    if (link.path === '/app/painel-turma') {
      return isTurmaLeaderOrAdmin;
    }
    return true;
  });

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-slate-200/50 bg-white/40 backdrop-blur-3xl z-10">
      <div className="p-6 flex items-center gap-3">
        <img 
          src="/pwa-192x192.png" 
          alt="Prumo" 
          className="w-8 h-8 rounded-xl object-contain shadow-sm bg-white border border-slate-200/50 p-0.5" 
        />
        <span className="font-bold tracking-tight text-lg text-slate-900">Prumo</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {visibleNavLinks.map(link => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}

        {isAdmin && ADMIN_LINKS.map(link => (
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
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/50 bg-white/50 hover:bg-white hover:border-slate-300 hover:shadow-sm backdrop-blur-sm transition-all cursor-pointer group"
          title="Clique para ver perfil completo"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-[2px] shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-sm font-bold text-primary">
              {userInitials}
            </div>
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.turma?.nomeOficial || 'Sem Turma'}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
            title="Encerrar Sessão"
            aria-label="Encerrar Sessão"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 text-center space-y-1">
          <button
            type="button"
            onClick={onOpenWelcome}
            className="w-full text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5 py-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Sobre o Prumo & Boas-Vindas</span>
          </button>
          <Link 
            to="/privacidade" 
            className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 py-1"
          >
            Privacidade & LGPD
          </Link>
        </div>
      </div>
    </aside>
  );
}

// === NAVEGAÇÃO MOBILE (BOTTOM BAR + DRAWER) ===
export function MobileNav({ 
  onOpenWelcome, 
  onOpenProfile, 
  onLogout, 
  isDrawerOpen, 
  setIsDrawerOpen 
}: MobileNavProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { user } = useAuth();
  
  const userName = user?.nome || 'Aluno';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const isTurmaLeaderOrAdmin = !!user?.turma && (user?.role === 'LIDER' || user?.role === 'ADMIN');
  const isAdmin = user?.role === 'ADMIN';

  const visibleNavLinks = NAV_LINKS.filter(link => {
    if (link.path === '/app/painel-turma') {
      return isTurmaLeaderOrAdmin;
    }
    return true;
  });

  // Fecha o drawer automaticamente ao mudar de rota
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname, setIsDrawerOpen]);

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
  const bottomNavLinks = visibleNavLinks.slice(0, 3);

  return (
    <>
      {/* 1. Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/50 z-40 md:hidden flex items-center justify-around pt-2 px-2 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        {bottomNavLinks.map(link => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${isActive(link.path) ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <div className="scale-90 mb-1">{link.icon}</div>
            <span className="text-[10px] font-bold tracking-tight">{link.label}</span>
          </Link>
        ))}
        
        {/* Botão Menu */}
        <button 
          type="button"
          onClick={() => setIsDrawerOpen(true)} 
          className="flex flex-col items-center py-2 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Abrir menu"
        >
          <div className="scale-90 mb-1">
            <Menu className="w-5 h-5" />
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
      <div className={`fixed top-0 right-0 h-full w-[290px] sm:w-[320px] bg-white/95 backdrop-blur-3xl border-l border-slate-200/50 z-[70] transform transition-transform duration-300 md:hidden flex flex-col shadow-2xl ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-200/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/pwa-192x192.png" 
              alt="Prumo" 
              className="w-8 h-8 rounded-xl object-contain shadow-sm bg-white border border-slate-200/50 p-0.5" 
            />
            <span className="font-bold tracking-tight text-lg text-slate-900">Prumo</span>
          </div>
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(false)} 
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-full transition-colors active:scale-95"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Navegação Principal</p>
          {visibleNavLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="h-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Administração</p>
              {ADMIN_LINKS.map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${isActive(link.path) ? 'bg-red-500/10 text-red-500' : 'text-slate-600 hover:bg-red-50 hover:text-red-600'}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Informações do Aluno no Rodapé do Drawer */}
        <div className="p-5 border-t border-slate-200/50 bg-slate-50/50">
          <div 
            onClick={() => {
              setIsDrawerOpen(false);
              onOpenProfile();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/60 bg-white shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
            title="Clique para ver o perfil completo"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-[2px] shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-sm font-bold text-primary">
                {userInitials}
              </div>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{userName}</p>
              <p className="text-xs font-medium text-slate-500 truncate">{user?.turma?.nomeOficial || 'Sem Turma'}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDrawerOpen(false);
                onLogout();
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
              title="Encerrar Sessão"
              aria-label="Encerrar Sessão"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 text-center space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenWelcome();
              }}
              className="w-full text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5 py-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Sobre o Prumo & Boas-Vindas</span>
            </button>
            <Link 
              to="/privacidade" 
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 py-1"
            >
              Privacidade & LGPD
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// === LAYOUT PRINCIPAL ===
export function AppLayout() {
  const { user, signOut } = useAuth();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const firstName = user?.nome?.trim().split(/\s+/)[0] || 'Aluno';
  const userInitials = (user?.nome || 'Aluno').substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col md:flex-row overflow-x-hidden pb-20 md:pb-0">
      <Sidebar 
        onOpenWelcome={() => setIsWelcomeModalOpen(true)} 
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={() => setIsLogoutModalOpen(true)}
      />
      <MobileNav 
        onOpenWelcome={() => setIsWelcomeModalOpen(true)} 
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={() => setIsLogoutModalOpen(true)}
        isDrawerOpen={isDrawerOpen} 
        setIsDrawerOpen={setIsDrawerOpen} 
      />

      <div className="flex-1 md:ml-64 relative min-w-0 flex flex-col">
        {/* Cabeçalho Compacto Mobile (Identificação Leve do Aluno) */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-2.5">
            <img 
              src="/pwa-192x192.png" 
              alt="Prumo" 
              className="w-7 h-7 rounded-xl object-contain shadow-sm bg-white border border-slate-200/50 p-0.5" 
            />
            <span className="font-extrabold tracking-tight text-base text-slate-900">Prumo</span>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shadow-sm transition-all active:scale-95"
            title="Ver meu perfil completo"
            aria-label="Ver meu perfil completo"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-[1.5px] shrink-0">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                {userInitials}
              </div>
            </div>
            <span>{firstName}</span>
          </button>
        </header>

        <main className="flex-1 relative min-w-0 flex flex-col">
          {/* Container para os glows não vazarem a tela */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
            <div className="absolute bottom-0 right-[-10%] w-96 h-96 bg-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
          </div>
          
          <div className="relative z-10 w-full max-w-5xl mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Encerrar Sessão"
        message="Tem certeza que deseja sair da sua conta?"
        confirmText="Sim, Sair"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={async () => {
          setIsLogoutModalOpen(false);
          await signOut();
        }}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
