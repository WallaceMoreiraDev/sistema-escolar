import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/features/auth/AuthPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MuralPage } from '@/features/mural/MuralPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'

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
    path: '/app/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/app/mural',
    element: <MuralPage />,
  },
  {
    path: '/app/calendario',
    element: <CalendarPage />,
  },
])
