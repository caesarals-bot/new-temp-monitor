import * as React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap';
import { useOrganizationBootstrap } from '@/features/organizations/hooks/useOrganizationBootstrap';
import { useIncidentsBootstrap } from '@/features/incidents/hooks/useIncidentsBootstrap';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import {
  LazyLoginPage,
  LazyRegisterPage,
  LazyOnboardingPage,
  LazyDashboardPage,
  LazyLocationsPage,
  LazyStaffsPage,
  LazyEquipmentsPage,
  LazyReadingsPage,
  LazyReadingsHistoryPage,
  LazyIncidentsPage,
  LazyReportsPage,
  RouteFallback,
} from '@/app/LazyPages';
import { AppShell } from '@/shared/components/layout/AppShell';
import { RoutePlaceholder } from '@/shared/components/layout/RoutePlaceholder';

function Providers({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  useOrganizationBootstrap();
  useIncidentsBootstrap();
  return <>{children}</>;
}

function lazyElement(Lazy: React.LazyExoticComponent<React.ComponentType<unknown>>) {
  return (
    <React.Suspense fallback={<RouteFallback />}>
      <Lazy />
    </React.Suspense>
  );
}

function Router() {
  return (
    <Providers>
      <RouterProvider
        router={createBrowserRouter([
          {
            path: '/login',
            element: lazyElement(LazyLoginPage),
          },
          {
            path: '/register',
            element: lazyElement(LazyRegisterPage),
          },
          {
            path: '/onboarding',
            element: (
              <ProtectedRoute requireOnboarding={false}>
                {lazyElement(LazyOnboardingPage)}
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
                element: lazyElement(LazyDashboardPage),
              },
              {
                path: 'locations',
                element: lazyElement(LazyLocationsPage),
              },
              {
                path: 'staff',
                element: lazyElement(LazyStaffsPage),
              },
              {
                path: 'equipment',
                element: lazyElement(LazyEquipmentsPage),
              },
              {
                path: 'readings',
                element: lazyElement(LazyReadingsPage),
              },
              {
                path: 'readings/history',
                element: lazyElement(LazyReadingsHistoryPage),
              },
              {
                path: 'incidents',
                element: lazyElement(LazyIncidentsPage),
              },
              {
                path: 'reports',
                element: lazyElement(LazyReportsPage),
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
