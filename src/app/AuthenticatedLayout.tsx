import * as React from 'react';
import { Outlet } from 'react-router';

interface AuthenticatedLayoutProps {
  children?: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return <>{children ?? <Outlet />}</>;
}
