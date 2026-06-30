import * as React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/auth/pages/DashboardPage';

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
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
