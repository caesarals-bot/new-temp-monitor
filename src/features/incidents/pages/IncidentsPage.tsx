import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { useIncidents } from '../hooks/useIncidents';
import { IncidentList } from '../components/IncidentList';
import { IncidentFiltersBar } from '../components/IncidentFilters';
import { IncidentResolutionModal } from '../components/IncidentResolutionModal';

export function IncidentsPage() {
  const organization = useOrganizationStore((s) => s.organization);
  const {
    canResolve,
    incidents,
    isLoading,
    listError,
    filters,
    setFilter,
    clearFilters,
    resolving,
    openResolve,
    closeResolve,
    submitResolve,
    isResolving,
    resolveError,
  } = useIncidents();

  if (!organization) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-8 text-sm text-[--color-text-secondary]">
        Cargando organización...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="border-b border-[--color-border] bg-[--color-surface] px-6 py-4">
        <h1 className="text-lg font-semibold text-[--color-text-primary]">Incidentes</h1>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          Monitorea y resuelve las desviaciones de temperatura de tu organización.
        </p>
      </header>

      <div className="flex flex-col gap-4 p-6">
        <IncidentFiltersBar
          filters={filters}
          onChange={setFilter}
          onClear={clearFilters}
        />

        <IncidentList
          incidents={incidents}
          isLoading={isLoading}
          listError={listError}
          canResolve={canResolve}
          onResolve={openResolve}
        />
      </div>

      <IncidentResolutionModal
        open={resolving !== null}
        incident={resolving}
        isResolving={isResolving}
        resolveError={resolveError}
        onOpenChange={(open) => {
          if (!open) closeResolve();
        }}
        onSubmit={submitResolve}
      />
    </div>
  );
}