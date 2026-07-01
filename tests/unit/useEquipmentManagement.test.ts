import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

let mockActiveLocationId: string | null = 'loc-1';

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        organization: { id: 'org-1' },
        locations: [
          { id: 'loc-1', name: 'Casa Central' },
          { id: 'loc-2', name: 'Sucursal Norte' },
        ],
        activeLocationId: mockActiveLocationId,
        setActiveLocation: vi.fn(),
        fetchLocations: vi.fn().mockResolvedValue(undefined),
      }),
    { getState: () => ({}) }
  ),
}));

let mockProfile: Record<string, unknown> | null = {
  id: 'u-1',
  email: 'dev@tempmonitor.local',
  role: 'owner',
  is_platform_admin: false,
  organization_id: 'org-1',
};

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ profile: mockProfile }),
}));

vi.mock('@/features/equipment/services/equipment.service', () => ({
  listEquipmentByLocation: vi.fn(),
  createEquipment: vi.fn(),
  updateEquipment: vi.fn(),
  deleteEquipment: vi.fn(),
  countEquipmentReadings: vi.fn(),
}));

import {
  listEquipmentByLocation,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  countEquipmentReadings,
} from '@/features/equipment/services/equipment.service';
import { useEquipmentManagement } from '@/features/equipment/hooks/useEquipmentManagement';
import type { Equipment } from '@/shared/types/supabase';

const sample: Equipment = {
  id: 'eq-1',
  location_id: 'loc-1',
  name: 'Refrigerador Lácteos',
  physical_location: 'Cocina',
  code: 'EQ-001',
  min_temp: 0,
  max_temp: 6,
  is_iot_enabled: false,
  iot_device_id: null,
  created_at: '2026-06-30T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockActiveLocationId = 'loc-1';
  mockProfile = {
    id: 'u-1',
    email: 'dev@tempmonitor.local',
    role: 'owner',
    is_platform_admin: false,
    organization_id: 'org-1',
  };
});

describe('useEquipmentManagement · initial state', () => {
  it('starts with dialog closed, no errors, empty list', () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useEquipmentManagement());

    expect(result.current.dialog).toBe('closed');
    expect(result.current.editingEquipment).toBeNull();
    expect(result.current.deletingEquipment).toBeNull();
    expect(result.current.deleteReadingsCount).toBeNull();
    expect(result.current.isLoadingDeleteCount).toBe(false);
    expect(result.current.isMutating).toBe(false);
    expect(result.current.formError).toBeNull();
    expect(result.current.deleteError).toBeNull();
  });

  it('exposes canEdit and activeLocationName for owner', () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useEquipmentManagement());
    expect(result.current.canEdit).toBe(true);
    expect(result.current.activeLocationName).toBe('Casa Central');
  });

  it('clears equipmentList when activeLocationId is null', () => {
    mockActiveLocationId = null;

    const { result } = renderHook(() => useEquipmentManagement());
    expect(result.current.equipmentList).toEqual([]);
    expect(result.current.activeLocationId).toBeNull();
  });
});

describe('useEquipmentManagement · state machine', () => {
  it('openCreate sets dialog to create', () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    const { result } = renderHook(() => useEquipmentManagement());

    act(() => result.current.openCreate());
    expect(result.current.dialog).toBe('create');
    expect(result.current.editingEquipment).toBeNull();
  });

  it('openEdit sets dialog to edit and stores equipment', () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    const { result } = renderHook(() => useEquipmentManagement());

    act(() => result.current.openEdit(sample));
    expect(result.current.dialog).toBe('edit');
    expect(result.current.editingEquipment).toEqual(sample);
  });

  it('openDelete opens dialog and loads readings count', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (countEquipmentReadings as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: 24,
      error: null,
    });

    const { result } = renderHook(() => useEquipmentManagement());

    await act(async () => {
      await result.current.openDelete(sample);
    });

    expect(result.current.dialog).toBe('delete');
    expect(result.current.deletingEquipment).toEqual(sample);
    expect(result.current.isLoadingDeleteCount).toBe(false);
    expect(result.current.deleteReadingsCount).toBe(24);
  });

  it('openDelete sets deleteError when count fails', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (countEquipmentReadings as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: null,
      error: { message: 'boom' },
    });

    const { result } = renderHook(() => useEquipmentManagement());

    await act(async () => {
      await result.current.openDelete(sample);
    });

    expect(result.current.deleteError).toBe('boom');
    expect(result.current.deleteReadingsCount).toBeNull();
  });

  it('closeDialog resets everything', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (countEquipmentReadings as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: 5,
      error: null,
    });

    const { result } = renderHook(() => useEquipmentManagement());

    act(() => result.current.openEdit(sample));
    await act(async () => {
      await result.current.openDelete(sample);
    });

    act(() => result.current.closeDialog());

    expect(result.current.dialog).toBe('closed');
    expect(result.current.editingEquipment).toBeNull();
    expect(result.current.deletingEquipment).toBeNull();
    expect(result.current.deleteReadingsCount).toBeNull();
    expect(result.current.formError).toBeNull();
    expect(result.current.deleteError).toBeNull();
  });
});

describe('useEquipmentManagement · submitCreate', () => {
  it('creates equipment, refreshes and closes dialog on success', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (createEquipment as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useEquipmentManagement());

    await act(async () => {
      await result.current.submitCreate({ name: 'Congelador', minTemp: -20, maxTemp: -10 });
    });

    expect(createEquipment).toHaveBeenCalledWith({
      locationId: 'loc-1',
      name: 'Congelador',
      physicalLocation: null,
      minTemp: -20,
      maxTemp: -10,
    });
    expect(listEquipmentByLocation).toHaveBeenCalledWith('loc-1');
    expect(result.current.dialog).toBe('closed');
  });

  it('sets formError on error', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (createEquipment as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'create failed' },
    });

    const { result } = renderHook(() => useEquipmentManagement());

    act(() => result.current.openCreate());
    await act(async () => {
      await result.current.submitCreate({ name: 'X', minTemp: 0, maxTemp: 5 });
    });

    expect(result.current.formError).toBe('create failed');
    expect(result.current.dialog).toBe('create');
  });

  it('does nothing when there is no active location', async () => {
    mockActiveLocationId = null;

    const { result } = renderHook(() => useEquipmentManagement());

    await act(async () => {
      await result.current.submitCreate({ name: 'X', minTemp: 0, maxTemp: 5 });
    });

    expect(createEquipment).not.toHaveBeenCalled();
  });
});

describe('useEquipmentManagement · submitEdit', () => {
  it('updates equipment, refreshes and closes dialog', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (updateEquipment as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useEquipmentManagement());

    await act(async () => {
      await result.current.submitEdit('eq-1', { name: 'Renombrado' });
    });

    expect(updateEquipment).toHaveBeenCalledWith('eq-1', { name: 'Renombrado' });
    expect(result.current.dialog).toBe('closed');
  });

  it('sets formError on error', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (updateEquipment as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'update failed' },
    });

    const { result } = renderHook(() => useEquipmentManagement());

    act(() => result.current.openEdit(sample));
    await act(async () => {
      await result.current.submitEdit('eq-1', { name: 'X' });
    });

    expect(result.current.formError).toBe('update failed');
    expect(result.current.dialog).toBe('edit');
  });
});

describe('useEquipmentManagement · confirmDelete', () => {
  it('deletes, refreshes, closes dialog', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (deleteEquipment as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useEquipmentManagement());

    await act(async () => {
      await result.current.confirmDelete(sample);
    });

    expect(deleteEquipment).toHaveBeenCalledWith('eq-1');
    expect(listEquipmentByLocation).toHaveBeenCalledWith('loc-1');
    expect(result.current.dialog).toBe('closed');
  });

  it('sets deleteError on error', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (deleteEquipment as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'delete failed' },
    });

    const { result } = renderHook(() => useEquipmentManagement());

    await act(async () => {
      await result.current.openDelete(sample);
    });

    await act(async () => {
      await result.current.confirmDelete(sample);
    });

    expect(result.current.deleteError).toBe('delete failed');
    expect(result.current.dialog).toBe('delete');
  });
});

describe('useEquipmentManagement · RBAC', () => {
  it('canEdit is true for owner', () => {
    mockProfile = { ...mockProfile, role: 'owner' };
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
    const { result } = renderHook(() => useEquipmentManagement());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit is true for admin', () => {
    mockProfile = { ...mockProfile, role: 'admin' };
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
    const { result } = renderHook(() => useEquipmentManagement());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit is true for manager', () => {
    mockProfile = { ...mockProfile, role: 'manager' };
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
    const { result } = renderHook(() => useEquipmentManagement());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit is false for staff (usuario)', () => {
    mockProfile = { ...mockProfile, role: 'staff' };
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
    const { result } = renderHook(() => useEquipmentManagement());
    expect(result.current.canEdit).toBe(false);
  });
});

describe('useEquipmentManagement · errors are isolated', () => {
  it('formError from create does not leak into deleteError', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
    (createEquipment as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'create failed' },
    });

    const { result } = renderHook(() => useEquipmentManagement());

    act(() => result.current.openCreate());
    await act(async () => {
      await result.current.submitCreate({ name: 'X', minTemp: 0, maxTemp: 5 });
    });

    expect(result.current.formError).toBe('create failed');
    expect(result.current.deleteError).toBeNull();
  });

  it('deleteError from openDelete does not leak into formError', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
    (countEquipmentReadings as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: null,
      error: { message: 'count failed' },
    });

    const { result } = renderHook(() => useEquipmentManagement());

    await act(async () => {
      await result.current.openDelete(sample);
    });

    expect(result.current.deleteError).toBe('count failed');
    expect(result.current.formError).toBeNull();
  });
});
