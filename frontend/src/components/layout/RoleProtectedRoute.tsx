import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { UserRole } from '@shared/types';

interface RoleProtectedRouteProps {
  allowedRoles?: UserRole[];
  requireTurma?: boolean;
}

/**
 * Guardião de rotas cliente baseado em RBAC e vínculo de turma.
 * Impede que usuários sem privilégios acessem páginas digitando URLs restritas no navegador.
 */
export function RoleProtectedRoute({
  allowedRoles,
  requireTurma = false,
}: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não há usuário autenticado no contexto, o ProtectedRoute pai já trata,
  // mas como fail-safe redirecionamos para login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAllowedRole = !allowedRoles || allowedRoles.includes(user.role);
  const hasTurma = !requireTurma || !!user.turma;

  // Se violar role ou turma exigida, redireciona para o dashboard
  if (!hasAllowedRole || !hasTurma) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
