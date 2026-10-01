import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/features/auth/AuthPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MuralPage } from '@/features/mural/MuralPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { EventModal } from '@/features/calendar/components/EventModal'
import { NoticeModal } from '@/features/mural/components/NoticeModal'
import { ClassAdminPage } from '@/features/class-admin/ClassAdminPage'
import { SystemAdminPage } from '@/features/system-admin/SystemAdminPage'
import { ActiveClassesPage } from '@/features/system-admin/ActiveClassesPage'
import { AppLayout } from '@/components/layout/AppLayout'

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
      {
        path: 'painel-turma',
        element: <ClassAdminPage />
      },
      {
        path: 'painel-admin',
        element: <SystemAdminPage />
      },
      {
        path: 'admin-turmas',
        element: <ActiveClassesPage />
      },
    ]
  }
], {
  basename: '/sistema-escolar/'
})
