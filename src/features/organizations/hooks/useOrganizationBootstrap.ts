import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';

export function useOrganizationBootstrap() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const organization = useOrganizationStore((s) => s.organization);
  const fetchOrganization = useOrganizationStore((s) => s.fetchOrganization);
  const fetchLocations = useOrganizationStore((s) => s.fetchLocations);

  useEffect(() => {
    if (!session || !profile?.organization_id) return;
    if (organization) return;

    let cancelled = false;

    (async () => {
      await fetchOrganization();
      if (cancelled) return;
      if (profile.organization_id) {
        await fetchLocations(profile.organization_id);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, profile, organization, fetchOrganization, fetchLocations]);
}
