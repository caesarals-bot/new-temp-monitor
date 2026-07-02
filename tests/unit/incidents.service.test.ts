import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listIncidents,
  resolveIncident,
  createIncidentFromReading,
  buildIncidentDescription,
} from '@/features/incidents/services/incidents.service';
import type { IncidentWithReading } from '@/features/incidents/types';

vi.mock('@/shared/lib/supabase', () => {
  const make = () => {
    const c: Record<string, ReturnType<typeof vi.fn>> = {};
    c.select = vi.fn(() => c);
    c.insert = vi.fn(() => c);
    c.update = vi.fn(() => c);
    c.eq = vi.fn(() => c);
    c.in = vi.fn(() => c);
    c.order = vi.fn(() => c);
    c.gte = vi.fn(() => c);
    c.lte = vi.fn(() => c);
    c.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
    return c;
  };
  return { supabase: { from: vi.fn(() => make()) } };
});

vi.mock('@/features/equipment/services/equipment.service', () => ({
  listEquipmentByLocation: vi.fn(),
}));

import { supabase } from '@/shared/lib/supabase';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('incidents.service · buildIncidentDescription', () => {
  it('uses "supera" when value is above max', () => {
    const desc = buildIncidentDescription({ value: 12, minTemp: 2, maxTemp: 8 });
    expect(desc).toBe('Temperatura de 12°C supera el rango permitido [2, 8]');
  });

  it('uses "bajo" when value is below min', () => {
    const desc = buildIncidentDescription({ value: -25, minTemp: -22, maxTemp: -15 });
    expect(desc).toBe('Temperatura de -25°C está bajo el rango permitido [-22, -15]');
  });

  it('falls back to neutral wording when direction cannot be computed', () => {
    const desc = buildIncidentDescription({ value: 5, minTemp: 2, maxTemp: 8 });
    expect(desc).toBe('Temperatura de 5°C fuera del rango permitido [2, 8]');
  });
});

describe('incidents.service · resolveIncident', () => {
  it('updates status, action_taken, resolved_by and resolved_at', async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: null });
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq });

    const fixedNow = new Date('2026-07-01T12:00:00Z');
    vi.setSystemTime(fixedNow);

    const { data, error } = await resolveIncident({
      incidentId: 'inc-1',
      actionTaken: '  Se trasladaron los productos al equipo de respaldo  ',
      resolvedBy: 'user-1',
    });

    expect(supabase.from).toHaveBeenCalledWith('incidents');
    expect(update).toHaveBeenCalledWith({
      status: 'resolved',
      action_taken: 'Se trasladaron los productos al equipo de respaldo',
      resolved_by: 'user-1',
      resolved_at: fixedNow.toISOString(),
    });
    expect(eq).toHaveBeenCalledWith('id', 'inc-1');
    expect(data).toBeNull();
    expect(error).toBeNull();
  });

  it('propagates supabase error', async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: { message: 'update failed' } });
    const update = vi.fn(() => ({ eq }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ update, eq });

    const { error } = await resolveIncident({
      incidentId: 'inc-1',
      actionTaken: 'Acción correctiva suficientemente larga',
      resolvedBy: 'user-1',
    });

    expect(error).toEqual({ message: 'update failed' });
  });
});

describe('incidents.service · createIncidentFromReading', () => {
  it('inserts incident with reading_id and description', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'inc-new' }, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({ insert, select, single });

    const { data, error } = await createIncidentFromReading({
      readingId: 'reading-1',
      description: 'Temperatura de 12°C supera el rango permitido [2, 8]',
    });

    expect(supabase.from).toHaveBeenCalledWith('incidents');
    expect(insert).toHaveBeenCalledWith({
      reading_id: 'reading-1',
      description: 'Temperatura de 12°C supera el rango permitido [2, 8]',
    });
    expect(data).toEqual({ id: 'inc-new' });
    expect(error).toBeNull();
  });
});

describe('incidents.service · listIncidents', () => {
  const sampleIncident: IncidentWithReading = {
    id: 'inc-1',
    reading_id: 'r-1',
    status: 'open',
    description: 'Temperatura fuera de rango',
    action_taken: null,
    resolved_by: null,
    resolved_at: null,
    created_at: '2026-07-01T08:00:00Z',
    reading: {
      id: 'r-1',
      value: 12,
      recorded_at: '2026-07-01T07:55:00Z',
      equipment: {
        id: 'eq-1',
        name: 'Refrigerador Lácteos',
        min_temp: 2,
        max_temp: 8,
        location_id: 'loc-1',
      },
    },
  };

  it('returns empty list when filtering by location with no equipment', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { data, error } = await listIncidents({
      organizationId: 'org-1',
      filters: { locationId: 'loc-1' },
    });

    expect(listEquipmentByLocation).toHaveBeenCalledWith('loc-1');
    expect(supabase.from).not.toHaveBeenCalled();
    expect(data).toEqual([]);
    expect(error).toBeNull();
  });

  it('applies status filter, equipment IN filter and date range when location has equipment', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [{ id: 'eq-1' }, { id: 'eq-2' }],
      error: null,
    });

    const calls: Record<string, unknown> = {};
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};

    chain.select = vi.fn().mockImplementation((fields: string) => {
      calls.select = fields;
      return chain;
    });
    chain.eq = vi.fn().mockImplementation((col: string, val: string) => {
      const key = `eq:${col}`;
      calls[key] = val;
      return chain;
    });
    chain.order = vi.fn().mockImplementation((col: string, opts: { ascending: boolean }) => {
      calls.order = [col, opts];
      return chain;
    });
    chain.in = vi.fn().mockImplementation((col: string, vals: string[]) => {
      calls.in = [col, vals];
      return chain;
    });
    chain.gte = vi.fn().mockImplementation((col: string, val: string) => {
      calls.gte = [col, val];
      return chain;
    });
    chain.lte = vi.fn().mockImplementation((col: string, val: string) => {
      calls.lte = [col, val];
      return chain;
    });

    Object.defineProperty(chain, 'then', {
      get() {
        return (resolve: (v: unknown) => void) =>
          resolve({ data: [sampleIncident], error: null });
      },
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    const { data, error } = await listIncidents({
      organizationId: 'org-1',
      filters: {
        status: 'open',
        locationId: 'loc-1',
        equipmentId: 'eq-1',
        from: '2026-06-01T00:00:00Z',
        to: '2026-07-01T23:59:59Z',
      },
    });

    expect(supabase.from).toHaveBeenCalledWith('incidents');
    expect(calls.select).toContain('temperature_readings');
    expect(calls['eq:reading.equipment.locations.organization_id']).toBe('org-1');
    expect(calls['eq:status']).toBe('open');
    expect(calls.in).toEqual(['reading.equipment_id', ['eq-1', 'eq-2']]);
    expect(calls.gte).toEqual(['created_at', '2026-06-01T00:00:00Z']);
    expect(calls.lte).toEqual(['created_at', '2026-07-01T23:59:59Z']);
    expect(calls.order).toEqual(['created_at', { ascending: false }]);
    expect(data).toEqual([sampleIncident]);
    expect(error).toBeNull();
  });

  it('propagates equipment query error', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: null,
      error: { message: 'loc boom' },
    });

    const { data, error } = await listIncidents({
      organizationId: 'org-1',
      filters: { locationId: 'loc-1' },
    });

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'loc boom' });
  });

  it('queries without location filter when none is given', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eqOrg = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq: eqOrg }));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select,
      eq: eqOrg,
      order,
    });

    await listIncidents({ organizationId: 'org-1' });

    expect(listEquipmentByLocation).not.toHaveBeenCalled();
    expect(eqOrg).toHaveBeenCalledWith('reading.equipment.locations.organization_id', 'org-1');
  });
});