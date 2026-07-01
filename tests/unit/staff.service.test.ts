import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Staff } from '@/shared/types/supabase';
import {
  listStaffByLocation,
  getStaff,
  createStaff,
  updateStaff,
  setStaffActive,
  countStaffReadings,
} from '@/features/staff/services/staff.service';

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
    supabase: {
      from: vi.fn((_table: string) => make()),
    },
  };
});

import { supabase } from '@/shared/lib/supabase';

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
});

describe('staff.service · listStaffByLocation', () => {
  it('queries staff filtered by location ordered by created_at', async () => {
    const order = vi.fn().mockResolvedValue({ data: [sampleStaff], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, order });

    const { data, error } = await listStaffByLocation('loc-1');

    expect(supabase.from).toHaveBeenCalledWith('staff');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('location_id', 'loc-1');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: true });
    expect(data).toEqual([sampleStaff]);
    expect(error).toBeNull();
  });

  it('returns error when supabase fails', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: () => ({ eq: () => ({ order }) }),
    });

    const { data, error } = await listStaffByLocation('loc-1');

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'boom' });
  });
});

describe('staff.service · getStaff', () => {
  it('fetches a single staff by id', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleStaff, error: null });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq, single });

    const { data, error } = await getStaff('staff-1');

    expect(supabase.from).toHaveBeenCalledWith('staff');
    expect(eq).toHaveBeenCalledWith('id', 'staff-1');
    expect(data).toEqual(sampleStaff);
    expect(error).toBeNull();
  });
});

describe('staff.service · createStaff', () => {
  it('inserts with location_id, name, role and active=true', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleStaff, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    const { data, error } = await createStaff({
      locationId: 'loc-1',
      name: 'María López',
      role: 'Cocinera',
    });

    expect(insert).toHaveBeenCalledWith({
      location_id: 'loc-1',
      name: 'María López',
      role: 'Cocinera',
      active: true,
    });
    expect(data).toEqual(sampleStaff);
    expect(error).toBeNull();
  });

  it('propagates error', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    const { data, error } = await createStaff({
      locationId: 'loc-1',
      name: 'X',
      role: 'Y',
    });

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'insert failed' });
  });
});

describe('staff.service · updateStaff', () => {
  it('updates only provided fields', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleStaff, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq, select, single });

    await updateStaff('staff-1', { name: 'María L.' });

    expect(update).toHaveBeenCalledWith({ name: 'María L.' });
  });

  it('updates both fields when provided', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleStaff, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq, select, single });

    await updateStaff('staff-1', { name: 'María L.', role: 'Chef' });

    expect(update).toHaveBeenCalledWith({ name: 'María L.', role: 'Chef' });
  });
});

describe('staff.service · setStaffActive', () => {
  it('sets active=true on the staff row', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleStaff, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq, select, single });

    await setStaffActive('staff-1', true);

    expect(update).toHaveBeenCalledWith({ active: true });
  });

  it('sets active=false on the staff row', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleStaff, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq, select, single });

    await setStaffActive('staff-1', false);

    expect(update).toHaveBeenCalledWith({ active: false });
  });
});

describe('staff.service · countStaffReadings', () => {
  it('uses head:true and count:exact, filters by recorded_by_staff', async () => {
    const eq = vi.fn().mockResolvedValue({ count: 12, error: null });
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq });

    const { count, error } = await countStaffReadings('staff-1');

    expect(supabase.from).toHaveBeenCalledWith('temperature_readings');
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(eq).toHaveBeenCalledWith('recorded_by_staff', 'staff-1');
    expect(count).toBe(12);
    expect(error).toBeNull();
  });

  it('returns 0 when no readings', async () => {
    const eq = vi.fn().mockResolvedValue({ count: 0, error: null });
    const select = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ select, eq });

    const { count, error } = await countStaffReadings('staff-1');

    expect(count).toBe(0);
    expect(error).toBeNull();
  });
});
