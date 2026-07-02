import { usePlatformAdmin } from '../hooks/usePlatformAdmin';
import { GlobalMetricsCards } from '../components/GlobalMetrics';

export function PlatformMetricsPage() {
  const hook = usePlatformAdmin();

  return (
    <div className="flex flex-col">
      <header className="border-b border-[--color-border] bg-[--color-surface] px-6 py-4">
        <h1 className="text-lg font-semibold text-[--color-text-primary]">Métricas globales</h1>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          Resumen agregado de la plataforma.
        </p>
      </header>
      <div className="flex-1 p-6">
        <GlobalMetricsCards metrics={hook.metrics} isLoading={hook.isLoadingMetrics} />
      </div>
    </div>
  );
}
