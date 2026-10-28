import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/features/auth/AuthPage'
import { PrivacyPolicyPage } from '@/features/privacy/PrivacyPolicyPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MuralPage } from '@/features/mural/MuralPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { EventModal } from '@/features/calendar/components/EventModal'
import { NoticeModal } from '@/features/mural/components/NoticeModal'
import { ClassAdminPage } from '@/features/class-admin/ClassAdminPage'
import { SystemAdminPage } from '@/features/system-admin/SystemAdminPage'
import { ActiveClassesPage } from '@/features/system-admin/ActiveClassesPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RoleProtectedRoute } from '@/components/layout/RoleProtectedRoute'

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
    element: <PrivacyPolicyPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/onboarding',
        element: <OnboardingPage />,
      },
      {
        path: '/app',
        element: <AppLayout />, 
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'mural',
            element: <MuralPage />,
            children: [
              {
                path: 'aviso/:id',
                element: <NoticeModal />
              }
            ]
          },
          {
            path: 'minha-turma',
            element: <CalendarPage />,
            children: [
              {
                path: 'evento/:id',
                element: <EventModal />
              }
            ]
          },
          // Rotas de Gestão de Turma: Exclusivas para Líder ou Admin com Turma vinculada
          {
            element: <RoleProtectedRoute allowedRoles={['LIDER', 'ADMIN']} requireTurma />,
            children: [
              {
                path: 'painel-turma',
                element: <ClassAdminPage />
              },
            ]
          },
          // Rotas de Administração Geral do Sistema: Exclusivas para Administrador
          {
            element: <RoleProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                path: 'painel-admin',
                element: <SystemAdminPage />
              },
              {
                path: 'admin-turmas',
                element: <ActiveClassesPage />
              },
            ]
          },
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

