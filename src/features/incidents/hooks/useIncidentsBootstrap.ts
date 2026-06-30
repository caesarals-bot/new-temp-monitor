import { useEffect } from 'react';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { useIncidentStore } from '@/features/incidents/store/incident.store';
import {
  isDevBypassEnabled,
  getDevMockIncidents,
} from '@/shared/lib/dev-bypass';

export function useIncidentsBootstrap() {
  const organization = useOrganizationStore((s) => s.organization);
  const fetchOpenIncidents = useIncidentStore((s) => s.fetchOpenIncidents);

  useEffect(() => {
    const orgId = organization?.id;
    if (!orgId) return;

    if (isDevBypassEnabled()) {
      useIncidentStore.setState({
        openIncidents: getDevMockIncidents(3),
        isLoading: false,
        error: null,
      });
      return;
    }

    void fetchOpenIncidents(orgId);
  }, [organization?.id, fetchOpenIncidents]);
}
