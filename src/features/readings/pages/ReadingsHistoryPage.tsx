import { useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { listReadingsByLocation } from '../services/readings.service';
import { useRealtimeReadings } from '../hooks/useRealtimeReadings';
import { EquipmentStatusGrid } from '../components/EquipmentStatusGrid';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { Equipment, TemperatureReading } from '@/shared/types/supabase';

function buildInitialMap(readings: TemperatureReading[]): Map<string, TemperatureReading> {
  const map = new Map<string, TemperatureReading>();
  for (const r of readings) {
    if (!r.equipment_id) continue;
    const prev = map.get(r.equipment_id);
    if (!prev || prev.recorded_at < r.recorded_at) {
      map.set(r.equipment_id, r);
    }
  }
  return map;
}

export function ReadingsHistoryPage() {
  const activeLocationId = useOrganizationStore((s) => s.activeLocationId);
  const activeLocationName = useOrganizationStore((s) => {
    const locations = s.locations as Array<{ id: string; name: string }> | undefined;
    return locations?.find((l) => l.id === s.activeLocationId)?.name ?? null;
  });

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);

  const [initialReadings, setInitialReadings] = useState<TemperatureReading[]>([]);
  const [isLoadingReadings, setIsLoadingReadings] = useState(false);
  const [readingsError, setReadingsError] = useState<string | null>(null);

  const realtime = useRealtimeReadings({ locationId: activeLocationId });

  useEffect(() => {
    let cancelled = false;
    if (!activeLocationId) {
      setEquipmentList([]);
      setInitialReadings([]);
      return () => {
        cancelled = true;
      };
    }
    setIsLoadingEquipment(true);
    setEquipmentError(null);
    void listEquipmentByLocation(activeLocationId).then(({ data, error }) => {
      if (cancelled) return;
      setIsLoadingEquipment(false);
      if (error) {
        setEquipmentError(error.message);
        setEquipmentList([]);
        return;
      }
      setEquipmentList(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [activeLocationId]);

  useEffect(() => {
    let cancelled = false;
    if (!activeLocationId) {
      return () => {
        cancelled = true;
      };
    }
    setIsLoadingReadings(true);
    setReadingsError(null);
    void listReadingsByLocation(activeLocationId).then(({ data, error }) => {
      if (cancelled) return;
      setIsLoadingReadings(false);
      if (error) {
        setReadingsError(error.message);
        setInitialReadings([]);
        return;
      }
      setInitialReadings(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [activeLocationId]);

  const latestByEquipment = useMemo(() => {
    const map = buildInitialMap(initialReadings);
    for (const [equipmentId, reading] of realtime.latestByEquipment.entries()) {
      const prev = map.get(equipmentId);
      if (!prev || prev.recorded_at < reading.recorded_at) {
        map.set(equipmentId, reading);
      }
    }
    return map;
  }, [initialReadings, realtime.latestByEquipment]);

  if (!activeLocationId) {
    return (
      <div className="flex flex-col">
        <ReadingsHistoryHeader activeLocationName={null} isRealtime={false} />
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--color-eucalyptus-bg]">
                <Activity className="h-6 w-6 text-[--color-eucalyptus]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-medium text-[--color-text-primary]">
                  Sin sede seleccionada
                </p>
                <p className="mt-1 text-sm text-[--color-text-secondary]">
                  Usa el selector de sede para ver el estado de los equipos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fetchError = equipmentError ?? readingsError;
  const isLoading = isLoadingEquipment || isLoadingReadings;

  return (
    <div className="flex flex-col">
      <ReadingsHistoryHeader
        activeLocationName={activeLocationName}
        isRealtime={realtime.isSubscribed}
      />

      <div className="flex-1 p-6">
        {fetchError && (
          <div
            className="mb-6 rounded-md border border-[--color-danger-border] bg-[--color-danger-bg] p-4 text-sm text-[--color-danger]"
            data-testid="readings-error"
          >
            {fetchError}
          </div>
        )}

        {isLoading && equipmentList.length === 0 ? (
          <p className="text-center text-sm text-[--color-text-muted]">
            Cargando estado de equipos...
          </p>
        ) : (
          <EquipmentStatusGrid equipmentList={equipmentList} latestByEquipment={latestByEquipment} />
        )}
      </div>
    </div>
  );
}

interface ReadingsHistoryHeaderProps {
  activeLocationName: string | null;
  isRealtime: boolean;
}

function ReadingsHistoryHeader({ activeLocationName, isRealtime }: ReadingsHistoryHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[--color-border] bg-white px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[--color-eucalyptus-bg]">
          <Activity className="h-5 w-5 text-[--color-eucalyptus]" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[--color-text-primary]">
            Estado de equipos
          </h1>
          <p className="mt-1 text-sm text-[--color-text-secondary]">
            {activeLocationName ? (
              <>
                Sede activa:{' '}
                <span className="font-medium text-[--color-text-primary]">
                  {activeLocationName}
                </span>
              </>
            ) : (
              'Selecciona una sede para ver el estado'
            )}
          </p>
        </div>
        {isRealtime && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-[--color-eucalyptus-bg] px-2 py-1 text-xs font-medium text-[--color-eucalyptus]"
            data-testid="realtime-badge"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-[--color-eucalyptus]" />
            En vivo
          </span>
        )}
      </div>
    </div>
  );
}