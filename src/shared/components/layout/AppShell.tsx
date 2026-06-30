import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { TopBar } from '@/shared/components/layout/TopBar';

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[--color-surface]">
      <Sidebar mode="fixed" label="Navegación principal" />
      <Sidebar mode="drawer" isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} label="Menú móvil" />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar onMenuClick={() => setIsDrawerOpen(true)} />
        <main className="flex-1">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
