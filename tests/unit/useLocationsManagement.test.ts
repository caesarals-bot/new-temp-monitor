import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

let mockOrganization: Record<string, unknown> | null = {
  id: 'org-1',
  name: 'Empresa Demo',
  plan_type: 'pro',
  max_locations: 2,
};

let mockLocations: Array<Record<string, unknown>> = [
  { id: 'loc-1', organization_id: 'org-1', name: 'Casa Central', address: 'Av. Demo 123' },
  { id: 'loc-2', organization_id: 'org-1', name: 'Sucursal Norte', address: null },
];

let mockActiveLocationId: string | null = 'loc-1';

const fetchLocationsMock = vi.fn().mockResolvedValue(undefined);
const setActiveLocationMock = vi.fn();

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        organization: mockOrganization,
        locations: mockLocations,
        activeLocationId: mockActiveLocationId,
        setActiveLocation: setActiveLocationMock,
        fetchLocations: fetchLocationsMock,
      }),
    {
      getState: () => ({
        setActiveLocation: setActiveLocationMock,
      }),
    }
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

vi.mock('@/features/locations/services/locations.service', () => ({
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn(),
  countLocationDependencies: vi.fn(),
}));

vi.mock('@/features/equipment/services/equipment.service', () => ({
  listEquipmentByLocation: vi.fn(),
}));

import {
  createLocation,
  updateLocation,
  deleteLocation,
  countLocationDependencies,
} from '@/features/locations/services/locations.service';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { useLocationsManagement } from '@/features/locations/hooks/useLocationsManagement';
import type { Location } from '@/shared/types/supabase';

const sampleLocation: Location = {
  id: 'loc-1',
  organization_id: 'org-1',
  name: 'Casa Central',
  address: 'Av. Demo 123',
  created_at: '2026-06-30T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockOrganization = {
    id: 'org-1',
    name: 'Empresa Demo',
    plan_type: 'pro',
    max_locations: 2,
  };
  mockLocations = [
    { id: 'loc-1', organization_id: 'org-1', name: 'Casa Central', address: 'Av. Demo 123' },
    { id: 'loc-2', organization_id: 'org-1', name: 'Sucursal Norte', address: null },
  ];
  mockActiveLocationId = 'loc-1';
  mockProfile = {
    id: 'u-1',
    email: 'dev@tempmonitor.local',
    role: 'owner',
    is_platform_admin: false,
    organization_id: 'org-1',
  };
  (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: [],
    error: null,
  });
});

describe('useLocationsManagement · initial state', () => {
  it('starts with dialog closed and no errors', () => {
    const { result } = renderHook(() => useLocationsManagement());

    expect(result.current.dialog).toBe('closed');
    expect(result.current.editingLocation).toBeNull();
    expect(result.current.deletingLocation).toBeNull();
    expect(result.current.dependencies).toBeNull();
    expect(result.current.isLoadingDependencies).toBe(false);
    expect(result.current.isMutating).toBe(false);
    expect(result.current.formError).toBeNull();
    expect(result.current.deleteError).toBeNull();
  });

  it('exposes derived values from stores', () => {
    const { result } = renderHook(() => useLocationsManagement());

    expect(result.current.canEdit).toBe(true);
    expect(result.current.orgId).toBe('org-1');
    expect(result.current.maxLocations).toBe(2);
    expect(result.current.planType).toBe('pro');
    expect(result.current.atLimit).toBe(true);
  });
});

describe('useLocationsManagement · state machine', () => {
  it('openCreate sets dialog to create and clears formError', () => {
    const { result } = renderHook(() => useLocationsManagement());

    act(() => result.current.openCreate());
    expect(result.current.dialog).toBe('create');
    expect(result.current.editingLocation).toBeNull();
  });

  it('openEdit sets dialog to edit and stores the location', () => {
    const { result } = renderHook(() => useLocationsManagement());

    act(() => result.current.openEdit(sampleLocation));
    expect(result.current.dialog).toBe('edit');
    expect(result.current.editingLocation).toEqual(sampleLocation);
  });

  it('openDelete opens delete dialog and starts loading dependencies', async () => {
    (countLocationDependencies as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { equipment: 0, staff: 0, readings: 0 },
      error: null,
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.openDelete(sampleLocation);
    });

    expect(result.current.dialog).toBe('delete');
    expect(result.current.deletingLocation).toEqual(sampleLocation);
    expect(result.current.isLoadingDependencies).toBe(false);
    expect(result.current.dependencies).toEqual({ equipment: 0, staff: 0, readings: 0 });
  });

  it('openDelete sets deleteError when count fails', async () => {
    (countLocationDependencies as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'boom' },
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.openDelete(sampleLocation);
    });

    expect(result.current.deleteError).toBe('boom');
    expect(result.current.dependencies).toBeNull();
  });

  it('closeDialog resets everything', async () => {
    (countLocationDependencies as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { equipment: 0, staff: 0, readings: 0 },
      error: null,
    });

    const { result } = renderHook(() => useLocationsManagement());

    act(() => result.current.openEdit(sampleLocation));
    await act(async () => {
      await result.current.openDelete(sampleLocation);
    });

    act(() => result.current.closeDialog());

    expect(result.current.dialog).toBe('closed');
    expect(result.current.editingLocation).toBeNull();
    expect(result.current.deletingLocation).toBeNull();
    expect(result.current.dependencies).toBeNull();
    expect(result.current.formError).toBeNull();
    expect(result.current.deleteError).toBeNull();
  });
});

describe('useLocationsManagement · submitCreate', () => {
  it('creates location, refreshes and closes dialog on success', async () => {
    (createLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: 'loc-3', name: 'Nueva', address: null, organization_id: 'org-1' },
      error: null,
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.submitCreate({ name: 'Nueva', address: undefined });
    });

    expect(createLocation).toHaveBeenCalledWith({
      organizationId: 'org-1',
      name: 'Nueva',
      address: null,
    });
    expect(fetchLocationsMock).toHaveBeenCalledWith('org-1');
    expect(result.current.dialog).toBe('closed');
    expect(result.current.formError).toBeNull();
  });

  it('sets formError and keeps dialog open on error', async () => {
    (createLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'Has alcanzado el límite de 2 sede(s) para tu plan pro' },
    });

    const { result } = renderHook(() => useLocationsManagement());

    act(() => result.current.openCreate());

    await act(async () => {
      await result.current.submitCreate({ name: 'Tercera', address: undefined });
    });

    expect(result.current.formError).toBe('Has alcanzado el límite de 2 sede(s) para tu plan pro');
    expect(result.current.dialog).toBe('create');
    expect(fetchLocationsMock).not.toHaveBeenCalled();
  });

  it('sets activeLocationId to the new location when no active location was set', async () => {
    mockActiveLocationId = null;
    (createLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: 'loc-3', name: 'Nueva', address: null, organization_id: 'org-1' },
      error: null,
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.submitCreate({ name: 'Nueva', address: undefined });
    });

    expect(setActiveLocationMock).toHaveBeenCalledWith('loc-3');
  });

  it('does not change activeLocationId when one was already set', async () => {
    (createLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: 'loc-3', name: 'Nueva', address: null, organization_id: 'org-1' },
      error: null,
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.submitCreate({ name: 'Nueva', address: undefined });
    });

    expect(setActiveLocationMock).not.toHaveBeenCalled();
  });
});

describe('useLocationsManagement · submitEdit', () => {
  it('updates location, refreshes and closes dialog on success', async () => {
    (updateLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { ...sampleLocation, name: 'Renombrada' },
      error: null,
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.submitEdit('loc-1', { name: 'Renombrada', address: null });
    });

    expect(updateLocation).toHaveBeenCalledWith('loc-1', {
      name: 'Renombrada',
      address: null,
    });
    expect(fetchLocationsMock).toHaveBeenCalledWith('org-1');
    expect(result.current.dialog).toBe('closed');
  });

  it('sets formError on error', async () => {
    (updateLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'update failed' },
    });

    const { result } = renderHook(() => useLocationsManagement());

    act(() => result.current.openEdit(sampleLocation));

    await act(async () => {
      await result.current.submitEdit('loc-1', { name: 'X' });
    });

    expect(result.current.formError).toBe('update failed');
    expect(result.current.dialog).toBe('edit');
  });
});

describe('useLocationsManagement · confirmDelete', () => {
  it('deletes, refreshes, clears active location if it matched, closes dialog', async () => {
    (deleteLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.confirmDelete(sampleLocation);
    });

    expect(deleteLocation).toHaveBeenCalledWith('loc-1');
    expect(setActiveLocationMock).toHaveBeenCalledWith(null);
    expect(fetchLocationsMock).toHaveBeenCalledWith('org-1');
    expect(result.current.dialog).toBe('closed');
  });

  it('does not clear activeLocationId when deleting a non-active location', async () => {
    (deleteLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const other: Location = { ...sampleLocation, id: 'loc-2', name: 'Sucursal Norte' };

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.confirmDelete(other);
    });

    expect(setActiveLocationMock).not.toHaveBeenCalled();
  });

  it('sets deleteError on error', async () => {
    (deleteLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'fk violation' },
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.openDelete(sampleLocation);
    });

    await act(async () => {
      await result.current.confirmDelete(sampleLocation);
    });

    expect(result.current.deleteError).toBe('fk violation');
    expect(result.current.dialog).toBe('delete');
  });
});

describe('useLocationsManagement · RBAC', () => {
  it('canEdit is false for staff role', () => {
    mockProfile = { ...mockProfile, role: 'staff' };
    const { result } = renderHook(() => useLocationsManagement());
    expect(result.current.canEdit).toBe(false);
  });

  it('canEdit is false for manager role', () => {
    mockProfile = { ...mockProfile, role: 'manager' };
    const { result } = renderHook(() => useLocationsManagement());
    expect(result.current.canEdit).toBe(false);
  });

  it('canEdit is true for admin role', () => {
    mockProfile = { ...mockProfile, role: 'admin' };
    const { result } = renderHook(() => useLocationsManagement());
    expect(result.current.canEdit).toBe(true);
  });
});

describe('useLocationsManagement · errors are isolated', () => {
  it('formError from create does not leak into deleteError', async () => {
    (createLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'create failed' },
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.submitCreate({ name: 'X' });
    });

    expect(result.current.formError).toBe('create failed');
    expect(result.current.deleteError).toBeNull();
  });

  it('deleteError from openDelete does not leak into formError', async () => {
    (countLocationDependencies as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'count failed' },
    });

    const { result } = renderHook(() => useLocationsManagement());

    await act(async () => {
      await result.current.openDelete(sampleLocation);
    });

    expect(result.current.deleteError).toBe('count failed');
    expect(result.current.formError).toBeNull();
  });
});
