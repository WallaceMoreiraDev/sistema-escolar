import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/features/auth/AuthPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MuralPage } from '@/features/mural/MuralPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { EventModal } from '@/features/calendar/components/EventModal'
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
    element: <AppLayout />, // O AppLayout agora renderiza o menu lateral e o <Outlet />
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'mural',
        element: <MuralPage />,
      },
      {
        path: 'calendario',
        element: <CalendarPage />,
        children: [
          {
            path: 'evento/:id',
            element: <EventModal />
          }
        ]
      },
    ]
  }
])
