import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import {
  isDevBypassEnabled,
  getDevMockOrganization,
  getDevMockLocations,
  getDevMockActiveLocationId,
} from '@/shared/lib/dev-bypass';

export function useOrganizationBootstrap() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const organization = useOrganizationStore((s) => s.organization);
  const fetchOrganization = useOrganizationStore((s) => s.fetchOrganization);
  const fetchLocations = useOrganizationStore((s) => s.fetchLocations);

  useEffect(() => {
    if (!session || !profile?.organization_id) return;

    // Si ya tenemos la organización y sedes cargadas, no hacer nada
    if (organization && useOrganizationStore.getState().locations.length > 0) return;

    if (isDevBypassEnabled()) {
      useOrganizationStore.getState().setOrganization(getDevMockOrganization());
      useOrganizationStore.getState().setLocations(getDevMockLocations());
      useOrganizationStore.getState().setActiveLocation(getDevMockActiveLocationId());
      return;
    }

    // Fetch both in parallel to avoid race conditions and improve load time.
    // Nota: los fetch del store no son cancelables; la protección contra el
    // doble disparo del HOTFIX-001 es el guard de estado de arriba.
    void Promise.all([fetchOrganization(), fetchLocations(profile.organization_id!)]);
  }, [session, profile, organization, fetchOrganization, fetchLocations]);
}
