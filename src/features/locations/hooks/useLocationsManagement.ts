import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { useIncidentStore, selectOpenIncidentsByLocation } from '@/features/incidents/store/incident.store';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import {
  createLocation as createLocationService,
  updateLocation as updateLocationService,
  deleteLocation as deleteLocationService,
  countLocationDependencies,
  type CreateLocationInput,
  type UpdateLocationInput,
  type LocationDependencies,
} from '../services/locations.service';
import type { CreateLocationFormData, UpdateLocationFormData } from '../schemas/location.schema';
import type { Location } from '@/shared/types/supabase';

type DialogMode = 'closed' | 'create' | 'edit' | 'delete';

function canManageLocations(role: string | null | undefined): boolean {
  return role === 'owner' || role === 'admin';
}

function mapLocationError(message: string | null | undefined): string | null {
  if (!message) return null;
  return message;
}

export interface UseLocationsManagementReturn {
  canEdit: boolean;
  orgId: string | null;
  atLimit: boolean;
  maxLocations: number;
  planType: 'basic' | 'pro' | 'enterprise';
  isMutating: boolean;
  equipmentCountByLocation: Map<string, number>;
  openIncidentsByLocation: Map<string, number>;

  dialog: DialogMode;
  editingLocation: Location | null;
  deletingLocation: Location | null;
  dependencies: LocationDependencies | null;
  isLoadingDependencies: boolean;
  formError: string | null;
  deleteError: string | null;

  openCreate: () => void;
  openEdit: (location: Location) => void;
  openDelete: (location: Location) => Promise<void>;
  closeDialog: () => void;
  submitCreate: (data: CreateLocationFormData) => Promise<void>;
  submitEdit: (id: string, data: UpdateLocationFormData) => Promise<void>;
  confirmDelete: (location: Location) => Promise<void>;
}

export function useLocationsManagement(): UseLocationsManagementReturn {
  const organization = useOrganizationStore((s) => s.organization);
  const locations = useOrganizationStore((s) => s.locations);
  const activeLocationId = useOrganizationStore((s) => s.activeLocationId);
  const setActiveLocation = useOrganizationStore((s) => s.setActiveLocation);
  const fetchLocations = useOrganizationStore((s) => s.fetchLocations);
  const profile = useAuthStore((s) => s.profile);
  const openIncidentsByLocation = useIncidentStore(selectOpenIncidentsByLocation);

  const [dialog, setDialog] = useState<DialogMode>('closed');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
  const [dependencies, setDependencies] = useState<LocationDependencies | null>(null);
  const [isLoadingDependencies, setIsLoadingDependencies] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [equipmentCountByLocation, setEquipmentCountByLocation] = useState<Map<string, number>>(
    new Map()
  );

  const canEdit = canManageLocations(profile?.role);
  const orgId = organization?.id ?? null;
  const maxLocations = organization?.max_locations ?? 0;
  const planType = organization?.plan_type ?? 'basic';
  const atLimit = locations.length >= maxLocations;

  const closeDialog = useCallback(() => {
    setDialog('closed');
    setEditingLocation(null);
    setDeletingLocation(null);
    setDependencies(null);
    setFormError(null);
    setDeleteError(null);
  }, []);

  const refreshLocations = useCallback(async () => {
    if (orgId) await fetchLocations(orgId);
  }, [orgId, fetchLocations]);

  useEffect(() => {
    let cancelled = false;
    if (locations.length === 0) {
      setEquipmentCountByLocation(new Map());
      return () => {
        cancelled = true;
      };
    }
    void Promise.all(
      locations.map((l) =>
        listEquipmentByLocation(l.id).then(({ data, error }) => ({
          id: l.id,
          count: error ? 0 : (data ?? []).length,
        }))
      )
    ).then((entries) => {
      if (cancelled) return;
      const map = new Map<string, number>();
      for (const entry of entries) map.set(entry.id, entry.count);
      setEquipmentCountByLocation(map);
    });
    return () => {
      cancelled = true;
    };
  }, [locations]);

  const openCreate = useCallback(() => {
    setFormError(null);
    setEditingLocation(null);
    setDialog('create');
  }, []);

  const openEdit = useCallback((location: Location) => {
    setFormError(null);
    setEditingLocation(location);
    setDialog('edit');
  }, []);

  const openDelete = useCallback(async (location: Location) => {
    setDeleteError(null);
    setDeletingLocation(location);
    setDependencies(null);
    setIsLoadingDependencies(true);
    setDialog('delete');
    const { data, error } = await countLocationDependencies(location.id);
    setIsLoadingDependencies(false);
    if (error) {
      setDeleteError(mapLocationError(error.message));
      return;
    }
    setDependencies(data);
  }, []);

  const submitCreate = useCallback(
    async (data: CreateLocationFormData) => {
      if (!orgId) return;
      setIsMutating(true);
      setFormError(null);
      const payload: CreateLocationInput = {
        organizationId: orgId,
        name: data.name,
        address: data.address ?? null,
      };
      const { data: created, error } = await createLocationService(payload);
      setIsMutating(false);
      if (error || !created) {
        setFormError(mapLocationError(error?.message));
        return;
      }
      await refreshLocations();
      if (!activeLocationId) setActiveLocation(created.id);
      closeDialog();
    },
    [orgId, refreshLocations, activeLocationId, setActiveLocation, closeDialog]
  );

  const submitEdit = useCallback(
    async (id: string, data: UpdateLocationFormData) => {
      setIsMutating(true);
      setFormError(null);
      const payload: UpdateLocationInput = {
        name: data.name,
        address: data.address,
      };
      const { error } = await updateLocationService(id, payload);
      setIsMutating(false);
      if (error) {
        setFormError(mapLocationError(error.message));
        return;
      }
      await refreshLocations();
      closeDialog();
    },
    [refreshLocations, closeDialog]
  );

  const confirmDelete = useCallback(
    async (location: Location) => {
      setIsMutating(true);
      setDeleteError(null);
      const { error } = await deleteLocationService(location.id);
      setIsMutating(false);
      if (error) {
        setDeleteError(mapLocationError(error.message));
        return;
      }
      if (activeLocationId === location.id) {
        setActiveLocation(null);
      }
      await refreshLocations();
      closeDialog();
    },
    [refreshLocations, activeLocationId, setActiveLocation, closeDialog]
  );

  return {
    canEdit,
    orgId,
    atLimit,
    maxLocations,
    planType,
    isMutating,
    equipmentCountByLocation,
    openIncidentsByLocation,

    dialog,
    editingLocation,
    deletingLocation,
    dependencies,
    isLoadingDependencies,
    formError,
    deleteError,

    openCreate,
    openEdit,
    openDelete,
    closeDialog,
    submitCreate,
    submitEdit,
    confirmDelete,
  };
}
