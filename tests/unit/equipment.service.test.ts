import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Equipment } from '@/shared/types/supabase';
import {
  listEquipmentByLocation,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  countEquipmentReadings,
} from '@/features/equipment/services/equipment.service';

vi.mock('@/shared/lib/supabase', () => {
  const make = () => {
    const c: Record<string, ReturnType<typeof vi.fn>> = {};
    c.select = vi.fn(() => c);
    c.insert = vi.fn(() => c);
    c.update = vi.fn(() => c);
    c.delete = vi.fn(() => c);
    c.eq = vi.fn(() => c);
    c.order = vi.fn(() => c);
    c.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
    return c;
  };
  return {
    supabase: { from: vi.fn(() => make()) },
  };
});

import { supabase } from '@/shared/lib/supabase';

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('equipment.service · listEquipmentByLocation', () => {
  it('queries equipment filtered by location ordered by created_at', async () => {
    const order = vi.fn().mockResolvedValue({ data: [sampleEquipment], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, order });

    const { data, error } = await listEquipmentByLocation('loc-1');

    expect(supabase.from).toHaveBeenCalledWith('equipment');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('location_id', 'loc-1');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: true });
    expect(data).toEqual([sampleEquipment]);
    expect(error).toBeNull();
  });

  it('returns error when supabase fails', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: () => ({ eq: () => ({ order }) }),
    });

    const { data, error } = await listEquipmentByLocation('loc-1');
    expect(data).toBeNull();
    expect(error).toEqual({ message: 'boom' });
  });
});

describe('equipment.service · getEquipment', () => {
  it('fetches a single equipment by id', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleEquipment, error: null });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, single });

    const { data, error } = await getEquipment('eq-1');

    expect(supabase.from).toHaveBeenCalledWith('equipment');
    expect(eq).toHaveBeenCalledWith('id', 'eq-1');
    expect(data).toEqual(sampleEquipment);
    expect(error).toBeNull();
  });
});

describe('equipment.service · createEquipment', () => {
  it('inserts with all fields including physicalLocation and code', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleEquipment, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    await createEquipment({
      locationId: 'loc-1',
      name: 'Refrigerador Lácteos',
      physicalLocation: 'Cocina',
      code: 'EQ-001',
      minTemp: 0,
      maxTemp: 6,
    });

    expect(insert).toHaveBeenCalledWith({
      location_id: 'loc-1',
      name: 'Refrigerador Lácteos',
      physical_location: 'Cocina',
      code: 'EQ-001',
      min_temp: 0,
      max_temp: 6,
    });
  });

  it('normalizes missing physicalLocation and code to null', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleEquipment, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    await createEquipment({
      locationId: 'loc-1',
      name: 'X',
      minTemp: 0,
      maxTemp: 6,
    });

    expect(insert).toHaveBeenCalledWith({
      location_id: 'loc-1',
      name: 'X',
      physical_location: null,
      code: null,
      min_temp: 0,
      max_temp: 6,
    });
  });

  it('propagates error', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    const { data, error } = await createEquipment({
      locationId: 'loc-1',
      name: 'X',
      minTemp: 0,
      maxTemp: 6,
    });

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'insert failed' });
  });
});

describe('equipment.service · updateEquipment', () => {
  it('updates only provided fields', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleEquipment, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq, select, single });

    await updateEquipment('eq-1', { name: 'Renombrado' });

    expect(update).toHaveBeenCalledWith({ name: 'Renombrado' });
  });

  it('maps camelCase input to snake_case DB columns', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleEquipment, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq, select, single });

    await updateEquipment('eq-1', {
      physicalLocation: 'Bodega',
      minTemp: 2,
      maxTemp: 8,
    });

    expect(update).toHaveBeenCalledWith({
      physical_location: 'Bodega',
      min_temp: 2,
      max_temp: 8,
    });
  });

  it('allows clearing physicalLocation and code with null', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleEquipment, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq, select, single });

    await updateEquipment('eq-1', { physicalLocation: null, code: null });

    expect(update).toHaveBeenCalledWith({ physical_location: null, code: null });
  });
});

describe('equipment.service · deleteEquipment', () => {
  it('deletes by id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ delete: del, eq });

    const { data, error } = await deleteEquipment('eq-1');

    expect(supabase.from).toHaveBeenCalledWith('equipment');
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'eq-1');
    expect(data).toBeNull();
    expect(error).toBeNull();
  });

  it('returns error when delete fails', async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: 'fk violation' } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ delete: () => ({ eq }) });

    const { data, error } = await deleteEquipment('eq-1');
    expect(data).toBeNull();
    expect(error).toEqual({ message: 'fk violation' });
  });
});

describe('equipment.service · countEquipmentReadings', () => {
  it('uses head:true and count:exact, filters by equipment_id', async () => {
    const eq = vi.fn().mockResolvedValue({ count: 42, error: null });
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq });

    const { count, error } = await countEquipmentReadings('eq-1');

    expect(supabase.from).toHaveBeenCalledWith('temperature_readings');
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(eq).toHaveBeenCalledWith('equipment_id', 'eq-1');
    expect(count).toBe(42);
    expect(error).toBeNull();
  });
});
