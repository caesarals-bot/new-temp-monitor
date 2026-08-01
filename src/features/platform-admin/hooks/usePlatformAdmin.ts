/**
 * Hook principal del feature `platform-admin`.
 *
 * Encapsula:
 * - Carga de lista de organizaciones con filtros vigentes.
 * - Carga de métricas globales en paralelo.
 * - State machine del dialog de cambio de estado (closed | changing).
 * - Errores separados por superficie (`listError`, `metricsError`,
 *   `statusError`).
 * - Paginación cliente (50 registros por página, suficiente para V1).
 *
 * Solo expone metadata (nunca readings/incidents detail). La separación
 * de errores sigue el principio #5 de ARCHITECTURE.md.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { supabase } from '@/shared/lib/supabase';
import {
  getGlobalMetrics,
  listOrganizations,
  updateOrganizationStatus,
  updateOrganizationPlan,
} from '../services/platform-admin.service';
import type {
  GlobalMetrics,
  ListOrganizationsParams,
  OrganizationListItem,
  UpdateOrganizationPlanInput,
} from '../types';

const PAGE_SIZE = 50;

function mapError(message: string | null | undefined): string | null {
  if (!message) return null;
  return message;
}

export interface UsePlatformAdminReturn {
  isPlatformAdmin: boolean;

  organizations: OrganizationListItem[];
  metrics: GlobalMetrics | null;

  isLoadingList: boolean;
  listError: string | null;
  filters: ListOrganizationsParams;
  setFilter: <K extends keyof ListOrganizationsParams>(
    key: K,
    value: ListOrganizationsParams[K]
  ) => void;
  clearFilters: () => void;
  refreshList: () => Promise<void>;

  isLoadingMetrics: boolean;
  metricsError: string | null;
  refreshMetrics: () => Promise<void>;

  changingStatusFor: OrganizationListItem | null;
  openStatusDialog: (org: OrganizationListItem) => void;
  closeStatusDialog: () => void;
  submitStatusChange: (newStatus: OrganizationListItem['status']) => Promise<void>;
  isChangingStatus: boolean;
  statusError: string | null;

  changingPlanFor: OrganizationListItem | null;
  openPlanDialog: (org: OrganizationListItem) => void;
  closePlanDialog: () => void;
  submitPlanChange: (input: UpdateOrganizationPlanInput) => Promise<void>;
  isChangingPlan: boolean;
  planError: string | null;

  currentPage: number;
  totalPages: number;
  pageOrganizations: OrganizationListItem[];
  setPage: (page: number) => void;
}

export function usePlatformAdmin(): UsePlatformAdminReturn {
  const profile = useAuthStore((s) => s.profile);
  const isPlatformAdmin = profile?.is_platform_admin ?? false;

  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);

  const [filters, setFilters] = useState<ListOrganizationsParams>({});
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const [changingStatusFor, setChangingStatusFor] = useState<OrganizationListItem | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [changingPlanFor, setChangingPlanFor] = useState<OrganizationListItem | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const refreshList = useCallback(async () => {
    if (!isPlatformAdmin) return;
    setIsLoadingList(true);
    setListError(null);

    const { data, error } = await listOrganizations(filters);
    setIsLoadingList(false);

    if (error) {
      setListError(mapError(error.message));
      return;
    }
    setOrganizations(data ?? []);
    setCurrentPage(1);
  }, [filters, isPlatformAdmin]);

  const refreshMetrics = useCallback(async () => {
    if (!isPlatformAdmin) return;
    setIsLoadingMetrics(true);
    setMetricsError(null);

    const { data, error } = await getGlobalMetrics();
    setIsLoadingMetrics(false);

    if (error) {
      setMetricsError(mapError(error.message));
      return;
    }
    setMetrics(data);
  }, [isPlatformAdmin]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch trigger, not a side-effect
    void refreshList();
  }, [refreshList]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch trigger, not a side-effect
    void refreshMetrics();
  }, [refreshMetrics]);

  // Realtime: cualquier cambio en `organizations` (INSERT/UPDATE/DELETE)
  // refresca lista + métricas. Solo para platform admin. Cleanup al desmontar.
  useEffect(() => {
    if (!isPlatformAdmin) return;

    const channel = supabase
      .channel('platform-admin:organizations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'organizations' }, () => {
        void refreshList();
        void refreshMetrics();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'organizations' }, () => {
        void refreshList();
        void refreshMetrics();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'organizations' }, () => {
        void refreshList();
        void refreshMetrics();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isPlatformAdmin, refreshList, refreshMetrics]);

  const setFilter = useCallback(
    <K extends keyof ListOrganizationsParams>(key: K, value: ListOrganizationsParams[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => setFilters({}), []);

  const openStatusDialog = useCallback((org: OrganizationListItem) => {
    setStatusError(null);
    setChangingStatusFor(org);
  }, []);

  const closeStatusDialog = useCallback(() => {
    setChangingStatusFor(null);
    setStatusError(null);
    setIsChangingStatus(false);
  }, []);

  const submitStatusChange = useCallback(
    async (newStatus: OrganizationListItem['status']) => {
      if (!changingStatusFor) return;
      setIsChangingStatus(true);
      setStatusError(null);

      const { error } = await updateOrganizationStatus(changingStatusFor.id, newStatus);
      setIsChangingStatus(false);

      if (error) {
        setStatusError(mapError(error.message));
        return;
      }

      setOrganizations((prev) =>
        prev.map((org) => (org.id === changingStatusFor.id ? { ...org, status: newStatus } : org))
      );
      void refreshMetrics();
      closeStatusDialog();
    },
    [changingStatusFor, refreshMetrics, closeStatusDialog]
  );

  const openPlanDialog = useCallback((org: OrganizationListItem) => {
    setPlanError(null);
    setChangingPlanFor(org);
  }, []);

  const closePlanDialog = useCallback(() => {
    setChangingPlanFor(null);
    setPlanError(null);
    setIsChangingPlan(false);
  }, []);

  const submitPlanChange = useCallback(
    async (input: UpdateOrganizationPlanInput) => {
      if (!changingPlanFor) return;
      setIsChangingPlan(true);
      setPlanError(null);

      const { error } = await updateOrganizationPlan(changingPlanFor.id, input);
      setIsChangingPlan(false);

      if (error) {
        setPlanError(mapError(error.message));
        return;
      }

      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === changingPlanFor.id
            ? { ...org, plan_type: input.planType, max_locations: input.maxLocations }
            : org
        )
      );
      void refreshMetrics();
      closePlanDialog();
    },
    [changingPlanFor, refreshMetrics, closePlanDialog]
  );

  const totalPages = Math.max(1, Math.ceil(organizations.length / PAGE_SIZE));
  const pageOrganizations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return organizations.slice(start, start + PAGE_SIZE);
  }, [organizations, currentPage]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  return {
    isPlatformAdmin,
    organizations,
    metrics,
    isLoadingList,
    listError,
    filters,
    setFilter,
    clearFilters,
    refreshList,
    isLoadingMetrics,
    metricsError,
    refreshMetrics,
    changingStatusFor,
    openStatusDialog,
    closeStatusDialog,
    submitStatusChange,
    isChangingStatus,
    statusError,
    changingPlanFor,
    openPlanDialog,
    closePlanDialog,
    submitPlanChange,
    isChangingPlan,
    planError,
    currentPage,
    totalPages,
    pageOrganizations,
    setPage,
  };
}
