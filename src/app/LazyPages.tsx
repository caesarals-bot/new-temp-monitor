import * as React from 'react';
import { lazy, Suspense } from 'react';

export const LazyLoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);

export const LazyRegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);

export const LazyOnboardingPage = lazy(() =>
  import('@/features/auth/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage }))
);

export const LazyDashboardPage = lazy(() =>
  import('@/features/auth/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

export const LazyLocationsPage = lazy(() =>
  import('@/features/locations/pages/LocationsPage').then((m) => ({ default: m.LocationsPage }))
);

export const LazyStaffsPage = lazy(() =>
  import('@/features/staff/pages/StaffsPage').then((m) => ({ default: m.StaffsPage }))
);

export const LazyEquipmentsPage = lazy(() =>
  import('@/features/equipment/pages/EquipmentsPage').then((m) => ({ default: m.EquipmentsPage }))
);

export const LazyReadingsPage = lazy(() =>
  import('@/features/readings/pages/ReadingsPage').then((m) => ({ default: m.ReadingsPage }))
);

export function RouteFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[--color-eucalyptus] border-t-transparent" />
    </div>
  );
}

export function withSuspense<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>
) {
  return function SuspendedPage(props: P) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
