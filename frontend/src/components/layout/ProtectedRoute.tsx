import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, LogOut, WifiOff } from 'lucide-react';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { ApiError } from '@/utils/apiError';

export function ProtectedRoute() {
  const { session, user, isLoading, isError, error, signOut } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Se isError ocorrer com status 401, desloga e redireciona imediatamente para o login
  const isUnauthorized = isError && error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (isUnauthorized) {
      signOut();
    }
  }, [isUnauthorized, signOut]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não tem sessão ou se tomou 401 (sessão expirada/inválida), manda pro login
  if (!session || isUnauthorized) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Se há sessão mas ocorreu erro ao conectar à API (ex: servidor offline ou erro de rede)
  if (isError) {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center mb-4 ring-8 ring-red-50/50 dark:ring-red-950/20">
            {isOffline ? <WifiOff className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {isOffline ? 'Sem Conexão com a Internet' : 'Instabilidade na Conexão'}
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {isOffline
              ? 'Você parece estar sem acesso à internet no momento. Verifique sua conexão e tente novamente.'
              : 'Não foi possível conectar ao servidor para carregar seu perfil. Verifique sua conexão e tente novamente.'}
          </p>

          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['me'] })}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all text-xs active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>

            <button
              type="button"
              onClick={() => signOut()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition-all text-xs active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verifica se o usuário precisa de onboarding com base na flag oficial da API
  if (user) {
    // Se o onboarding não foi concluído e não está na rota de onboarding, manda pra lá
    if (!user.onboardingConcluido && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
    
    // Se o onboarding já foi concluído e está tentando acessar o onboarding, manda pro app
    if (user.onboardingConcluido && location.pathname === '/onboarding') {
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  return <Outlet />;
}
