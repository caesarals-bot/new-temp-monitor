import * as React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap';
import { useOrganizationBootstrap } from '@/features/organizations/hooks/useOrganizationBootstrap';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/auth/pages/DashboardPage';
import { OnboardingPage } from '@/features/auth/pages/OnboardingPage';

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  useOrganizationBootstrap();
  return <>{children}</>;
}

function Router() {
  return (
    <AuthProvider>
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
                <DashboardPage />
              </ProtectedRoute>
            ),
          },
        ])}
      />
    </AuthProvider>
  );
}

export { Router };
