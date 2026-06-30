import * as React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap';
import { useOrganizationBootstrap } from '@/features/organizations/hooks/useOrganizationBootstrap';
import { useIncidentsBootstrap } from '@/features/incidents/hooks/useIncidentsBootstrap';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/auth/pages/DashboardPage';
import { OnboardingPage } from '@/features/auth/pages/OnboardingPage';
import { AppShell } from '@/shared/components/layout/AppShell';
import { RoutePlaceholder } from '@/shared/components/layout/RoutePlaceholder';

function Providers({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  useOrganizationBootstrap();
  useIncidentsBootstrap();
  return <>{children}</>;
}

function Router() {
  return (
    <Providers>
      <RouterProvider
        router={createBrowserRouter([
          {
            path: '/login',
            element: <LoginPage />,
          },
          {
            path: '/register',
            element: <RegisterPage />,
          },
          {
            path: '/onboarding',
            element: (
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '/',
            element: (
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
              {
                path: 'locations',
                element: <RoutePlaceholder title="Sedes" taskId="TASK-006" />,
              },
              {
                path: 'equipment',
                element: <RoutePlaceholder title="Equipos" taskId="TASK-007" />,
              },
              {
                path: 'readings',
                element: <RoutePlaceholder title="Lecturas" taskId="TASK-008" />,
              },
              {
                path: 'incidents',
                element: <RoutePlaceholder title="Incidentes" taskId="TASK-010" />,
              },
              {
                path: 'reports',
                element: <RoutePlaceholder title="Reportes" taskId="TASK-011" />,
              },
              {
                path: 'settings',
                element: <RoutePlaceholder title="Configuración" taskId="TASK-012+" />,
              },
              {
                path: 'admin/organizations',
                element: <RoutePlaceholder title="Organizaciones" taskId="TASK-012" />,
              },
              {
                path: 'admin/metrics',
                element: <RoutePlaceholder title="Métricas globales" taskId="TASK-012" />,
              },
            ],
          },
        ])}
      />
    </Providers>
  );
}

export { Router };
