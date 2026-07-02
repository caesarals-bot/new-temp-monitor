import { usePlatformAdmin } from '../hooks/usePlatformAdmin';
import { PlatformDashboard, PlatformEmptyState } from '../components/PlatformDashboard';

export function PlatformAdminPage() {
  const hook = usePlatformAdmin();

  return (
    <div className="flex flex-col">
      <header className="border-b border-[--color-border] bg-[--color-surface] px-6 py-4">
        <h1 className="text-lg font-semibold text-[--color-text-primary]">Organizaciones</h1>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          Vista cross-tenant. Solo metadatos: no se muestran datos de temperatura.
        </p>
      </header>
      <div className="flex-1 p-6">
        {hook.isPlatformAdmin ? <PlatformDashboard hook={hook} /> : <PlatformEmptyState />}
      </div>
    </div>
  );
}
