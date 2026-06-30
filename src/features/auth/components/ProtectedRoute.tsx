import * as React from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[--color-eucalyptus] border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && !profile?.organization_id && !profile?.is_platform_admin) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
