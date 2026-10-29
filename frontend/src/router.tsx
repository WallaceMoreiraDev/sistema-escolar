import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthPage } from '@/features/auth/AuthPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/layout/RoleProtectedRoute';
import { RouteLoadingSkeleton, ModalRouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

// Carregamento sob demanda (Code Splitting) das páginas da aplicação
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const MuralPage = lazy(() =>
  import('@/features/mural/MuralPage').then((m) => ({ default: m.MuralPage }))
);
const CalendarPage = lazy(() =>
  import('@/features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage }))
);
const EventModal = lazy(() =>
  import('@/features/calendar/components/EventModal').then((m) => ({ default: m.EventModal }))
);
const NoticeModal = lazy(() =>
  import('@/features/mural/components/NoticeModal').then((m) => ({ default: m.NoticeModal }))
);
const ClassAdminPage = lazy(() =>
  import('@/features/class-admin/ClassAdminPage').then((m) => ({ default: m.ClassAdminPage }))
);
const SystemAdminPage = lazy(() =>
  import('@/features/system-admin/SystemAdminPage').then((m) => ({ default: m.SystemAdminPage }))
);
const ActiveClassesPage = lazy(() =>
  import('@/features/system-admin/ActiveClassesPage').then((m) => ({ default: m.ActiveClassesPage }))
);
const OnboardingPage = lazy(() =>
  import('@/features/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('@/features/privacy/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);

const withSuspense = (Component: React.ComponentType, isModal = false) => (
  <Suspense fallback={isModal ? <ModalRouteLoadingSkeleton /> : <RouteLoadingSkeleton />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/privacidade',
    element: withSuspense(PrivacyPolicyPage),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/onboarding',
        element: withSuspense(OnboardingPage),
      },
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          {
            path: 'dashboard',
            element: withSuspense(DashboardPage),
          },
          {
            path: 'mural',
            element: withSuspense(MuralPage),
            children: [
              {
                path: 'aviso/:id',
                element: withSuspense(NoticeModal, true),
              },
            ],
          },
          {
            path: 'minha-turma',
            element: withSuspense(CalendarPage),
            children: [
              {
                path: 'evento/:id',
                element: withSuspense(EventModal, true),
              },
            ],
          },
          // Rotas de Gestão de Turma: Exclusivas para Líder ou Admin com Turma vinculada
          {
            element: <RoleProtectedRoute allowedRoles={['LIDER', 'ADMIN']} requireTurma />,
            children: [
              {
                path: 'painel-turma',
                element: withSuspense(ClassAdminPage),
              },
            ],
          },
          // Rotas de Administração Geral do Sistema: Exclusivas para Administrador
          {
            element: <RoleProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                path: 'painel-admin',
                element: withSuspense(SystemAdminPage),
              },
              {
                path: 'admin-turmas',
                element: withSuspense(ActiveClassesPage),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
