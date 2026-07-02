/**
 * Hook principal de la página de Incidentes.
 *
 * Encapsula:
 * - Carga y refresh de incidentes de la org activa (vía store).
 * - State machine del modal de resolución (closed | resolving).
 * - RBAC: deriva `canResolve` desde el rol del profile (owner/admin/manager).
 * - Errores separados: `listError` (carga) y `resolveError` (modal).
 * - Filtros vigentes (status/locationId/equipmentId/dateRange) pasados al
 *   service en cada fetch.
 */
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import {
  useIncidentStore,
  selectIsIncidentsLoading,
  selectIncidentsError,
} from '@/features/incidents/store/incident.store';
import { listIncidents, resolveIncident } from '@/features/incidents/services/incidents.service';
import type { IncidentFilters, IncidentWithReading } from '../types';
import type { ResolveIncidentFormData } from '../schemas/incident.schema';

function canResolveIncidents(role: string | null | undefined): boolean {
  return role === 'owner' || role === 'admin' || role === 'manager';
}

function mapError(message: string | null | undefined): string | null {
  if (!message) return null;
  return message;
}

export interface UseIncidentsReturn {
  canResolve: boolean;
  orgId: string | null;
  incidents: IncidentWithReading[];
  isLoading: boolean;
  listError: string | null;

  filters: IncidentFilters;
  setFilter: <K extends keyof IncidentFilters>(key: K, value: IncidentFilters[K]) => void;
  clearFilters: () => void;

  resolving: IncidentWithReading | null;
  openResolve: (incident: IncidentWithReading) => void;
  closeResolve: () => void;
  submitResolve: (data: ResolveIncidentFormData) => Promise<void>;
  isResolving: boolean;
  resolveError: string | null;

  refresh: () => Promise<void>;
}

const EMPTY_FILTERS: IncidentFilters = {};

export function useIncidents(): UseIncidentsReturn {
  const profile = useAuthStore((s) => s.profile);
  const orgId = useOrganizationStore((s) => s.organization?.id ?? null);

  const incidents = useIncidentStore((s) => s.openIncidents);
  const isLoading = useIncidentStore(selectIsIncidentsLoading);
  const storeError = useIncidentStore(selectIncidentsError);

  const [filters, setFilters] = useState<IncidentFilters>(EMPTY_FILTERS);
  const [resolving, setResolving] = useState<IncidentWithReading | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const canResolve = canResolveIncidents(profile?.role);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setListError(null);
    const { error } = await listIncidents({ organizationId: orgId, filters });
    if (error) {
      setListError(mapError(error.message));
    }
  }, [orgId, filters]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setFilter = useCallback(
    <K extends keyof IncidentFilters>(key: K, value: IncidentFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const openResolve = useCallback((incident: IncidentWithReading) => {
    setResolveError(null);
    setResolving(incident);
  }, []);

  const closeResolve = useCallback(() => {
    setResolving(null);
    setResolveError(null);
    setIsResolving(false);
  }, []);

  const submitResolve = useCallback(
    async (data: ResolveIncidentFormData) => {
      if (!resolving || !profile?.id) return;
      setIsResolving(true);
      setResolveError(null);

      const { error } = await resolveIncident({
        incidentId: resolving.id,
        actionTaken: data.actionTaken,
        resolvedBy: profile.id,
      });

      setIsResolving(false);

      if (error) {
        setResolveError(mapError(error.message));
        return;
      }

      useIncidentStore.getState().upsertIncident({ ...resolving, status: 'resolved' });
      closeResolve();
    },
    [resolving, profile?.id, closeResolve]
  );

  return {
    canResolve,
    orgId,
    incidents,
    isLoading,
    listError: listError ?? storeError,

    filters,
    setFilter,
    clearFilters,

    resolving,
    openResolve,
    closeResolve,
    submitResolve,
    isResolving,
    resolveError,

    refresh,
  };
}