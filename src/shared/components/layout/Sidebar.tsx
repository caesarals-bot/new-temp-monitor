import { Thermometer } from 'lucide-react';
import { NavItems } from '@/shared/components/layout/NavItems';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const organization = useOrganizationStore((s) => s.organization);

  return (
    <aside
      className={cn(
        'flex h-screen w-60 shrink-0 flex-col border-r border-[--color-slate-700] bg-[--color-slate-900] text-white',
        className
      )}
      aria-label="Navegación de la aplicación"
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[--color-eucalyptus]">
          <Thermometer className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold tracking-tight">TempMonitor</span>
      </div>

      <div className="px-5 pb-4">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-[--color-slate-300]">
          Organización
        </p>
        <p className="mt-1 truncate text-sm font-medium text-white">
          {organization?.name ?? 'Sin organización'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <NavItems variant="dark" />
      </div>

      <div className="border-t border-[--color-slate-700] px-5 py-4">
        <p className="text-xs text-[--color-slate-300]">
          {organization?.plan_type === 'enterprise'
            ? 'Plan Enterprise'
            : organization?.plan_type === 'pro'
              ? 'Plan Pro'
              : 'Plan Basic'}
        </p>
      </div>
    </aside>
  );
}
