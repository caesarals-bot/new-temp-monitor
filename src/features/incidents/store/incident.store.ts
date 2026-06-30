import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';
import type { Incident } from '@/shared/types/supabase';

interface IncidentState {
  openIncidents: Incident[];
  isLoading: boolean;
  error: string | null;
  fetchOpenIncidents: (organizationId: string) => Promise<void>;
  subscribeRealtime: (organizationId: string) => () => void;
  reset: () => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  openIncidents: [],
  isLoading: false,
  error: null,

  fetchOpenIncidents: async (organizationId: string) => {
    if (!organizationId) return;
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          id,
          status,
          description,
          action_taken,
          resolved_by,
          resolved_at,
          created_at,
          reading_id,
          temperature_readings!inner (
            equipment_id,
            equipment:equipment!inner (
              location_id,
              locations!inner (
                organization_id
              )
            )
          )
        `)
        .eq('status', 'open')
        .eq('temperature_readings.equipment.locations.organization_id', organizationId);

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      const rows = (data ?? []) as unknown as Incident[];
      set({ openIncidents: rows, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error desconocido',
        isLoading: false,
      });
    }
  },

  subscribeRealtime: (_organizationId: string) => {
    return () => {};
  },

  reset: () => set({ openIncidents: [], error: null, isLoading: false }),
}));

export function selectOpenIncidentCount(state: Pick<IncidentState, 'openIncidents'>): number {
  return state.openIncidents.length;
}

export function selectHasOpenIncidents(state: Pick<IncidentState, 'openIncidents'>): boolean {
  return state.openIncidents.length > 0;
}
