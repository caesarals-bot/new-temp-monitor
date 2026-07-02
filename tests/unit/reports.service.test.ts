import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listReadingsReport,
  listIncidentsForReport,
} from '@/features/reports/services/reports.service';
import type { TemperatureReading } from '@/shared/types/supabase';
import type { IncidentWithReading } from '@/features/incidents/types';

vi.mock('@/shared/lib/supabase', () => {
  const make = () => {
    const c: Record<string, ReturnType<typeof vi.fn>> = {};
    c.select = vi.fn(() => c);
    c.eq = vi.fn(() => c);
    c.in = vi.fn(() => c);
    c.gte = vi.fn(() => c);
    c.lte = vi.fn(() => c);
    c.order = vi.fn(() => c);
    c.then = (resolve: (v: unknown) => void) => resolve({ data: null, error: null });
    return c;
  };
  return { supabase: { from: vi.fn(() => make()) } };
});

vi.mock('@/features/equipment/services/equipment.service', () => ({
  listEquipmentByLocation: vi.fn(),
}));

vi.mock('@/features/incidents/services/incidents.service', () => ({
  listIncidents: vi.fn(),
}));

import { supabase } from '@/shared/lib/supabase';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { listIncidents } from '@/features/incidents/services/incidents.service';

const baseFilters = {
  from: '2026-06-01T00:00:00Z',
  to: '2026-07-01T00:00:00Z',
  readingType: 'all' as const,
  onlyWithIncidents: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('reports.service · listReadingsReport', () => {
  const sampleReading: TemperatureReading = {
    id: 'r-1',
    equipment_id: 'eq-1',
    value: 4.5,
    reading_type: 'manual',
    sensor_battery: null,
    sensor_signal: null,
    snapshot_min_temp: 2,
    snapshot_max_temp: 8,
    recorded_by_profile: 'u-1',
    recorded_by_staff: null,
    taken_by: null,
    recorded_at: '2026-06-15T10:00:00Z',
  };

  it('returns empty list when location has no equipment', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { data, error } = await listReadingsReport({
      organizationId: 'org-1',
      filters: { ...baseFilters, locationId: 'loc-1' },
    });

    expect(listEquipmentByLocation).toHaveBeenCalledWith('loc-1');
    expect(supabase.from).not.toHaveBeenCalled();
    expect(data).toEqual([]);
    expect(error).toBeNull();
  });

  it('queries with date range, org filter and IN by equipment', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [{ id: 'eq-1' }, { id: 'eq-2' }],
      error: null,
    });

    const calls: Record<string, unknown> = {};
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn((col: string, val: string) => {
      calls[`eq:${col}`] = val;
      return chain;
    });
    chain.in = vi.fn((col: string, vals: string[]) => {
      calls.in = [col, vals];
      return chain;
    });
    chain.gte = vi.fn((col: string, val: string) => {
      calls.gte = [col, val];
      return chain;
    });
    chain.lte = vi.fn((col: string, val: string) => {
      calls.lte = [col, val];
      return chain;
    });
    chain.order = vi.fn((col: string, opts: { ascending: boolean }) => {
      calls.order = [col, opts];
      return chain;
    });
    Object.defineProperty(chain, 'then', {
      get() {
        return (resolve: (v: unknown) => void) => resolve({ data: [sampleReading], error: null });
      },
    });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    const { data, error } = await listReadingsReport({
      organizationId: 'org-1',
      filters: { ...baseFilters, locationId: 'loc-1' },
    });

    expect(supabase.from).toHaveBeenCalledWith('temperature_readings');
    expect(calls['eq:equipment.locations.organization_id']).toBe('org-1');
    expect(calls.in).toEqual(['equipment_id', ['eq-1', 'eq-2']]);
    expect(calls.gte).toEqual(['recorded_at', baseFilters.from]);
    expect(calls.lte).toEqual(['recorded_at', baseFilters.to]);
    expect(calls.order).toEqual(['recorded_at', { ascending: false }]);
    expect(data).toEqual([sampleReading]);
    expect(error).toBeNull();
  });

  it('applies equipmentId filter directly when given', async () => {
    const calls: Record<string, unknown> = {};
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn((col: string, val: string) => {
      calls[`eq:${col}`] = val;
      return chain;
    });
    chain.gte = vi.fn(() => chain);
    chain.lte = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    Object.defineProperty(chain, 'then', {
      get() {
        return (resolve: (v: unknown) => void) => resolve({ data: [], error: null });
      },
    });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    await listReadingsReport({
      organizationId: 'org-1',
      filters: { ...baseFilters, equipmentId: 'eq-1' },
    });

    expect(calls['eq:equipment_id']).toBe('eq-1');
  });

  it('applies readingType=manual filter', async () => {
    const calls: Record<string, unknown> = {};
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn((col: string, val: string) => {
      calls[`eq:${col}`] = val;
      return chain;
    });
    chain.gte = vi.fn(() => chain);
    chain.lte = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    Object.defineProperty(chain, 'then', {
      get() {
        return (resolve: (v: unknown) => void) => resolve({ data: [], error: null });
      },
    });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    await listReadingsReport({
      organizationId: 'org-1',
      filters: { ...baseFilters, readingType: 'manual' },
    });

    expect(calls['eq:reading_type']).toBe('manual');
  });

  it('does not apply reading_type filter when readingType=all', async () => {
    const calls: Record<string, unknown> = {};
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn((col: string) => {
      calls[`eq:${col}`] = 'seen';
      return chain;
    });
    chain.gte = vi.fn(() => chain);
    chain.lte = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    Object.defineProperty(chain, 'then', {
      get() {
        return (resolve: (v: unknown) => void) => resolve({ data: [], error: null });
      },
    });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    await listReadingsReport({
      organizationId: 'org-1',
      filters: { ...baseFilters, readingType: 'all' },
    });

    expect(calls['eq:reading_type']).toBeUndefined();
  });

  it('propagates supabase error', async () => {
    const chain: Record<string, unknown> = {};
    chain.select = () => chain;
    chain.eq = () => chain;
    chain.gte = () => chain;
    chain.lte = () => chain;
    chain.order = () => chain;
    Object.defineProperty(chain, 'then', {
      get() {
        return (resolve: (v: unknown) => void) =>
          resolve({ data: null, error: { message: 'boom' } });
      },
    });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    const { data, error } = await listReadingsReport({
      organizationId: 'org-1',
      filters: baseFilters,
    });

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'boom' });
  });

  it('propagates equipment query error', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: null,
      error: { message: 'loc boom' },
    });

    const { data, error } = await listReadingsReport({
      organizationId: 'org-1',
      filters: { ...baseFilters, locationId: 'loc-1' },
    });

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'loc boom' });
  });
});

describe('reports.service · listIncidentsForReport', () => {
  it('delegates to listIncidents with mapped filters', async () => {
    const incidents: IncidentWithReading[] = [];
    (listIncidents as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: incidents,
      error: null,
    });

    await listIncidentsForReport({
      organizationId: 'org-1',
      filters: {
        ...baseFilters,
        locationId: 'loc-1',
        equipmentId: 'eq-1',
      },
    });

    expect(listIncidents).toHaveBeenCalledWith({
      organizationId: 'org-1',
      filters: {
        from: baseFilters.from,
        to: baseFilters.to,
        locationId: 'loc-1',
        equipmentId: 'eq-1',
      },
    });
  });

  it('omits locationId/equipmentId when not provided', async () => {
    (listIncidents as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [],
      error: null,
    });

    await listIncidentsForReport({
      organizationId: 'org-1',
      filters: baseFilters,
    });

    expect(listIncidents).toHaveBeenCalledWith({
      organizationId: 'org-1',
      filters: {
        from: baseFilters.from,
        to: baseFilters.to,
      },
    });
  });
});
