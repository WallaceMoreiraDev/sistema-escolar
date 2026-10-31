import { createPortal } from 'react-dom';
import { 
  X, 
  LogOut, 
  Mail, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  User as UserIcon,
  Clock,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileModal({ isOpen, onClose, onLogout }: ProfileModalProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

  const userName = user?.nome || 'Aluno';
  const userInitials = userName.substring(0, 2).toUpperCase();
  const role = user?.role || 'ALUNO';

  const roleConfig = {
    ADMIN: {
      label: 'Administrador Geral',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    LIDER: {
      label: 'Líder de Turma',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    ALUNO: {
      label: 'Estudante',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      icon: <UserIcon className="w-3.5 h-3.5" />,
    },
  }[role];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors z-10"
          aria-label="Fechar perfil"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho do Perfil */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-[3px] shadow-lg shadow-primary/20 mb-3.5">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-2xl font-black text-primary">
              {userInitials}
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white break-words max-w-full">
            {userName}
          </h3>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-2 ${roleConfig.badgeClass}`}>
            {roleConfig.icon}
            <span>{roleConfig.label}</span>
          </div>
        </div>

        {/* Detalhes do Aluno / Turma */}
        <div className="py-5 space-y-4">
          {/* E-mail */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                E-mail Cadastrado
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-all">
                {user?.email || 'Não informado'}
              </p>
            </div>
          </div>

          {/* Turma Oficial */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Turma Oficial
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white break-words leading-snug">
                {user?.turma?.nomeOficial || 'Sem Turma Vinculada'}
              </p>

              {user?.turma && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {user.turma.turno && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Turno {user.turma.turno}
                    </span>
                  )}
                  {user.turma.localSala && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {user.turma.localSala}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações do Rodapé */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Encerrar Sessão
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
