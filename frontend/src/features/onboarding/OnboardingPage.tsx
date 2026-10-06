import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfile } from '@/features/auth/hooks/useProfile';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const { mutate, isPending } = useUpdateProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return;
    
    mutate({ name: name.trim() }, {
      onSuccess: () => {
        navigate('/app/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg p-8 sm:p-10 rounded-3xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner animate-in zoom-in duration-500 delay-150">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <div className="text-center w-full mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Falta pouco!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            Para garantir que todos te conheçam na plataforma, precisamos do seu nome completo.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Nome Completo
            </label>
            <input 
              id="fullName"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva Mendes"
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              required
              minLength={3}
            />
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 flex gap-3 text-left">
            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="text-sm text-orange-800 dark:text-orange-300">
              <span className="font-bold block mb-0.5">Atenção: Use seu nome verdadeiro!</span>
              A plataforma é um ambiente acadêmico sério. Certifique-se de que não há erros de digitação, pois <strong className="font-extrabold underline decoration-orange-400/50 underline-offset-2">não será possível</strong> alterar seu nome posteriormente nesta versão.
            </div>
          </div>

          <button 
            type="submit"
            disabled={name.trim().length < 3 || isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-lg mt-4"
          >
            {isPending ? 'Salvando...' : 'Continuar para o Dashboard'}
            {!isPending && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
