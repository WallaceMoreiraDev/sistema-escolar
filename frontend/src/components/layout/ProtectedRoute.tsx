import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/contexts/AuthContext';

export function ProtectedRoute() {
  const { session, user, isLoading, isError } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não tem sessão, manda pro login
  if (!session || isError) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
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
