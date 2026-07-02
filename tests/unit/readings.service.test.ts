import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TemperatureReading } from '@/shared/types/supabase';
import {
  listReadingsByEquipment,
  listReadingsByLocation,
  latestReadingByEquipment,
  countReadingsByLocation,
  getReading,
  createReading,
  countReadingsByEquipment,
} from '@/features/readings/services/readings.service';

vi.mock('@/shared/lib/supabase', () => {
  const make = () => {
    const c: Record<string, ReturnType<typeof vi.fn>> = {};
    c.select = vi.fn(() => c);
    c.insert = vi.fn(() => c);
    c.eq = vi.fn(() => c);
    c.in = vi.fn(() => c);
    c.order = vi.fn(() => c);
    c.limit = vi.fn(() => c);
    c.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
    c.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
    return c;
  };
  return {
    supabase: { from: vi.fn(() => make()) },
  };
});

import { supabase } from '@/shared/lib/supabase';

const sampleReading: TemperatureReading = {
  id: 'r-1',
  equipment_id: 'eq-1',
  value: 3.5,
  reading_type: 'manual',
  sensor_battery: null,
  sensor_signal: null,
  snapshot_min_temp: null,
  snapshot_max_temp: null,
  recorded_by_profile: 'u-1',
  recorded_by_staff: 's-1',
  taken_by: null,
  recorded_at: '2026-07-01T08:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('readings.service · listReadingsByEquipment', () => {
  it('queries readings filtered by equipment ordered by recorded_at desc', async () => {
    const order = vi.fn().mockResolvedValue({ data: [sampleReading], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, order });

    const { data, error } = await listReadingsByEquipment('eq-1');

    expect(supabase.from).toHaveBeenCalledWith('temperature_readings');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('equipment_id', 'eq-1');
    expect(order).toHaveBeenCalledWith('recorded_at', { ascending: false });
    expect(data).toEqual([sampleReading]);
    expect(error).toBeNull();
  });

  it('applies limit when provided', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [sampleReading], error: null });
    const order = vi.fn(() => ({ limit }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, order, limit });

    await listReadingsByEquipment('eq-1', { limit: 5 });

    expect(limit).toHaveBeenCalledWith(5);
  });

  it('omits limit when not provided', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, order });

    await listReadingsByEquipment('eq-1');

    expect(order).toHaveBeenCalled();
  });

  it('returns error when supabase fails', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: () => ({ eq: () => ({ order }) }),
    });

    const { data, error } = await listReadingsByEquipment('eq-1');
    expect(data).toBeNull();
    expect(error).toEqual({ message: 'boom' });
  });
});

describe('readings.service · getReading', () => {
  it('fetches a single reading by id', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleReading, error: null });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, single });

    const { data, error } = await getReading('r-1');

    expect(supabase.from).toHaveBeenCalledWith('temperature_readings');
    expect(eq).toHaveBeenCalledWith('id', 'r-1');
    expect(data).toEqual(sampleReading);
    expect(error).toBeNull();
  });
});

describe('readings.service · createReading', () => {
  it('inserts with manual reading_type and all fields', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleReading, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    await createReading({
      equipmentId: 'eq-1',
      value: 3.5,
      recordedByProfile: 'u-1',
      recordedByStaff: 's-1',
      takenBy: null,
    });

    expect(insert).toHaveBeenCalledWith({
      equipment_id: 'eq-1',
      value: 3.5,
      reading_type: 'manual',
      recorded_by_profile: 'u-1',
      recorded_by_staff: 's-1',
      taken_by: null,
    });
  });

  it('includes recorded_at when provided', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleReading, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    await createReading({
      equipmentId: 'eq-1',
      value: 3.5,
      recordedByProfile: 'u-1',
      recordedByStaff: null,
      takenBy: 'Inspector de turno',
      recordedAt: '2026-07-01T08:00:00Z',
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        recorded_at: '2026-07-01T08:00:00Z',
        taken_by: 'Inspector de turno',
      })
    );
  });

  it('propagates error', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    const { data, error } = await createReading({
      equipmentId: 'eq-1',
      value: 3.5,
      recordedByProfile: null,
      recordedByStaff: null,
      takenBy: null,
    });

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'insert failed' });
  });
});

describe('readings.service · countReadingsByEquipment', () => {
  it('uses head:true and count:exact, filters by equipment_id', async () => {
    const eq = vi.fn().mockResolvedValue({ count: 42, error: null });
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq });

    const { count, error } = await countReadingsByEquipment('eq-1');

    expect(supabase.from).toHaveBeenCalledWith('temperature_readings');
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(eq).toHaveBeenCalledWith('equipment_id', 'eq-1');
    expect(count).toBe(42);
    expect(error).toBeNull();
  });
});

describe('readings.service · listReadingsByLocation', () => {
  it('returns empty list when location has no equipment', async () => {
    const eq = vi.fn().mockResolvedValue({ data: [], error: null });
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq });

    const { data, error } = await listReadingsByLocation('loc-1');

    expect(supabase.from).toHaveBeenCalledWith('equipment');
    expect(eq).toHaveBeenCalledWith('location_id', 'loc-1');
    expect(data).toEqual([]);
    expect(error).toBeNull();
  });

  it('queries readings filtered by equipment ids of the location', async () => {
    const eq = vi.fn().mockResolvedValue({ data: [{ id: 'eq-1' }, { id: 'eq-2' }], error: null });
    const selectEq = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select: selectEq, eq });

    const order = vi.fn().mockResolvedValue({ data: [sampleReading], error: null });
    const inFn = vi.fn(() => ({ order }));
    const selectR = vi.fn(() => ({ in: inFn }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: selectR,
      in: inFn,
      order,
    });

    const { data, error } = await listReadingsByLocation('loc-1');

    expect(supabase.from).toHaveBeenNthCalledWith(2, 'temperature_readings');
    expect(inFn).toHaveBeenCalledWith('equipment_id', ['eq-1', 'eq-2']);
    expect(order).toHaveBeenCalledWith('recorded_at', { ascending: false });
    expect(data).toEqual([sampleReading]);
    expect(error).toBeNull();
  });

  it('propagates equipment query error', async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: { message: 'loc boom' } });
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq });

    const { data, error } = await listReadingsByLocation('loc-1');

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'loc boom' });
  });
});

describe('readings.service · latestReadingByEquipment', () => {
  it('returns the most recent reading using limit(1).maybeSingle()', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: sampleReading, error: null });
    const limit = vi.fn(() => ({ maybeSingle }));
    const order = vi.fn(() => ({ limit }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select,
      eq,
      order,
      limit,
      maybeSingle,
    });

    const { data, error } = await latestReadingByEquipment('eq-1');

    expect(order).toHaveBeenCalledWith('recorded_at', { ascending: false });
    expect(limit).toHaveBeenCalledWith(1);
    expect(data).toEqual(sampleReading);
    expect(error).toBeNull();
  });

  it('returns null data when no readings exist', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const limit = vi.fn(() => ({ maybeSingle }));
    const order = vi.fn(() => ({ limit }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select,
      eq,
      order,
      limit,
      maybeSingle,
    });

    const { data, error } = await latestReadingByEquipment('eq-1');

    expect(data).toBeNull();
    expect(error).toBeNull();
  });
});

describe('readings.service · countReadingsByLocation', () => {
  it('returns 0 when location has no equipment', async () => {
    const eq = vi.fn().mockResolvedValue({ data: [], error: null });
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq });

    const { count, error } = await countReadingsByLocation('loc-1');

    expect(count).toBe(0);
    expect(error).toBeNull();
  });

  it('counts readings across all equipment of a location', async () => {
    const eq = vi.fn().mockResolvedValue({ data: [{ id: 'eq-1' }, { id: 'eq-2' }], error: null });
    const selectEq = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select: selectEq, eq });

    const inFn = vi.fn().mockResolvedValue({ count: 17, error: null });
    const selectR = vi.fn(() => ({ in: inFn }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: selectR,
      in: inFn,
    });

    const { count, error } = await countReadingsByLocation('loc-1');

    expect(inFn).toHaveBeenCalledWith('equipment_id', ['eq-1', 'eq-2']);
    expect(count).toBe(17);
    expect(error).toBeNull();
  });

  it('propagates equipment query error', async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: { message: 'loc boom' } });
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq });

    const { count, error } = await countReadingsByLocation('loc-1');

    expect(count).toBeNull();
    expect(error).toEqual({ message: 'loc boom' });
  });
});