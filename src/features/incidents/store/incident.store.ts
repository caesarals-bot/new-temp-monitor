/**
 * Store de incidentes (Zustand).
 *
 * Responsabilidad única: mantener en memoria la lista de incidentes abiertos
 * de la organización activa y reflejar cambios en tiempo real vía Supabase
 * Realtime.
 *
 * Estado:
 * - `openIncidents`: lista plana de incidentes abiertos (alimenta badge de
 *   sidebar y `LocationCard` via selectores).
 * - `openIncidentsByLocation`: índice `Map<locationId, count>` derivado para
 *   que `LocationCard` se suscriba solo a su sede sin re-renderizar cuando
 *   cambia otra sede (ADR-011).
 * - `isLoading` / `error` para la carga inicial.
 * - `isSubscribed` / `subscribedOrgId`: tracking del channel activo para
 *   idempotencia (la subscripción se inicializa UNA sola vez por sesión, no
 *   se duplica si el bootstrap se vuelve a montar).
 *
 * Patrón de consumo (selectores granulares — AGENT.md):
 *   const count = useIncidentStore(selectOpenIncidentCount);
 *   const countByLoc = useIncidentStore(selectOpenIncidentCountByLocation);
 *   const countForLoc1 = countByLoc.get('loc-1') ?? 0;
 */
import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';
import { isDevBypassEnabled } from '@/shared/lib/dev-bypass';
import type { IncidentWithReading } from '../types';

interface IncidentState {
  openIncidents: IncidentWithReading[];
  openIncidentsByLocation: Map<string, number>;
  isLoading: boolean;
  error: string | null;
  isSubscribed: boolean;
  subscribedOrgId: string | null;

  fetchOpenIncidents: (organizationId: string) => Promise<void>;
  subscribeRealtime: (organizationId: string) => () => void;
  upsertIncident: (incident: IncidentWithReading) => void;
  removeIncident: (incidentId: string) => void;
  reset: () => void;
}

function indexByLocation(incidents: IncidentWithReading[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const inc of incidents) {
    const locationId = inc.reading?.equipment?.location_id;
    if (!locationId) continue;
    map.set(locationId, (map.get(locationId) ?? 0) + 1);
  }
  return map;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  openIncidents: [],
  openIncidentsByLocation: new Map(),
  isLoading: false,
  error: null,
  isSubscribed: false,
  subscribedOrgId: null,

  fetchOpenIncidents: async (organizationId: string) => {
    if (!organizationId) return;
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('incidents')
        .select(
          `
          id,
          reading_id,
          status,
          description,
          action_taken,
          resolved_by,
          resolved_at,
          created_at,
          reading:temperature_readings!inner (
            id,
            value,
            recorded_at,
            equipment_id,
            equipment:equipment!inner (
              id,
              name,
              min_temp,
              max_temp,
              location_id,
              locations!inner (
                organization_id
              )
            )
          )
        `
        )
        .eq('status', 'open')
        .eq('reading.equipment.locations.organization_id', organizationId);

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      const rows = (data ?? []) as unknown as IncidentWithReading[];
      set({
        openIncidents: rows,
        openIncidentsByLocation: indexByLocation(rows),
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error desconocido',
        isLoading: false,
      });
    }
  },

  subscribeRealtime: (organizationId: string) => {
    if (!organizationId) return () => {};
    if (isDevBypassEnabled()) {
      set({ isSubscribed: false, subscribedOrgId: null });
      return () => {};
    }
    if (get().subscribedOrgId === organizationId && get().isSubscribed) {
      return () => {};
    }

    const channel = supabase
      .channel(`incidents:org:${organizationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidents' },
        () => {
          void get().fetchOpenIncidents(organizationId);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'incidents' },
        () => {
          void get().fetchOpenIncidents(organizationId);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'incidents' },
        () => {
          void get().fetchOpenIncidents(organizationId);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({ isSubscribed: true, subscribedOrgId: organizationId });
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          set({ isSubscribed: false });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
      set({ isSubscribed: false, subscribedOrgId: null });
    };
  },

  upsertIncident: (incident: IncidentWithReading) => {
    set((state) => {
      const existing = state.openIncidents.findIndex((i) => i.id === incident.id);
      if (existing >= 0) {
        if (incident.status !== 'open') {
          const next = state.openIncidents.filter((i) => i.id !== incident.id);
          return {
            openIncidents: next,
            openIncidentsByLocation: indexByLocation(next),
          };
        }
        const next = state.openIncidents.slice();
        next[existing] = incident;
        return {
          openIncidents: next,
          openIncidentsByLocation: indexByLocation(next),
        };
      }
      if (incident.status !== 'open') return state;
      const next = [incident, ...state.openIncidents];
      return {
        openIncidents: next,
        openIncidentsByLocation: indexByLocation(next),
      };
    });
  },

  removeIncident: (incidentId: string) => {
    set((state) => {
      const next = state.openIncidents.filter((i) => i.id !== incidentId);
      if (next.length === state.openIncidents.length) return state;
      return {
        openIncidents: next,
        openIncidentsByLocation: indexByLocation(next),
      };
    });
  },

  reset: () =>
    set({
      openIncidents: [],
      openIncidentsByLocation: new Map(),
      error: null,
      isLoading: false,
      isSubscribed: false,
      subscribedOrgId: null,
    }),
}));

/**
 * Selectores granulares. Consume con:
 *   const count = useIncidentStore(selectOpenIncidentCount);
 * Evita re-renders ante cambios no observados.
 */
export function selectOpenIncidentCount(
  state: Pick<IncidentState, 'openIncidents'>
): number {
  return state.openIncidents.length;
}

export function selectOpenIncidentsByLocation(
  state: Pick<IncidentState, 'openIncidentsByLocation'>
): Map<string, number> {
  return state.openIncidentsByLocation;
}

export function selectHasOpenIncidents(
  state: Pick<IncidentState, 'openIncidents'>
): boolean {
  return state.openIncidents.length > 0;
}

export function selectIsIncidentsLoading(
  state: Pick<IncidentState, 'isLoading'>
): boolean {
  return state.isLoading;
}

export function selectIncidentsError(
  state: Pick<IncidentState, 'error'>
): string | null {
  return state.error;
}