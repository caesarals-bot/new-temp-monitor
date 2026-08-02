import { useEffect, useMemo, useState } from 'react';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import {
  useIncidentStore,
  selectOpenIncidentCount,
} from '@/features/incidents/store/incident.store';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import {
  countReadingsTodayByLocation,
  getReadingsLast7Days,
} from '@/features/readings/services/readings.service';
import {
  computeAveragesByEquipment,
  computeCompliancePercent,
  computeMinMaxToday,
  computeTrend,
  type EquipmentAverage,
  type TrendPoint,
} from '@/features/readings/lib/dashboardMetrics';
import { listIncidents } from '@/features/incidents/services/incidents.service';
import type { TemperatureReading, Equipment } from '@/shared/types/supabase';

export interface UseDashboardDataReturn {
  activeLocationId: string | null;
  equipmentCount: number | null;
  openIncidentCount: number;
  readingsTodayCount: number | null;
  /** Tendencia de lecturas por día (7 buckets). */
  trend: TrendPoint[] | null;
  /** % de lecturas en rango en los últimos 7 días (null si no hay lecturas). */
  compliancePercent: number | null;
  /** Promedio de temperatura por equipo (7 días), ordenado. */
  averagesByEquipment: EquipmentAverage[] | null;
  /** Mapa equipmentId → nombre (para mostrar en las cards). */
  equipmentNames: Map<string, string> | null;
  /** Mín/Máx del día (null si no hay lecturas hoy). */
  minMaxToday: { min: number; max: number } | null;
  /** Incidentes abiertos/resueltos en los últimos 7 días. */
  incidentCounts7d: { open: number; resolved: number } | null;
  isLoading: boolean;
  error: string | null;
}

function mapError(message: string | null | undefined): string | null {
  if (!message) return null;
  return message;
}

/**
 * Datos del dashboard del usuario (KPIs reales).
 *
 * - Equipos: `listEquipmentByLocation(activeLocationId).length`.
 * - Incidentes activos: selector del `useIncidentStore` (ya alimentado por el
 *   bootstrap + Realtime).
 * - Lecturas hoy: `countReadingsTodayByLocation(activeLocationId)`.
 * - Métricas 7 días: `getReadingsLast7Days` + `listIncidents` y computadas
 *   con `dashboardMetrics.ts` (tendencia, cumplimiento, promedios, min/max).
 *
 * Carga en paralelo solo cuando hay sede activa. Sin sede, los conteos quedan
 * en `null` (la UI muestra "—").
 */
export function useDashboardData(): UseDashboardDataReturn {
  const activeLocationId = useOrganizationStore((s) => s.activeLocationId);
  const organizationId = useOrganizationStore((s) => s.organization?.id ?? null);
  const openIncidentCount = useIncidentStore(selectOpenIncidentCount);

  const [equipmentCount, setEquipmentCount] = useState<number | null>(null);
  const [readingsTodayCount, setReadingsTodayCount] = useState<number | null>(null);
  const [last7dReadings, setLast7dReadings] = useState<TemperatureReading[] | null>(null);
  const [last7dIncidents, setLast7dIncidents] = useState<{
    open: number;
    resolved: number;
  } | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLocationId) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch trigger, not a side-effect
    setIsLoading(true);
    setError(null);

    void Promise.all([
      listEquipmentByLocation(activeLocationId),
      countReadingsTodayByLocation(activeLocationId),
      getReadingsLast7Days(activeLocationId),
    ]).then(([equipmentRes, readingsRes, last7dRes]) => {
      if (cancelled) return;
      setIsLoading(false);

      if (equipmentRes.error) {
        setError(mapError(equipmentRes.error.message));
        setEquipmentCount(null);
        return;
      }
      if (readingsRes.error) {
        setError(mapError(readingsRes.error.message));
        setReadingsTodayCount(null);
        return;
      }
      if (last7dRes.error) {
        setError(mapError(last7dRes.error.message));
        setLast7dReadings(null);
        return;
      }

      setEquipmentCount(equipmentRes.data?.length ?? 0);
      setReadingsTodayCount(readingsRes.count ?? 0);
      setLast7dReadings(last7dRes.data ?? []);
      setEquipmentList(equipmentRes.data ?? []);
    });

    return () => {
      cancelled = true;
    };
  }, [activeLocationId]);

  // Incidentes de los últimos 7 días: lista completa y filtrado cliente.
  useEffect(() => {
    if (!activeLocationId || !organizationId) return;
    let cancelled = false;
    void listIncidents({ organizationId, filters: { locationId: activeLocationId } }).then(
      ({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setLast7dIncidents(null);
          return;
        }
        const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = (data ?? []).filter(
          (i) => i.created_at && new Date(i.created_at).getTime() >= since
        );
        const open = recent.filter((i) => i.status === 'open').length;
        const resolved = recent.filter((i) => i.status === 'resolved').length;
        setLast7dIncidents({ open, resolved });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [activeLocationId, organizationId]);

  const rangesByEquipment = useMemo(() => {
    const map = new Map<string, { min: number; max: number }>();
    for (const e of equipmentList) {
      map.set(e.id, { min: Number(e.min_temp), max: Number(e.max_temp) });
    }
    return map;
  }, [equipmentList]);

  const trend = useMemo(
    () => (activeLocationId && last7dReadings ? computeTrend(last7dReadings) : null),
    [activeLocationId, last7dReadings]
  );
  const compliancePercent = useMemo(
    () =>
      activeLocationId && last7dReadings && last7dReadings.length > 0
        ? computeCompliancePercent(last7dReadings, rangesByEquipment)
        : null,
    [activeLocationId, last7dReadings, rangesByEquipment]
  );
  const averagesByEquipment = useMemo(
    () =>
      activeLocationId && last7dReadings
        ? computeAveragesByEquipment(last7dReadings, rangesByEquipment)
        : null,
    [activeLocationId, last7dReadings, rangesByEquipment]
  );
  const equipmentNames = useMemo(() => {
    if (!activeLocationId) return null;
    const map = new Map<string, string>();
    for (const e of equipmentList) map.set(e.id, e.name);
    return map;
  }, [activeLocationId, equipmentList]);
  const minMaxToday = useMemo(
    () => (activeLocationId && last7dReadings ? computeMinMaxToday(last7dReadings) : null),
    [activeLocationId, last7dReadings]
  );

  return {
    activeLocationId,
    equipmentCount,
    openIncidentCount,
    readingsTodayCount,
    trend,
    compliancePercent,
    averagesByEquipment,
    equipmentNames,
    minMaxToday,
    incidentCounts7d: activeLocationId ? last7dIncidents : null,
    isLoading,
    error,
  };
}
