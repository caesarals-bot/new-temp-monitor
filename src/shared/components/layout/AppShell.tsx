import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { TopBar } from '@/shared/components/layout/TopBar';

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const drawerCloseRef = useRef<HTMLButtonElement | null>(null);
  const previousPathRef = useRef(location.pathname);

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      setIsDrawerOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isDrawerOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const original = document.body.style.overflow;
    document.body.style.overflow = isDrawerOpen ? 'hidden' : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (isDrawerOpen) {
      const id = window.setTimeout(() => {
        drawerCloseRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isDrawerOpen]);

  return (
    <div className="flex min-h-screen bg-[--color-surface]">
      <Sidebar mode="fixed" label="Navegación principal" />
      <Sidebar
        mode="drawer"
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        label="Menú móvil"
        closeButtonRef={drawerCloseRef}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar onMenuClick={openDrawer} />
        <main className="flex-1">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
