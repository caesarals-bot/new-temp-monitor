import { useEffect } from 'react';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { useIncidentStore } from '@/features/incidents/store/incident.store';
import {
  isDevBypassEnabled,
  getDevMockIncidents,
} from '@/shared/lib/dev-bypass';
import type { IncidentWithReading } from '../types';

/**
 * Bootstrap del store de incidentes.
 *
 * - En producción: trae los incidentes abiertos de la org activa y monta la
 *   subscripción Realtime una sola vez por sesión.
 * - En dev-bypass: carga mocks para que la UI tenga datos sin necesidad de
 *   Supabase real.
 *
 * El cleanup del channel Realtime se hace dentro de `subscribeRealtime`
 * (devuelve su propia función de cleanup que llama a `supabase.removeChannel`).
 */
export function useIncidentsBootstrap() {
  const organization = useOrganizationStore((s) => s.organization);
  const fetchOpenIncidents = useIncidentStore((s) => s.fetchOpenIncidents);
  const subscribeRealtime = useIncidentStore((s) => s.subscribeRealtime);

  useEffect(() => {
    const orgId = organization?.id;
    if (!orgId) return;

    if (isDevBypassEnabled()) {
      const mocks = getDevMockIncidents(3) as unknown as IncidentWithReading[];
      useIncidentStore.setState({
        openIncidents: mocks,
        openIncidentsByLocation: new Map(),
        isLoading: false,
        error: null,
      });
      return;
    }

    void fetchOpenIncidents(orgId);
    const unsubscribe = subscribeRealtime(orgId);
    return unsubscribe;
  }, [organization?.id, fetchOpenIncidents, subscribeRealtime]);
}