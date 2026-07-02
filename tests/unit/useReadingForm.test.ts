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
    { getState: () => ({ organization: { id: 'org-1' } }) }
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
}));

vi.mock('@/features/staff/services/staff.service', () => ({
  listStaffByLocation: vi.fn(),
}));

vi.mock('@/features/readings/services/readings.service', () => ({
  createReading: vi.fn(),
}));

vi.mock('@/features/incidents/store/incident.store', () => ({
  useIncidentStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) => selector({}),
    {
      getState: () => ({
        fetchOpenIncidents: vi.fn().mockResolvedValue(undefined),
      }),
    }
  ),
}));

vi.mock('@/features/incidents/services/incidents.service', () => ({
  buildIncidentDescription: vi.fn(
    ({ value, minTemp, maxTemp }: { value: number; minTemp: number; maxTemp: number }) =>
      `Temperatura de ${value}°C fuera de rango [${minTemp}, ${maxTemp}]`
  ),
  createIncidentFromReading: vi.fn().mockResolvedValue({ data: { id: 'inc-new' }, error: null }),
}));

import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { listStaffByLocation } from '@/features/staff/services/staff.service';
import { createReading } from '@/features/readings/services/readings.service';
import { useReadingForm } from '@/features/readings/hooks/useReadingForm';
import type { Equipment, Staff } from '@/shared/types/supabase';

const sampleEquipment: Equipment = {
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

const activeStaff: Staff = {
  id: 's-1',
  location_id: 'loc-1',
  name: 'María López',
  role: 'Cocinera',
  active: true,
  created_at: '2026-06-30T00:00:00Z',
  updated_at: '2026-06-30T00:00:00Z',
};

const inactiveStaff: Staff = {
  ...activeStaff,
  id: 's-2',
  name: 'Pedro Inactivo',
  active: false,
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
  (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: [sampleEquipment],
    error: null,
  });
  (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: [activeStaff, inactiveStaff],
    error: null,
  });
  (createReading as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: {
      id: 'r-new',
      equipment_id: 'eq-1',
      value: 3.5,
      reading_type: 'manual',
      sensor_battery: null,
      sensor_signal: null,
      snapshot_min_temp: 0,
      snapshot_max_temp: 6,
      recorded_by_profile: 'u-1',
      recorded_by_staff: null,
      taken_by: null,
      recorded_at: '2026-07-01T08:00:00Z',
    },
    error: null,
  });
});

describe('useReadingForm · initial state', () => {
  it('starts idle with no errors', async () => {
    const { result } = renderHook(() => useReadingForm());

    expect(result.current.status).toBe('idle');
    expect(result.current.serverError).toBeNull();
    expect(result.current.lastReadingValue).toBeNull();
    expect(result.current.lastReadingEquipmentName).toBeNull();
  });

  it('exposes activeLocationName from the org store', async () => {
    const { result } = renderHook(() => useReadingForm());
    expect(result.current.activeLocationId).toBe('loc-1');
    expect(result.current.activeLocationName).toBe('Casa Central');
  });

  it('loads equipment and active staff filtered by active=true', async () => {
    const { result } = renderHook(() => useReadingForm());

    await vi.waitFor(() => {
      expect(result.current.equipmentList).toEqual([sampleEquipment]);
      expect(result.current.staffList).toEqual([activeStaff]);
    });
    expect(result.current.staffList).toHaveLength(1);
  });
});

describe('useReadingForm · fetch errors', () => {
  it('sets equipmentError when equipment fetch fails', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'eq boom' },
    });

    const { result } = renderHook(() => useReadingForm());

    await vi.waitFor(() => {
      expect(result.current.equipmentError).toBe('eq boom');
    });
    expect(result.current.equipmentList).toEqual([]);
  });

  it('sets staffError when staff fetch fails', async () => {
    (listStaffByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'staff boom' },
    });

    const { result } = renderHook(() => useReadingForm());

    await vi.waitFor(() => {
      expect(result.current.staffError).toBe('staff boom');
    });
    expect(result.current.staffList).toEqual([]);
  });

  it('clears lists when activeLocationId is null', () => {
    mockActiveLocationId = null;

    const { result } = renderHook(() => useReadingForm());

    expect(result.current.activeLocationId).toBeNull();
    expect(result.current.equipmentList).toEqual([]);
    expect(result.current.staffList).toEqual([]);
  });
});

describe('useReadingForm · submit', () => {
  it('calls createReading with mapped fields and goes to success', async () => {
    const { result } = renderHook(() => useReadingForm());

    await vi.waitFor(() => {
      expect(result.current.equipmentList).toHaveLength(1);
    });

    await act(async () => {
      await result.current.submit({
        equipmentId: 'eq-1',
        value: 3.5,
        recordedByStaff: 's-1',
        takenBy: null,
      });
    });

    expect(createReading).toHaveBeenCalledWith({
      equipmentId: 'eq-1',
      value: 3.5,
      recordedByProfile: 'u-1',
      recordedByStaff: 's-1',
      takenBy: null,
      snapshotMin: 0,
      snapshotMax: 6,
    });
    expect(result.current.status).toBe('success');
    expect(result.current.lastReadingValue).toBe(3.5);
    expect(result.current.lastReadingEquipmentName).toBe('Refrigerador Lácteos');
  });

  it('passes null recordedByProfile when profile is null', async () => {
    mockProfile = null;

    const { result } = renderHook(() => useReadingForm());

    await vi.waitFor(() => {
      expect(result.current.equipmentList).toHaveLength(1);
    });

    await act(async () => {
      await result.current.submit({
        equipmentId: 'eq-1',
        value: 3.5,
        recordedByStaff: null,
        takenBy: null,
      });
    });

    expect(createReading).toHaveBeenCalledWith(
      expect.objectContaining({ recordedByProfile: null })
    );
  });

  it('forwards external takenBy when provided', async () => {
    const { result } = renderHook(() => useReadingForm());

    await vi.waitFor(() => {
      expect(result.current.equipmentList).toHaveLength(1);
    });

    await act(async () => {
      await result.current.submit({
        equipmentId: 'eq-1',
        value: 3.5,
        recordedByStaff: null,
        takenBy: 'Inspector',
      });
    });

    expect(createReading).toHaveBeenCalledWith(
      expect.objectContaining({ takenBy: 'Inspector' })
    );
  });

  it('goes to error status when createReading fails', async () => {
    (createReading as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'insert failed' },
    });

    const { result } = renderHook(() => useReadingForm());

    await vi.waitFor(() => {
      expect(result.current.equipmentList).toHaveLength(1);
    });

    await act(async () => {
      await result.current.submit({
        equipmentId: 'eq-1',
        value: 3.5,
        recordedByStaff: null,
        takenBy: null,
      });
    });

    expect(result.current.status).toBe('error');
    expect(result.current.serverError).toBe('insert failed');
  });

  it('does not call createReading when there is no active location', async () => {
    mockActiveLocationId = null;

    const { result } = renderHook(() => useReadingForm());

    await act(async () => {
      await result.current.submit({
        equipmentId: 'eq-1',
        value: 3.5,
        recordedByStaff: null,
        takenBy: null,
      });
    });

    expect(createReading).not.toHaveBeenCalled();
  });

  it('resets to idle when resetStatus is called', async () => {
    const { result } = renderHook(() => useReadingForm());

    await vi.waitFor(() => {
      expect(result.current.equipmentList).toHaveLength(1);
    });

    await act(async () => {
      await result.current.submit({
        equipmentId: 'eq-1',
        value: 3.5,
        recordedByStaff: null,
        takenBy: null,
      });
    });
    expect(result.current.status).toBe('success');

    act(() => result.current.resetStatus());

    expect(result.current.status).toBe('idle');
    expect(result.current.serverError).toBeNull();
    expect(result.current.lastReadingValue).toBeNull();
    expect(result.current.lastReadingEquipmentName).toBeNull();
  });
});

describe('useReadingForm · equipment resolution', () => {
  it('returns error when equipmentId does not match any equipment', async () => {
    const { result } = renderHook(() => useReadingForm());

    await vi.waitFor(() => {
      expect(result.current.equipmentList).toHaveLength(1);
    });

    await act(async () => {
      await result.current.submit({
        equipmentId: 'unknown-id',
        value: 3.5,
        recordedByStaff: null,
        takenBy: null,
      });
    });

    expect(result.current.status).toBe('error');
    expect(result.current.serverError).toBe('Equipo no encontrado');
    expect(createReading).not.toHaveBeenCalled();
  });
});