import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Location } from '@/shared/types/supabase';
import {
  listLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  countLocationsByOrg,
  countLocationDependencies,
} from '@/features/locations/services/locations.service';

vi.mock('@/shared/lib/supabase', () => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const make = () => {
    const c: Record<string, ReturnType<typeof vi.fn>> = {};
    c.select = vi.fn(() => c);
    c.insert = vi.fn(() => c);
    c.update = vi.fn(() => c);
    c.delete = vi.fn(() => c);
    c.eq = vi.fn(() => c);
    c.in = vi.fn(() => c);
    c.order = vi.fn(() => c);
    c.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
    return c;
  };
  return {
    supabase: {
      from: vi.fn((_table: string) => {
        const c = make();
        Object.assign(chain, c);
        return c;
      }),
    },
  };
});

import { supabase } from '@/shared/lib/supabase';

const sampleLocation: Location = {
  id: 'loc-1',
  organization_id: 'org-1',
  name: 'Casa Central',
  address: 'Av. Demo 123',
  created_at: '2026-06-30T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('locations.service · listLocations', () => {
  it('queries locations filtered by org id ordered by created_at', async () => {
    const order = vi.fn().mockResolvedValue({ data: [sampleLocation], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, order });

    const { data, error } = await listLocations('org-1');

    expect(supabase.from).toHaveBeenCalledWith('locations');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('organization_id', 'org-1');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: true });
    expect(data).toEqual([sampleLocation]);
    expect(error).toBeNull();
  });

  it('returns error when supabase fails', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: () => ({ eq: () => ({ order }) }),
    });

    const { data, error } = await listLocations('org-1');

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'boom' });
  });
});

describe('locations.service · getLocation', () => {
  it('fetches a single location by id', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleLocation, error: null });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, single });

    const { data, error } = await getLocation('loc-1');

    expect(supabase.from).toHaveBeenCalledWith('locations');
    expect(eq).toHaveBeenCalledWith('id', 'loc-1');
    expect(data).toEqual(sampleLocation);
    expect(error).toBeNull();
  });
});

describe('locations.service · createLocation', () => {
  it('inserts with organization_id and returns the row', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleLocation, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    const { data, error } = await createLocation({
      organizationId: 'org-1',
      name: 'Casa Central',
      address: 'Av. Demo 123',
    });

    expect(insert).toHaveBeenCalledWith({
      organization_id: 'org-1',
      name: 'Casa Central',
      address: 'Av. Demo 123',
    });
    expect(data).toEqual(sampleLocation);
    expect(error).toBeNull();
  });

  it('normalizes missing address to null', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleLocation, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    await createLocation({ organizationId: 'org-1', name: 'Sucursal' });

    expect(insert).toHaveBeenCalledWith({
      organization_id: 'org-1',
      name: 'Sucursal',
      address: null,
    });
  });

  it('propagates trigger error (check_location_limit)', async () => {
    const triggerError = { message: 'Has alcanzado el límite de 2 sede(s) para tu plan pro' };
    const single = vi.fn().mockResolvedValue({ data: null, error: triggerError });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    const { data, error } = await createLocation({
      organizationId: 'org-1',
      name: 'Tercera',
    });

    expect(data).toBeNull();
    expect(error).toEqual(triggerError);
  });
});

describe('locations.service · updateLocation', () => {
  it('updates only provided fields', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleLocation, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq, select, single });

    await updateLocation('loc-1', { name: 'Renombrada' });

    expect(update).toHaveBeenCalledWith({ name: 'Renombrada' });
  });

  it('allows clearing address with null', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleLocation, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq, select, single });

    await updateLocation('loc-1', { address: null });

    expect(update).toHaveBeenCalledWith({ address: null });
  });
});

describe('locations.service · deleteLocation', () => {
  it('deletes by id and returns null data', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ delete: del, eq });

    const { data, error } = await deleteLocation('loc-1');

    expect(supabase.from).toHaveBeenCalledWith('locations');
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'loc-1');
    expect(data).toBeNull();
    expect(error).toBeNull();
  });

  it('returns error when delete fails', async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: 'fk violation' } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ delete: () => ({ eq }) });

    const { data, error } = await deleteLocation('loc-1');

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'fk violation' });
  });
});

describe('locations.service · countLocationsByOrg', () => {
  it('uses head:true and count:exact', async () => {
    const eq = vi.fn().mockResolvedValue({ count: 2, error: null });
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq });

    const { count, error } = await countLocationsByOrg('org-1');

    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(eq).toHaveBeenCalledWith('organization_id', 'org-1');
    expect(count).toBe(2);
    expect(error).toBeNull();
  });
});

describe('locations.service · countLocationDependencies', () => {
  it('returns counts for equipment, staff and readings', async () => {
    const equipmentEq = vi.fn().mockResolvedValue({
      data: [{ id: 'eq-1' }, { id: 'eq-2' }],
      count: 2,
      error: null,
    });
    const equipmentSelect = vi.fn(() => ({ eq: equipmentEq }));

    const staffEq = vi.fn().mockResolvedValue({ count: 5, error: null });
    const staffSelect = vi.fn(() => ({ eq: staffEq }));

    const readingsIn = vi.fn().mockResolvedValue({ count: 17, error: null });
    const readingsSelect = vi.fn(() => ({ in: readingsIn }));

    let i = 0;
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      i += 1;
      if (i === 1) return { select: equipmentSelect };
      if (i === 2) return { select: staffSelect };
      return { select: readingsSelect };
    });

    const { data, error } = await countLocationDependencies('loc-1');

    expect(error).toBeNull();
    expect(data).toEqual({ equipment: 2, staff: 5, readings: 17 });
    expect(readingsIn).toHaveBeenCalledWith('equipment_id', ['eq-1', 'eq-2']);
  });

  it('skips readings query when there is no equipment', async () => {
    const equipmentEq = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
    const equipmentSelect = vi.fn(() => ({ eq: equipmentEq }));

    const staffEq = vi.fn().mockResolvedValue({ count: 0, error: null });
    const staffSelect = vi.fn(() => ({ eq: staffEq }));

    const readingsIn = vi.fn();
    const readingsSelect = vi.fn(() => ({ in: readingsIn }));

    let i = 0;
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      i += 1;
      if (i === 1) return { select: equipmentSelect };
      if (i === 2) return { select: staffSelect };
      return { select: readingsSelect };
    });

    const { data, error } = await countLocationDependencies('loc-1');

    expect(error).toBeNull();
    expect(data).toEqual({ equipment: 0, staff: 0, readings: 0 });
    expect(readingsIn).not.toHaveBeenCalled();
  });

  it('returns error when equipment count fails', async () => {
    const equipmentEq = vi.fn().mockResolvedValue({ data: null, count: null, error: { message: 'boom' } });
    const equipmentSelect = vi.fn(() => ({ eq: equipmentEq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select: equipmentSelect });

    const { data, error } = await countLocationDependencies('loc-1');

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'boom' });
  });
});
