import { useEffect, useState } from 'react';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import {
  useIncidentStore,
  selectOpenIncidentCount,
} from '@/features/incidents/store/incident.store';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { countReadingsTodayByLocation } from '@/features/readings/services/readings.service';

export interface UseDashboardDataReturn {
  activeLocationId: string | null;
  equipmentCount: number | null;
  openIncidentCount: number;
  readingsTodayCount: number | null;
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
 *
 * Carga en paralelo solo cuando hay sede activa. Sin sede, los conteos quedan
 * en `null` (la UI muestra "—").
 */
export function useDashboardData(): UseDashboardDataReturn {
  const activeLocationId = useOrganizationStore((s) => s.activeLocationId);
  const openIncidentCount = useIncidentStore(selectOpenIncidentCount);

  const [equipmentCount, setEquipmentCount] = useState<number | null>(null);
  const [readingsTodayCount, setReadingsTodayCount] = useState<number | null>(null);
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
    ]).then(([equipmentRes, readingsRes]) => {
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

      setEquipmentCount(equipmentRes.data?.length ?? 0);
      setReadingsTodayCount(readingsRes.count ?? 0);
    });

    return () => {
      cancelled = true;
    };
  }, [activeLocationId]);

  return {
    activeLocationId,
    equipmentCount,
    openIncidentCount,
    readingsTodayCount,
    isLoading,
    error,
  };
}
