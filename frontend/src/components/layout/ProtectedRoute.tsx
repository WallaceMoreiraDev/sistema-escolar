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

  // Verifica se o usuário recém criado precisa de onboarding
  // Pela regra de negócio, nome provisório é igual à primeira parte do email
  if (user) {
    const emailPrefix = user.email.split('@')[0];
    const isNewUser = user.nome === emailPrefix;

    // Se é novo e não tá na rota de onboarding, manda pra lá
    if (isNewUser && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
    
    // Se não é novo e tá tentando acessar o onboarding, manda pro app
    if (!isNewUser && location.pathname === '/onboarding') {
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  return <Outlet />;
}
