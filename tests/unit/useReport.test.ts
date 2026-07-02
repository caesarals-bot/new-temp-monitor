import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const { mocks } = vi.hoisted(() => {
  return {
    mocks: {
      listReadingsReport: vi.fn(),
      listIncidentsForReport: vi.fn(),
      listEquipmentByLocation: vi.fn(),
    },
  };
});

let mockOrganization: { id: string; name: string; business_type: string } | null = {
  id: 'org-1',
  name: 'Empresa Demo',
  business_type: 'restaurant',
};

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ organization: mockOrganization }),
}));

vi.mock('@/features/reports/services/reports.service', () => ({
  listReadingsReport: mocks.listReadingsReport,
  listIncidentsForReport: mocks.listIncidentsForReport,
}));

vi.mock('@/features/equipment/services/equipment.service', () => ({
  listEquipmentByLocation: mocks.listEquipmentByLocation,
}));

import { useReport } from '@/features/reports/hooks/useReport';
import type { TemperatureReading } from '@/shared/types/supabase';
import type { IncidentWithReading } from '@/features/incidents/types';

const baseFilters = {
  from: '2026-06-01T00:00:00Z',
  to: '2026-07-01T00:00:00Z',
  readingType: 'all' as const,
  onlyWithIncidents: false,
};

function makeReading(
  id: string,
  equipmentId: string,
  value: number,
  recordedAt: string,
  snapshotMin: number | null = 0,
  snapshotMax: number | null = 8
): TemperatureReading {
  return {
    id,
    equipment_id: equipmentId,
    value,
    reading_type: 'manual',
    sensor_battery: null,
    sensor_signal: null,
    snapshot_min_temp: snapshotMin,
    snapshot_max_temp: snapshotMax,
    recorded_by_profile: 'u-1',
    recorded_by_staff: null,
    taken_by: null,
    recorded_at: recordedAt,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockOrganization = { id: 'org-1', name: 'Empresa Demo', business_type: 'restaurant' };
  mocks.listReadingsReport.mockResolvedValue({ data: [], error: null });
  mocks.listIncidentsForReport.mockResolvedValue({ data: [], error: null });
  mocks.listEquipmentByLocation.mockResolvedValue({ data: [], error: null });
});

describe('useReport · fetching', () => {
  it('does not fetch when organization is null', async () => {
    mockOrganization = null;
    renderHook(() => useReport());
    await new Promise((r) => setTimeout(r, 10));
    expect(mocks.listReadingsReport).not.toHaveBeenCalled();
  });

  it('fetches with orgId and default filters on mount', async () => {
    renderHook(() => useReport());
    await waitFor(() => {
      expect(mocks.listReadingsReport).toHaveBeenCalled();
    });
    expect(mocks.listReadingsReport).toHaveBeenCalledWith({
      organizationId: 'org-1',
      filters: expect.objectContaining({ readingType: 'all', onlyWithIncidents: false }),
    });
  });

  it('surfaces loadError when readings fetch fails', async () => {
    mocks.listReadingsReport.mockResolvedValueOnce({
      data: null,
      error: { message: 'boom' },
    });

    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(result.current.loadError).toBe('boom');
    });
  });

  it('surfaces loadError when incidents fetch fails', async () => {
    mocks.listIncidentsForReport.mockResolvedValueOnce({
      data: null,
      error: { message: 'inc boom' },
    });

    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(result.current.loadError).toBe('inc boom');
    });
  });

  it('refetches when filters change', async () => {
    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(mocks.listReadingsReport).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.setFilter('readingType', 'manual');
    });

    await waitFor(() => {
      expect(mocks.listReadingsReport).toHaveBeenCalledTimes(2);
    });
    expect(mocks.listReadingsReport).toHaveBeenLastCalledWith({
      organizationId: 'org-1',
      filters: expect.objectContaining({ readingType: 'manual' }),
    });
  });

  it('resetFilters restores default range', async () => {
    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(mocks.listReadingsReport).toHaveBeenCalled();
    });

    act(() => {
      result.current.setFilter('readingType', 'iot');
      result.current.resetFilters();
    });

    await waitFor(() => {
      const last = mocks.listReadingsReport.mock.calls.at(-1)?.[0];
      expect(last?.filters.readingType).toBe('all');
    });
  });
});

describe('useReport · pagination', () => {
  it('pageReadings returns up to 50 per page', async () => {
    const readings = Array.from({ length: 120 }, (_, i) =>
      makeReading(`r-${i}`, 'eq-1', 4, `2026-06-${String((i % 30) + 1).padStart(2, '0')}T10:00:00Z`)
    );
    mocks.listReadingsReport.mockResolvedValueOnce({ data: readings, error: null });

    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(result.current.readings.length).toBe(120);
    });

    expect(result.current.totalPages).toBe(3);
    expect(result.current.pageReadings).toHaveLength(50);

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.currentPage).toBe(2);
    expect(result.current.pageReadings).toHaveLength(50);

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.pageReadings).toHaveLength(20);
  });

  it('setPage clamps negative values to 1', async () => {
    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(mocks.listReadingsReport).toHaveBeenCalled();
    });

    act(() => {
      result.current.setPage(-5);
    });
    expect(result.current.currentPage).toBe(1);
  });

  it('resets to page 1 on refresh', async () => {
    const readings = Array.from({ length: 60 }, (_, i) =>
      makeReading(`r-${i}`, 'eq-1', 4, `2026-06-${String((i % 30) + 1).padStart(2, '0')}T10:00:00Z`)
    );
    mocks.listReadingsReport.mockResolvedValueOnce({ data: readings, error: null });

    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(result.current.readings.length).toBe(60);
    });

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.currentPage).toBe(2);

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.currentPage).toBe(1);
  });
});

describe('useReport · compliance', () => {
  it('computes 100% when all readings are in range', async () => {
    const readings = [
      makeReading('r-1', 'eq-1', 4, '2026-06-01T10:00:00Z', 0, 8),
      makeReading('r-2', 'eq-1', 5, '2026-06-02T10:00:00Z', 0, 8),
    ];
    mocks.listReadingsReport.mockResolvedValueOnce({ data: readings, error: null });

    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(result.current.compliance.totalReadings).toBe(2);
    });

    expect(result.current.compliance.inRangeReadings).toBe(2);
    expect(result.current.compliance.percent).toBe(100);
  });

  it('computes mixed compliance with snapshot ranges', async () => {
    const readings = [
      makeReading('r-1', 'eq-1', 4, '2026-06-01T10:00:00Z', 0, 8),
      makeReading('r-2', 'eq-1', 12, '2026-06-02T10:00:00Z', 0, 8),
      makeReading('r-3', 'eq-1', 6, '2026-06-03T10:00:00Z', 0, 8),
      makeReading('r-4', 'eq-1', -25, '2026-06-04T10:00:00Z', -22, -15),
    ];
    mocks.listReadingsReport.mockResolvedValueOnce({ data: readings, error: null });

    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(result.current.compliance.totalReadings).toBe(4);
    });

    expect(result.current.compliance.inRangeReadings).toBe(2);
    expect(result.current.compliance.percent).toBe(50);
  });

  it('returns empty byEquipment when no equipment list loaded', async () => {
    const readings = [makeReading('r-1', 'eq-1', 4, '2026-06-01T10:00:00Z')];
    mocks.listReadingsReport.mockResolvedValueOnce({ data: readings, error: null });

    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(result.current.compliance.totalReadings).toBe(1);
    });
    expect(result.current.compliance.byEquipment).toEqual([]);
  });
});

describe('useReport · onlyWithIncidents', () => {
  it('filters readings to those linked to incidents', async () => {
    const readings = [
      makeReading('r-1', 'eq-1', 4, '2026-06-01T10:00:00Z'),
      makeReading('r-2', 'eq-1', 12, '2026-06-02T10:00:00Z'),
      makeReading('r-3', 'eq-1', 5, '2026-06-03T10:00:00Z'),
    ];
    const incidents: IncidentWithReading[] = [
      {
        id: 'inc-1',
        reading_id: 'r-2',
        status: 'open',
        description: 'd',
        action_taken: null,
        resolved_by: null,
        resolved_at: null,
        created_at: '2026-06-02T10:05:00Z',
        reading: {
          id: 'r-2',
          value: 12,
          recorded_at: '2026-06-02T10:00:00Z',
          equipment: {
            id: 'eq-1',
            name: 'Eq',
            min_temp: 0,
            max_temp: 8,
            location_id: 'loc-1',
          },
        },
      },
    ];
    mocks.listReadingsReport.mockResolvedValue({ data: readings, error: null });
    mocks.listIncidentsForReport.mockResolvedValue({ data: incidents, error: null });

    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(result.current.readings.length).toBe(3);
    });

    act(() => {
      result.current.setFilter('onlyWithIncidents', true);
    });

    await waitFor(() => {
      expect(result.current.readings.length).toBe(1);
    });
    expect(result.current.readings[0]?.id).toBe('r-2');
    expect(result.current.incidentSummary.total).toBe(1);
    expect(result.current.incidentSummary.open).toBe(1);
  });
});

describe('useReport · selected equipment', () => {
  it('returns null when no equipment selected', async () => {
    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(mocks.listReadingsReport).toHaveBeenCalled();
    });
    expect(result.current.selectedEquipment).toBeNull();
  });

  it('returns equipment from list when id matches', async () => {
    mocks.listEquipmentByLocation.mockResolvedValue({
      data: [
        {
          id: 'eq-1',
          location_id: 'loc-1',
          name: 'Eq',
          physical_location: null,
          code: null,
          min_temp: 0,
          max_temp: 8,
          is_iot_enabled: false,
          iot_device_id: null,
          created_at: '2026-06-01T00:00:00Z',
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(mocks.listReadingsReport).toHaveBeenCalled();
    });

    act(() => {
      result.current.setFilters({ ...baseFilters, locationId: 'loc-1' });
    });

    await waitFor(() => {
      expect(mocks.listEquipmentByLocation).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current.equipmentList.length).toBe(1);
    });

    act(() => {
      result.current.setSelectedEquipmentId('eq-1');
    });

    expect(result.current.selectedEquipment?.name).toBe('Eq');
  });

  it('keeps selection across refresh', async () => {
    const { result } = renderHook(() => useReport());
    await waitFor(() => {
      expect(mocks.listReadingsReport).toHaveBeenCalled();
    });

    act(() => {
      result.current.setSelectedEquipmentId('eq-1');
    });
    expect(result.current.selectedEquipmentId).toBe('eq-1');

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.selectedEquipmentId).toBe('eq-1');
  });
});
