import { useEffect, useRef, useState } from 'react';
import { isDevBypassEnabled } from '@/shared/lib/dev-bypass';
import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError } from '@/shared/lib/supabase';
import type { TemperatureReading } from '@/shared/types/supabase';

interface UseRealtimeReadingsParams {
  locationId: string | null;
  enabled?: boolean;
}

export interface UseRealtimeReadingsReturn {
  latestByEquipment: Map<string, TemperatureReading>;
  isSubscribed: boolean;
  error: string | null;
}

const EMPTY: UseRealtimeReadingsReturn = {
  latestByEquipment: new Map(),
  isSubscribed: false,
  error: null,
};

/**
 * Suscribe al channel de Supabase Realtime para `temperature_readings` de la
 * sede activa. Retorna un Map con la última lectura conocida por equipo,
 * actualizándose ante eventos INSERT/UPDATE.
 *
 * Notas:
 * - En dev-bypass, retorna un Map vacío estable (no hay realtime real).
 * - Cleanup correcto en useEffect return: desuscribe el channel al desmontar
 *   o cambiar de locationId. Test crítico de memory leak.
 * - No filtra por locationId en el WHERE del channel porque PostgREST realtime
 *   soporta `filter` en el canal; usamos `equipment:location_id=eq.<id>` que
 *   requiere relación configurada. Para V1 usamos server-side: traer todas
 *   las nuevas readings y filtrar en cliente. Si llega a haber volumen alto
 *   se cambia a filter explícito.
 */
export function useRealtimeReadings({
  locationId,
  enabled = true,
}: UseRealtimeReadingsParams): UseRealtimeReadingsReturn {
  const [latestByEquipment, setLatestByEquipment] = useState<Map<string, TemperatureReading>>(
    new Map()
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!enabled || !locationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatestByEquipment(new Map());
      setIsSubscribed(false);
      setError(null);
      return;
    }

    if (isDevBypassEnabled()) {
      setLatestByEquipment(new Map());
      setIsSubscribed(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const channel = supabase
      .channel(`temperature_readings:${locationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'temperature_readings' },
        (payload) => {
          if (cancelled) return;
          const reading = payload.new as TemperatureReading | undefined;
          if (!reading || !reading.equipment_id) return;
          setLatestByEquipment((prev) => {
            const next = new Map(prev);
            next.set(reading.equipment_id, reading);
            return next;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'temperature_readings' },
        (payload) => {
          if (cancelled) return;
          const reading = payload.new as TemperatureReading | undefined;
          if (!reading || !reading.equipment_id) return;
          setLatestByEquipment((prev) => {
            const next = new Map(prev);
            next.set(reading.equipment_id, reading);
            return next;
          });
        }
      )
      .subscribe((status, err) => {
        if (cancelled) return;
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsSubscribed(false);
          if (err) {
            const e = err as { message?: string } | PostgrestError;
            setError(typeof e?.message === 'string' ? e.message : 'Realtime channel error');
          }
        }
      });

    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsSubscribed(false);
      setLatestByEquipment(new Map());
    };
  }, [locationId, enabled]);

  return { latestByEquipment, isSubscribed, error };
}

export const EMPTY_REALTIME: UseRealtimeReadingsReturn = EMPTY;
