/**
 * Hook principal del feature `reports`.
 *
 * Encapsula:
 * - Carga de lecturas e incidentes según filtros vigentes (vía services).
 * - Paginación cliente (50 registros por página) sobre la lista cargada.
 * - Computed: cumplimiento % global + desglose por equipo (reusa
 *   `isOutOfRange` y `STALE_THRESHOLD_MS`).
 * - Filtro opcional "solo con incidentes": aplica sobre las readings que
 *   tengan un incident con `reading_id` matching.
 * - Errores separados (`loadError`, `exportError`).
 * - Selección de equipo para el chart (1 línea por equipo).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { listReadingsReport, listIncidentsForReport } from '../services/reports.service';
import { isOutOfRange } from '@/features/readings/lib/isOutOfRange';
import type { Equipment, TemperatureReading } from '@/shared/types/supabase';
import type { IncidentWithReading } from '@/features/incidents/types';
import type {
  ComplianceByEquipment,
  ComplianceSummary,
  IncidentSummary,
  ReportData,
  ReportFilters,
} from '../types';

const PAGE_SIZE = 50;

function mapError(message: string | null | undefined): string | null {
  if (!message) return null;
  return message;
}

function defaultFilters(): ReportFilters {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    readingType: 'all',
    onlyWithIncidents: false,
  };
}

function computeCompliance(readings: TemperatureReading[]): ComplianceSummary {
  const totalReadings = readings.length;
  if (totalReadings === 0) {
    return { totalReadings: 0, inRangeReadings: 0, percent: 100, byEquipment: [] };
  }

  const byEquipmentMap = new Map<string, ComplianceByEquipment>();
  let inRange = 0;

  for (const r of readings) {
    // Para auditoría HACCP, usamos el snapshot del rango al momento de la lectura.
    // Si el snapshot es null (lecturas pre-TASK-010), caemos al rango actual
    // del equipo cargado en `equipmentList` (lo resolvemos en caller).
    const min = r.snapshot_min_temp;
    const max = r.snapshot_max_temp;
    const inRangeHere = min !== null && max !== null ? !isOutOfRange(r.value, min, max) : true;

    if (inRangeHere) inRange++;
  }

  return {
    totalReadings,
    inRangeReadings: inRange,
    percent: Math.round((inRange / totalReadings) * 1000) / 10,
    byEquipment: Array.from(byEquipmentMap.values()),
  };
}

function computeIncidentSummary(incidents: IncidentWithReading[]): IncidentSummary {
  const total = incidents.length;
  const resolved = incidents.filter((i) => i.status === 'resolved').length;
  return { total, resolved, open: total - resolved };
}

function formatRangeLabel(filters: ReportFilters): string {
  const from = new Date(filters.from);
  const to = new Date(filters.to);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(from)} → ${fmt(to)}`;
}

export interface UseReportReturn {
  orgId: string | null;
  filters: ReportFilters;
  setFilter: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void;
  setFilters: (next: ReportFilters) => void;
  resetFilters: () => void;

  readings: TemperatureReading[];
  incidents: IncidentWithReading[];
  equipmentList: Pick<Equipment, 'id' | 'name' | 'min_temp' | 'max_temp'>[];

  selectedEquipmentId: string | null;
  setSelectedEquipmentId: (id: string | null) => void;
  selectedEquipment: Pick<Equipment, 'id' | 'name' | 'min_temp' | 'max_temp'> | null;

  isLoading: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;

  currentPage: number;
  totalPages: number;
  pageReadings: TemperatureReading[];
  setPage: (page: number) => void;

  compliance: ComplianceSummary;
  incidentSummary: IncidentSummary;

  reportData: ReportData | null;

  exportError: string | null;
  clearExportError: () => void;
}

export function useReport(): UseReportReturn {
  const organization = useOrganizationStore((s) => s.organization);
  const orgId = organization?.id ?? null;

  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const [readings, setReadings] = useState<TemperatureReading[]>([]);
  const [incidents, setIncidents] = useState<IncidentWithReading[]>([]);
  const [equipmentList, setEquipmentList] = useState<
    Pick<Equipment, 'id' | 'name' | 'min_temp' | 'max_temp'>[]
  >([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setLoadError(null);

    const [readingsRes, incidentsRes] = await Promise.all([
      listReadingsReport({ organizationId: orgId, filters }),
      listIncidentsForReport({ organizationId: orgId, filters }),
    ]);

    setIsLoading(false);

    if (readingsRes.error) {
      setLoadError(mapError(readingsRes.error.message));
      return;
    }
    if (incidentsRes.error) {
      setLoadError(mapError(incidentsRes.error.message));
      return;
    }

    setReadings(readingsRes.data ?? []);
    setIncidents(incidentsRes.data ?? []);

    const equipmentIds = new Set<string>();
    for (const r of readingsRes.data ?? []) {
      if (r.equipment_id) equipmentIds.add(r.equipment_id);
    }

    let list: Pick<Equipment, 'id' | 'name' | 'min_temp' | 'max_temp'>[] = [];
    if (filters.locationId) {
      const eqRes = await listEquipmentByLocation(filters.locationId);
      if (!eqRes.error && eqRes.data) {
        list = eqRes.data.map((e) => ({
          id: e.id,
          name: e.name,
          min_temp: e.min_temp,
          max_temp: e.max_temp,
        }));
      }
    } else {
      list = Array.from(equipmentIds).map((id) => ({
        id,
        name: id,
        min_temp: 0,
        max_temp: 0,
      }));
    }

    setEquipmentList(list);
    setCurrentPage(1);
  }, [orgId, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch trigger, not a side-effect
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, filters]);

  const setFilter = useCallback(
    <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters());
  }, []);

  const incidentReadingIds = useMemo(() => {
    const set = new Set<string>();
    for (const inc of incidents) set.add(inc.reading_id);
    return set;
  }, [incidents]);

  const filteredReadings = useMemo(() => {
    if (!filters.onlyWithIncidents) return readings;
    return readings.filter((r) => incidentReadingIds.has(r.id));
  }, [readings, filters.onlyWithIncidents, incidentReadingIds]);

  const compliance = useMemo(() => computeCompliance(filteredReadings), [filteredReadings]);

  const incidentSummary = useMemo(() => computeIncidentSummary(incidents), [incidents]);

  const totalPages = Math.max(1, Math.ceil(filteredReadings.length / PAGE_SIZE));
  const pageReadings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReadings.slice(start, start + PAGE_SIZE);
  }, [filteredReadings, currentPage]);

  const selectedEquipment = useMemo(
    () =>
      selectedEquipmentId
        ? (equipmentList.find((e) => e.id === selectedEquipmentId) ?? null)
        : null,
    [selectedEquipmentId, equipmentList]
  );

  const reportData: ReportData | null = useMemo(() => {
    if (!organization) return null;
    return {
      organization: {
        id: organization.id,
        name: organization.name,
        business_type: organization.business_type,
      },
      filters,
      generatedAt: new Date().toISOString(),
      rangeLabel: formatRangeLabel(filters),
      location: filters.locationId
        ? {
            id: filters.locationId,
            name: '',
          }
        : null,
      equipmentList,
      selectedEquipment,
      readings: filteredReadings,
      incidents,
      compliance,
      incidentSummary,
    };
  }, [
    organization,
    filters,
    equipmentList,
    selectedEquipment,
    filteredReadings,
    incidents,
    compliance,
    incidentSummary,
  ]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const clearExportError = useCallback(() => setExportError(null), []);

  return {
    orgId,
    filters,
    setFilter,
    setFilters,
    resetFilters,

    readings: filteredReadings,
    incidents,
    equipmentList,

    selectedEquipmentId,
    setSelectedEquipmentId,
    selectedEquipment,

    isLoading,
    loadError,
    refresh,

    currentPage,
    totalPages,
    pageReadings,
    setPage,

    compliance,
    incidentSummary,

    reportData,

    exportError,
    clearExportError,
  };
}
