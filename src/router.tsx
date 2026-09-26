import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/features/auth/AuthPage'
import { OnboardingPage } from '@/features/auth/OnboardingPage'
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
    path: '/onboarding',
    element: <OnboardingPage />,
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
