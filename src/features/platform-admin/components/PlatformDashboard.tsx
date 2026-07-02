import { Link } from 'react-router';
import { Building2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { OrganizationFiltersBar } from './OrganizationFilters';
import { OrganizationList } from './OrganizationList';
import { OrganizationStatusDialog } from './OrganizationStatusDialog';
import { GlobalMetricsCards } from './GlobalMetrics';
import type { UsePlatformAdminReturn } from '../hooks/usePlatformAdmin';

export interface PlatformDashboardProps {
  hook: UsePlatformAdminReturn;
}

export function PlatformDashboard({ hook }: PlatformDashboardProps) {
  const {
    organizations,
    metrics,
    isLoadingList,
    isLoadingMetrics,
    listError,
    filters,
    setFilter,
    clearFilters,
    changingStatusFor,
    openStatusDialog,
    closeStatusDialog,
    submitStatusChange,
    isChangingStatus,
    statusError,
  } = hook;

  return (
    <div className="flex flex-col gap-6">
      <GlobalMetricsCards metrics={metrics} isLoading={isLoadingMetrics} />

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <OrganizationFiltersBar filters={filters} onChange={setFilter} onClear={clearFilters} />
        </CardContent>
      </Card>

      <OrganizationList
        organizations={organizations}
        isLoading={isLoadingList}
        listError={listError}
        onChangeStatus={openStatusDialog}
      />

      <OrganizationStatusDialog
        open={changingStatusFor !== null}
        org={changingStatusFor}
        isChanging={isChangingStatus}
        statusError={statusError}
        onOpenChange={(open) => {
          if (!open) closeStatusDialog();
        }}
        onSubmit={submitStatusChange}
      />

      <p className="text-xs text-[--color-text-muted]">
        El platform admin NO tiene acceso a datos de temperatura ni al contenido de las lecturas.
        Solo metadata agregada.
      </p>
    </div>
  );
}

export function PlatformEmptyState() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <Building2 className="h-10 w-10 text-[--color-eucalyptus]" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-[--color-text-primary]">Panel de platform admin</h2>
      <p className="max-w-md text-sm text-[--color-text-secondary]">
        Acceso exclusivo para usuarios con <code>is_platform_admin</code>. Use la barra lateral para
        navegar entre organizaciones y métricas globales.
      </p>
      <Link
        to="/admin/organizations"
        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[--color-eucalyptus] hover:underline"
      >
        Ver organizaciones <ChevronRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
