import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/sistema-escolar/app/dashboard' // base do router
      }
    });
    
    if (error) {
      console.error('Erro ao fazer login:', error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 rounded-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Prumo</h1>
          <p className="text-muted-foreground">Faça login para acessar a plataforma escolar.</p>
        </div>
        
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 py-3.5 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold hover:shadow-md hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="w-5 h-5" />
          )}
          {isLoading ? 'Entrando...' : 'Entrar com Google'}
        </button>
      </div>
    </div>
  )
}
