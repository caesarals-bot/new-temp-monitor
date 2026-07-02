import { useRef } from 'react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import type { UseReportReturn } from '../hooks/useReport';
import { ReportFiltersBar } from './ReportFilters';
import { ReadingsTable } from './ReadingsTable';
import { TemperatureChart } from './TemperatureChart';
import { ComplianceSummaryCard, IncidentSummaryCard } from './ComplianceSummary';
import { PdfExportButton } from './PdfExportButton';

export interface ReportsDashboardProps {
  hook: UseReportReturn;
}

export function ReportsDashboard({ hook }: ReportsDashboardProps) {
  const {
    filters,
    setFilter,
    resetFilters,
    equipmentList,
    readings,
    incidents,
    selectedEquipmentId,
    setSelectedEquipmentId,
    isLoading,
    loadError,
    currentPage,
    totalPages,
    pageReadings,
    setPage,
    compliance,
    incidentSummary,
    reportData,
    exportError,
    clearExportError,
  } = hook;

  const chartRef = useRef<HTMLDivElement>(null);

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    );
  }

  const selectedEquipment =
    selectedEquipmentId !== null
      ? (equipmentList.find((e) => e.id === selectedEquipmentId) ?? null)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <ReportFiltersBar
        filters={filters}
        equipmentList={equipmentList}
        onChange={setFilter}
        onReset={resetFilters}
      />

      {exportError && (
        <Alert variant="destructive" onClick={clearExportError}>
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <TemperatureChart ref={chartRef} readings={readings} equipment={selectedEquipment} />
        </div>
        <div className="flex flex-col gap-4">
          <ComplianceSummaryCard summary={compliance} />
          <IncidentSummaryCard
            total={incidentSummary.total}
            resolved={incidentSummary.resolved}
            open={incidentSummary.open}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[--color-text-primary]">
          Lecturas del período ({readings.length})
        </h2>
        {reportData && (
          <PdfExportButton reportData={reportData} chartRef={chartRef} onError={clearExportError} />
        )}
      </div>

      {equipmentList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase text-[--color-text-muted]">
            Equipo en gráfico:
          </span>
          <button
            type="button"
            onClick={() => setSelectedEquipmentId(null)}
            className={`rounded-full px-3 py-1 text-xs ${
              selectedEquipmentId === null
                ? 'bg-[--color-eucalyptus-bg] text-[--color-eucalyptus]'
                : 'bg-[--color-surface] text-[--color-text-secondary]'
            }`}
          >
            Ninguno
          </button>
          {equipmentList.map((eq) => (
            <button
              key={eq.id}
              type="button"
              onClick={() => setSelectedEquipmentId(eq.id)}
              className={`rounded-full px-3 py-1 text-xs ${
                selectedEquipmentId === eq.id
                  ? 'bg-[--color-eucalyptus-bg] text-[--color-eucalyptus]'
                  : 'bg-[--color-surface] text-[--color-text-secondary]'
              }`}
            >
              {eq.name}
            </button>
          ))}
        </div>
      )}

      {isLoading && readings.length === 0 ? (
        <div className="rounded-md border border-[--color-border] bg-white p-8 text-center text-sm text-[--color-text-muted]">
          Cargando lecturas...
        </div>
      ) : (
        <ReadingsTable
          readings={pageReadings}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setPage}
        />
      )}

      {incidents.length > 0 && (
        <details className="rounded-md border border-[--color-border] bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[--color-text-primary]">
            Incidentes del período ({incidents.length})
          </summary>
          <ul className="divide-y divide-[--color-border] border-t border-[--color-border] text-sm">
            {incidents.slice(0, 30).map((inc) => (
              <li key={inc.id} className="px-4 py-3">
                <p className="font-medium text-[--color-text-primary]">{inc.description}</p>
                <p className="mt-1 text-xs text-[--color-text-muted]">
                  {new Date(inc.created_at).toLocaleString('es-CL')} —{' '}
                  {inc.status === 'resolved' ? 'Resuelto' : 'Abierto'}
                </p>
                {inc.action_taken && (
                  <p className="mt-1 text-xs text-[--color-text-secondary]">
                    Acción: {inc.action_taken}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
