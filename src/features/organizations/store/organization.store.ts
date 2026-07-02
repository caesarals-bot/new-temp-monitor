import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';
import type { Organization, Location } from '@/shared/types/supabase';

interface OrganizationState {
  organization: Organization | null;
  locations: Location[];
  activeLocationId: string | null;
  isLoading: boolean;

  setOrganization: (org: Organization | null) => void;
  setLocations: (locations: Location[]) => void;
  setActiveLocation: (locationId: string | null) => void;
  fetchOrganization: () => Promise<void>;
  fetchLocations: (organizationId: string) => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organization: null,
  locations: [],
  activeLocationId: null,
  isLoading: false,

  setOrganization: (organization) => set({ organization }),

  setLocations: (locations) => set({ locations }),

  setActiveLocation: (activeLocationId) => set({ activeLocationId }),

  fetchOrganization: async () => {
    set({ isLoading: true });
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();

      if (profileData?.organization_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single();

        if (orgData) {
          set({ organization: orgData });
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLocations: async (organizationId) => {
    set({ isLoading: true });
    try {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

      if (data) {
        set({ locations: data });
        if (data.length > 0 && !useOrganizationStore.getState().activeLocationId) {
          set({ activeLocationId: data[0].id });
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));