import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

let mockActiveLocationId: string | null = 'loc-1';

const fetchLocationsMock = vi.fn().mockResolvedValue(undefined);
const setActiveLocationMock = vi.fn();

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
        setActiveLocation: setActiveLocationMock,
        fetchLocations: fetchLocationsMock,
      }),
    {
      getState: () => ({}),
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

vi.mock('@/features/staff/services/staff.service', () => ({
  listStaffByLocation: vi.fn(),
  createStaff: vi.fn(),
  updateStaff: vi.fn(),
  setStaffActive: vi.fn(),
  countStaffReadings: vi.fn(),
}));

import {
  listStaffByLocation,
  createStaff,
  updateStaff,
  setStaffActive,
  countStaffReadings,
} from '@/features/staff/services/staff.service';
import { useStaffManagement } from '@/features/staff/hooks/useStaffManagement';
import type { Staff } from '@/shared/types/supabase';

const sampleStaff: Staff = {
  id: 'staff-1',
  location_id: 'loc-1',
  name: 'María López',
  role: 'Cocinera',
  active: true,
  created_at: '2026-06-30T00:00:00Z',
  updated_at: '2026-06-30T00:00:00Z',
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
  (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: [],
    error: null,
  });
  (countStaffReadings as ReturnType<typeof vi.fn>).mockResolvedValue({
    count: 0,
    error: null,
  });
});

describe('useStaffManagement · initial state', () => {
  it('starts with dialog closed, no errors, empty staffList', () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    expect(result.current.dialog).toBe('closed');
    expect(result.current.editingStaff).toBeNull();
    expect(result.current.togglingStaff).toBeNull();
    expect(result.current.toggleReadingsCount).toBeNull();
    expect(result.current.isLoadingToggleCount).toBe(false);
    expect(result.current.isMutating).toBe(false);
    expect(result.current.formError).toBeNull();
    expect(result.current.toggleError).toBeNull();
  });

  it('exposes canEdit true for owner', () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());
    expect(result.current.canEdit).toBe(true);
    expect(result.current.activeLocationId).toBe('loc-1');
    expect(result.current.activeLocationName).toBe('Casa Central');
  });

  it('fetches staff list on mount when activeLocationId is set', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [sampleStaff],
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    await act(async () => {
      await Promise.resolve();
    });

    expect(listStaffByLocation).toHaveBeenCalledWith('loc-1');
    expect(result.current.staffList).toEqual([sampleStaff]);
  });

  it('clears staffList when activeLocationId is null', () => {
    mockActiveLocationId = null;

    const { result } = renderHook(() => useStaffManagement());

    expect(result.current.staffList).toEqual([]);
    expect(result.current.activeLocationId).toBeNull();
    expect(result.current.activeLocationName).toBeNull();
  });
});

describe('useStaffManagement · state machine', () => {
  it('openCreate sets dialog to create and clears formError', () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    act(() => result.current.openCreate());
    expect(result.current.dialog).toBe('create');
    expect(result.current.editingStaff).toBeNull();
  });

  it('openEdit sets dialog to edit and stores the staff', () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    act(() => result.current.openEdit(sampleStaff));
    expect(result.current.dialog).toBe('edit');
    expect(result.current.editingStaff).toEqual(sampleStaff);
  });

  it('openToggle opens dialog and loads readings count', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (countStaffReadings as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: 12,
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    await act(async () => {
      await result.current.openToggle(sampleStaff);
    });

    expect(result.current.dialog).toBe('toggle');
    expect(result.current.togglingStaff).toEqual(sampleStaff);
    expect(result.current.isLoadingToggleCount).toBe(false);
    expect(result.current.toggleReadingsCount).toBe(12);
  });

  it('openToggle sets toggleError when count fails', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (countStaffReadings as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: null,
      error: { message: 'boom' },
    });

    const { result } = renderHook(() => useStaffManagement());

    await act(async () => {
      await result.current.openToggle(sampleStaff);
    });

    expect(result.current.toggleError).toBe('boom');
    expect(result.current.toggleReadingsCount).toBeNull();
  });

  it('closeDialog resets everything', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (countStaffReadings as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: 5,
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    act(() => result.current.openEdit(sampleStaff));
    await act(async () => {
      await result.current.openToggle(sampleStaff);
    });

    act(() => result.current.closeDialog());

    expect(result.current.dialog).toBe('closed');
    expect(result.current.editingStaff).toBeNull();
    expect(result.current.togglingStaff).toBeNull();
    expect(result.current.toggleReadingsCount).toBeNull();
    expect(result.current.formError).toBeNull();
    expect(result.current.toggleError).toBeNull();
  });
});

describe('useStaffManagement · submitCreate', () => {
  it('creates staff, refreshes and closes dialog on success', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (createStaff as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    await act(async () => {
      await result.current.submitCreate({ name: 'Pedro', role: 'Auxiliar' });
    });

    expect(createStaff).toHaveBeenCalledWith({
      locationId: 'loc-1',
      name: 'Pedro',
      role: 'Auxiliar',
    });
    expect(listStaffByLocation).toHaveBeenCalledWith('loc-1');
    expect(result.current.dialog).toBe('closed');
  });

  it('sets formError and keeps dialog open on error', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (createStaff as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'create failed' },
    });

    const { result } = renderHook(() => useStaffManagement());

    act(() => result.current.openCreate());

    await act(async () => {
      await result.current.submitCreate({ name: 'X', role: 'Y' });
    });

    expect(result.current.formError).toBe('create failed');
    expect(result.current.dialog).toBe('create');
  });

  it('does nothing when there is no active location', async () => {
    mockActiveLocationId = null;

    const { result } = renderHook(() => useStaffManagement());

    await act(async () => {
      await result.current.submitCreate({ name: 'X', role: 'Y' });
    });

    expect(createStaff).not.toHaveBeenCalled();
  });
});

describe('useStaffManagement · submitEdit', () => {
  it('updates staff, refreshes and closes dialog on success', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (updateStaff as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    await act(async () => {
      await result.current.submitEdit('staff-1', { name: 'María L.', role: 'Cocinera' });
    });

    expect(updateStaff).toHaveBeenCalledWith('staff-1', {
      name: 'María L.',
      role: 'Cocinera',
    });
    expect(listStaffByLocation).toHaveBeenCalledWith('loc-1');
    expect(result.current.dialog).toBe('closed');
  });

  it('sets formError on error', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (updateStaff as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'update failed' },
    });

    const { result } = renderHook(() => useStaffManagement());

    act(() => result.current.openEdit(sampleStaff));

    await act(async () => {
      await result.current.submitEdit('staff-1', { name: 'X' });
    });

    expect(result.current.formError).toBe('update failed');
    expect(result.current.dialog).toBe('edit');
  });
});

describe('useStaffManagement · confirmToggle', () => {
  it('toggles to inactive, refreshes, closes dialog', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (setStaffActive as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    await act(async () => {
      await result.current.confirmToggle(sampleStaff);
    });

    expect(setStaffActive).toHaveBeenCalledWith('staff-1', false);
    expect(listStaffByLocation).toHaveBeenCalledWith('loc-1');
    expect(result.current.dialog).toBe('closed');
  });

  it('toggles to active when staff is inactive', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (setStaffActive as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useStaffManagement());

    const inactive: Staff = { ...sampleStaff, active: false };

    await act(async () => {
      await result.current.confirmToggle(inactive);
    });

    expect(setStaffActive).toHaveBeenCalledWith('staff-1', true);
  });

  it('sets toggleError on error', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (setStaffActive as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'toggle failed' },
    });

    const { result } = renderHook(() => useStaffManagement());

    await act(async () => {
      await result.current.openToggle(sampleStaff);
    });

    await act(async () => {
      await result.current.confirmToggle(sampleStaff);
    });

    expect(result.current.toggleError).toBe('toggle failed');
    expect(result.current.dialog).toBe('toggle');
  });
});

describe('useStaffManagement · RBAC', () => {
  it('canEdit is true for owner', () => {
    mockProfile = { ...mockProfile, role: 'owner' };
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    const { result } = renderHook(() => useStaffManagement());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit is true for admin', () => {
    mockProfile = { ...mockProfile, role: 'admin' };
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    const { result } = renderHook(() => useStaffManagement());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit is true for manager', () => {
    mockProfile = { ...mockProfile, role: 'manager' };
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    const { result } = renderHook(() => useStaffManagement());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit is false for staff (usuario)', () => {
    mockProfile = { ...mockProfile, role: 'staff' };
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    const { result } = renderHook(() => useStaffManagement());
    expect(result.current.canEdit).toBe(false);
  });
});

describe('useStaffManagement · errors are isolated', () => {
  it('formError from create does not leak into toggleError', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (createStaff as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'create failed' },
    });

    const { result } = renderHook(() => useStaffManagement());

    act(() => result.current.openCreate());
    await act(async () => {
      await result.current.submitCreate({ name: 'X', role: 'Y' });
    });

    expect(result.current.formError).toBe('create failed');
    expect(result.current.toggleError).toBeNull();
  });

  it('toggleError from openToggle does not leak into formError', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (countStaffReadings as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: null,
      error: { message: 'count failed' },
    });

    const { result } = renderHook(() => useStaffManagement());

    await act(async () => {
      await result.current.openToggle(sampleStaff);
    });

    expect(result.current.toggleError).toBe('count failed');
    expect(result.current.formError).toBeNull();
  });
});
