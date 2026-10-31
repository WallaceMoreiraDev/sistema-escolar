import { useState } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { WelcomeModal } from './WelcomeModal';

const DISMISS_KEY = 'prumo_welcome_dismissed_v1';

export function WelcomeBanner() {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(DISMISS_KEY) === 'true';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <>
      <div className="w-full mb-8 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/10 via-orange-500/10 to-amber-500/5 border border-primary/20 backdrop-blur-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white text-primary flex items-center justify-center shadow-sm shrink-0 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-1">
              Boas-Vindas
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              Novo por aqui? Conheça a história e o propósito do Prumo!
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <span>Conhecer o Prumo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/60 rounded-xl transition-colors shrink-0"
            title="Dispensar aviso"
            aria-label="Dispensar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <WelcomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
