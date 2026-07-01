import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import {
  listEquipmentByLocation,
  createEquipment as createEquipmentService,
  updateEquipment as updateEquipmentService,
  deleteEquipment as deleteEquipmentService,
  countEquipmentReadings as countEquipmentReadingsService,
} from '../services/equipment.service';
import type {
  CreateEquipmentFormData,
  UpdateEquipmentFormData,
} from '../schemas/equipment.schema';
import type { Equipment } from '@/shared/types/supabase';

type DialogMode = 'closed' | 'create' | 'edit' | 'delete';

function canManageEquipment(role: string | null | undefined): boolean {
  return role === 'owner' || role === 'admin' || role === 'manager';
}

function mapEquipmentError(message: string | null | undefined): string | null {
  if (!message) return null;
  return message;
}

export interface UseEquipmentManagementReturn {
  canEdit: boolean;
  activeLocationId: string | null;
  activeLocationName: string | null;
  equipmentList: Equipment[];
  isLoadingEquipment: boolean;
  equipmentError: string | null;

  isMutating: boolean;
  dialog: DialogMode;
  editingEquipment: Equipment | null;
  deletingEquipment: Equipment | null;
  deleteReadingsCount: number | null;
  isLoadingDeleteCount: boolean;
  formError: string | null;
  deleteError: string | null;

  openCreate: () => void;
  openEdit: (equipment: Equipment) => void;
  openDelete: (equipment: Equipment) => Promise<void>;
  closeDialog: () => void;
  submitCreate: (data: CreateEquipmentFormData) => Promise<void>;
  submitEdit: (id: string, data: UpdateEquipmentFormData) => Promise<void>;
  confirmDelete: (equipment: Equipment) => Promise<void>;
}

export function useEquipmentManagement(): UseEquipmentManagementReturn {
  const profile = useAuthStore((s) => s.profile);
  const activeLocationId = useOrganizationStore((s) => s.activeLocationId);
  const locations = useOrganizationStore((s) => s.locations);

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);

  const [isMutating, setIsMutating] = useState(false);
  const [dialog, setDialog] = useState<DialogMode>('closed');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);
  const [deleteReadingsCount, setDeleteReadingsCount] = useState<number | null>(null);
  const [isLoadingDeleteCount, setIsLoadingDeleteCount] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const canEdit = canManageEquipment(profile?.role);
  const activeLocation = locations.find((l) => l.id === activeLocationId) ?? null;
  const activeLocationName = activeLocation?.name ?? null;

  const fetchEquipment = useCallback(
    async (locationId: string) => {
      setIsLoadingEquipment(true);
      setEquipmentError(null);
      const { data, error } = await listEquipmentByLocation(locationId);
      setIsLoadingEquipment(false);
      if (error) {
        setEquipmentError(mapEquipmentError(error.message));
        setEquipmentList([]);
        return;
      }
      setEquipmentList(data ?? []);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    if (!activeLocationId) {
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch trigger, not a side-effect
    setIsLoadingEquipment(true);
    setEquipmentError(null);
    void listEquipmentByLocation(activeLocationId).then(({ data, error }) => {
      if (cancelled) return;
      setIsLoadingEquipment(false);
      if (error) {
        setEquipmentError(mapEquipmentError(error.message));
        setEquipmentList([]);
        return;
      }
      setEquipmentList(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [activeLocationId, fetchEquipment]);

  const closeDialog = useCallback(() => {
    setDialog('closed');
    setEditingEquipment(null);
    setDeletingEquipment(null);
    setDeleteReadingsCount(null);
    setFormError(null);
    setDeleteError(null);
  }, []);

  const openCreate = useCallback(() => {
    setFormError(null);
    setEditingEquipment(null);
    setDialog('create');
  }, []);

  const openEdit = useCallback((equipment: Equipment) => {
    setFormError(null);
    setEditingEquipment(equipment);
    setDialog('edit');
  }, []);

  const openDelete = useCallback(async (equipment: Equipment) => {
    setDeleteError(null);
    setDeletingEquipment(equipment);
    setDeleteReadingsCount(null);
    setIsLoadingDeleteCount(true);
    setDialog('delete');
    const { count, error } = await countEquipmentReadingsService(equipment.id);
    setIsLoadingDeleteCount(false);
    if (error) {
      setDeleteError(mapEquipmentError(error.message));
      return;
    }
    setDeleteReadingsCount(count ?? 0);
  }, []);

  const submitCreate = useCallback(
    async (data: CreateEquipmentFormData) => {
      if (!activeLocationId) return;
      setIsMutating(true);
      setFormError(null);
      const { error } = await createEquipmentService({
        locationId: activeLocationId,
        name: data.name,
        physicalLocation: data.physicalLocation ?? null,
        minTemp: data.minTemp,
        maxTemp: data.maxTemp,
      });
      setIsMutating(false);
      if (error) {
        setFormError(mapEquipmentError(error.message));
        return;
      }
      await fetchEquipment(activeLocationId);
      closeDialog();
    },
    [activeLocationId, fetchEquipment, closeDialog]
  );

  const submitEdit = useCallback(
    async (id: string, data: UpdateEquipmentFormData) => {
      setIsMutating(true);
      setFormError(null);
      const { error } = await updateEquipmentService(id, data);
      setIsMutating(false);
      if (error) {
        setFormError(mapEquipmentError(error.message));
        return;
      }
      if (activeLocationId) await fetchEquipment(activeLocationId);
      closeDialog();
    },
    [activeLocationId, fetchEquipment, closeDialog]
  );

  const confirmDelete = useCallback(
    async (equipment: Equipment) => {
      setIsMutating(true);
      setDeleteError(null);
      const { error } = await deleteEquipmentService(equipment.id);
      setIsMutating(false);
      if (error) {
        setDeleteError(mapEquipmentError(error.message));
        return;
      }
      if (activeLocationId) await fetchEquipment(activeLocationId);
      closeDialog();
    },
    [activeLocationId, fetchEquipment, closeDialog]
  );

  return {
    canEdit,
    activeLocationId,
    activeLocationName,
    equipmentList,
    isLoadingEquipment,
    equipmentError,

    isMutating,
    dialog,
    editingEquipment,
    deletingEquipment,
    deleteReadingsCount,
    isLoadingDeleteCount,
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
