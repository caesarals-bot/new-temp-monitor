import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import {
  listStaffByLocation,
  createStaff as createStaffService,
  updateStaff as updateStaffService,
  setStaffActive as setStaffActiveService,
  countStaffReadings as countStaffReadingsService,
} from '../services/staff.service';
import type { CreateStaffFormData, UpdateStaffFormData } from '../schemas/staff.schema';
import type { Staff } from '@/shared/types/supabase';

type DialogMode = 'closed' | 'create' | 'edit' | 'toggle';

function canManageStaff(role: string | null | undefined): boolean {
  return role === 'owner' || role === 'admin' || role === 'manager';
}

function mapStaffError(message: string | null | undefined): string | null {
  if (!message) return null;
  return message;
}

export interface UseStaffManagementReturn {
  canEdit: boolean;
  activeLocationId: string | null;
  activeLocationName: string | null;
  staffList: Staff[];
  readingsCountByStaff: Map<string, number>;
  isLoadingStaff: boolean;
  staffError: string | null;

  isMutating: boolean;
  dialog: DialogMode;
  editingStaff: Staff | null;
  togglingStaff: Staff | null;
  toggleReadingsCount: number | null;
  isLoadingToggleCount: boolean;
  formError: string | null;
  toggleError: string | null;

  openCreate: () => void;
  openEdit: (staff: Staff) => void;
  openToggle: (staff: Staff) => Promise<void>;
  closeDialog: () => void;
  submitCreate: (data: CreateStaffFormData) => Promise<void>;
  submitEdit: (id: string, data: UpdateStaffFormData) => Promise<void>;
  confirmToggle: (staff: Staff) => Promise<void>;
  refreshStaff: () => Promise<void>;
}

export function useStaffManagement(): UseStaffManagementReturn {
  const profile = useAuthStore((s) => s.profile);
  const activeLocationId = useOrganizationStore((s) => s.activeLocationId);
  const locations = useOrganizationStore((s) => s.locations);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [readingsCountByStaff, setReadingsCountByStaff] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  const [isMutating, setIsMutating] = useState(false);
  const [dialog, setDialog] = useState<DialogMode>('closed');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [togglingStaff, setTogglingStaff] = useState<Staff | null>(null);
  const [toggleReadingsCount, setToggleReadingsCount] = useState<number | null>(null);
  const [isLoadingToggleCount, setIsLoadingToggleCount] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const canEdit = canManageStaff(profile?.role);
  const activeLocation = locations.find((l) => l.id === activeLocationId) ?? null;
  const activeLocationName = activeLocation?.name ?? null;

  const fetchStaff = useCallback(
    async (locationId: string) => {
      setIsLoadingStaff(true);
      setStaffError(null);
      const { data, error } = await listStaffByLocation(locationId);
      setIsLoadingStaff(false);
      if (error) {
        setStaffError(mapStaffError(error.message));
        setStaffList([]);
        return;
      }
      setStaffList(data ?? []);
    },
    []
  );

  const refreshStaff = useCallback(async () => {
    if (activeLocationId) await fetchStaff(activeLocationId);
  }, [activeLocationId, fetchStaff]);

  useEffect(() => {
    let cancelled = false;
    if (!activeLocationId) {
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch trigger, not a side-effect
    setIsLoadingStaff(true);
    setStaffError(null);
    void listStaffByLocation(activeLocationId).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setIsLoadingStaff(false);
        setStaffError(mapStaffError(error.message));
        setStaffList([]);
        setReadingsCountByStaff(new Map());
        return;
      }
      const staff = data ?? [];
      setStaffList(staff);
      if (staff.length === 0) {
        setIsLoadingStaff(false);
        setReadingsCountByStaff(new Map());
        return;
      }
      void Promise.all(
        staff.map((s) =>
          countStaffReadingsService(s.id).then(({ count, error: e }) => ({
            id: s.id,
            count: e ? 0 : count ?? 0,
          }))
        )
      ).then((entries) => {
        if (cancelled) return;
        const map = new Map<string, number>();
        for (const entry of entries) map.set(entry.id, entry.count);
        setReadingsCountByStaff(map);
        setIsLoadingStaff(false);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [activeLocationId]);

  const closeDialog = useCallback(() => {
    setDialog('closed');
    setEditingStaff(null);
    setTogglingStaff(null);
    setToggleReadingsCount(null);
    setFormError(null);
    setToggleError(null);
  }, []);

  const openCreate = useCallback(() => {
    setFormError(null);
    setEditingStaff(null);
    setDialog('create');
  }, []);

  const openEdit = useCallback((staff: Staff) => {
    setFormError(null);
    setEditingStaff(staff);
    setDialog('edit');
  }, []);

  const openToggle = useCallback(async (staff: Staff) => {
    setToggleError(null);
    setTogglingStaff(staff);
    setToggleReadingsCount(null);
    setIsLoadingToggleCount(true);
    setDialog('toggle');
    const { count, error } = await countStaffReadingsService(staff.id);
    setIsLoadingToggleCount(false);
    if (error) {
      setToggleError(mapStaffError(error.message));
      return;
    }
    setToggleReadingsCount(count ?? 0);
  }, []);

  const submitCreate = useCallback(
    async (data: CreateStaffFormData) => {
      if (!activeLocationId) return;
      setIsMutating(true);
      setFormError(null);
      const { error } = await createStaffService({
        locationId: activeLocationId,
        name: data.name,
        role: data.role,
      });
      setIsMutating(false);
      if (error) {
        setFormError(mapStaffError(error.message));
        return;
      }
      await fetchStaff(activeLocationId);
      closeDialog();
    },
    [activeLocationId, fetchStaff, closeDialog]
  );

  const submitEdit = useCallback(
    async (id: string, data: UpdateStaffFormData) => {
      setIsMutating(true);
      setFormError(null);
      const { error } = await updateStaffService(id, data);
      setIsMutating(false);
      if (error) {
        setFormError(mapStaffError(error.message));
        return;
      }
      if (activeLocationId) await fetchStaff(activeLocationId);
      closeDialog();
    },
    [activeLocationId, fetchStaff, closeDialog]
  );

  const confirmToggle = useCallback(
    async (staff: Staff) => {
      setIsMutating(true);
      setToggleError(null);
      const { error } = await setStaffActiveService(staff.id, !staff.active);
      setIsMutating(false);
      if (error) {
        setToggleError(mapStaffError(error.message));
        return;
      }
      if (activeLocationId) await fetchStaff(activeLocationId);
      closeDialog();
    },
    [activeLocationId, fetchStaff, closeDialog]
  );

  return {
    canEdit,
    activeLocationId,
    activeLocationName,
    staffList,
    readingsCountByStaff,
    isLoadingStaff,
    staffError,

    isMutating,
    dialog,
    editingStaff,
    togglingStaff,
    toggleReadingsCount,
    isLoadingToggleCount,
    formError,
    toggleError,

    openCreate,
    openEdit,
    openToggle,
    closeDialog,
    submitCreate,
    submitEdit,
    confirmToggle,
    refreshStaff,
  };
}
