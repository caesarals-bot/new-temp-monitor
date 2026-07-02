import { Thermometer, Shield, X } from 'lucide-react';
import type { RefObject } from 'react';
import { NavItems } from '@/shared/components/layout/NavItems';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

type Mode = 'fixed' | 'drawer';

interface SidebarProps {
  mode?: Mode;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  label?: string;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
}

export function Sidebar({ mode = 'fixed', isOpen = false, onClose, className, label, closeButtonRef }: SidebarProps) {
  const organization = useOrganizationStore((s) => s.organization);
  const isPlatformAdmin = useAuthStore((s) => s.profile?.is_platform_admin ?? false);

  if (mode === 'drawer') {
    return (
      <>
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden',
            isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[--color-slate-700] bg-[--color-slate-900] text-white transition-transform duration-200 md:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full',
            className
          )}
          aria-label={label ?? 'Menú de navegación'}
          aria-hidden={!isOpen}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[--color-eucalyptus]">
                <Thermometer className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-lg font-semibold tracking-tight">TempMonitor</span>
            </div>
            {onClose && isOpen && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="text-white hover:bg-[--color-slate-700]"
                ref={closeButtonRef}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {!isPlatformAdmin && (
            <div className="px-5 pb-4">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-[--color-slate-300]">
                Organización
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {organization?.name ?? 'Sin organización'}
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-2">
            <NavItems variant="dark" />
          </div>

          <div className="border-t border-[--color-slate-700] px-5 py-4">
            {isPlatformAdmin ? (
              <div className="flex items-center gap-2 text-xs text-[--color-slate-300]">
                <Shield className="h-3 w-3" aria-hidden="true" />
                <span>Modo Platform Admin</span>
              </div>
            ) : (
              <p className="text-xs text-[--color-slate-300]">
                {organization?.plan_type === 'enterprise'
                  ? 'Plan Enterprise'
                  : organization?.plan_type === 'pro'
                    ? 'Plan Pro'
                    : 'Plan Basic'}
              </p>
            )}
          </div>
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        'hidden md:flex h-screen w-60 shrink-0 flex-col border-r border-[--color-slate-700] bg-[--color-slate-900] text-white',
        className
      )}
      aria-label={label ?? 'Navegación de la aplicación'}
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[--color-eucalyptus]">
          <Thermometer className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold tracking-tight">TempMonitor</span>
      </div>

      {!isPlatformAdmin && (
        <div className="px-5 pb-4">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-[--color-slate-300]">
            Organización
          </p>
          <p className="mt-1 truncate text-sm font-medium text-white">
            {organization?.name ?? 'Sin organización'}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <NavItems variant="dark" />
      </div>

      <div className="border-t border-[--color-slate-700] px-5 py-4">
        {isPlatformAdmin ? (
          <div className="flex items-center gap-2 text-xs text-[--color-slate-300]">
            <Shield className="h-3 w-3" aria-hidden="true" />
            <span>Modo Platform Admin</span>
          </div>
        ) : (
          <p className="text-xs text-[--color-slate-300]">
            {organization?.plan_type === 'enterprise'
              ? 'Plan Enterprise'
              : organization?.plan_type === 'pro'
                ? 'Plan Pro'
                : 'Plan Basic'}
          </p>
        )}
      </div>
    </aside>
  );
}
