import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listOrganizations,
  getOrganizationDetail,
  updateOrganizationStatus,
  getGlobalMetrics,
} from '@/features/platform-admin/services/platform-admin.service';
import type { Organization } from '@/shared/types/supabase';

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/shared/lib/dev-bypass', () => ({
  isDevBypassEnabled: vi.fn(() => false),
}));

vi.mock('@/shared/lib/dev-bypass-platform-admin', () => ({
  getDevMockOrganizations: vi.fn(() => []),
  getDevMockOrganizationCounts: vi.fn(() => ({
    locations: 0,
    profiles: 0,
    equipment: 0,
    readings: 0,
    incidents_open: 0,
    incidents_resolved: 0,
  })),
  getDevMockOrganizationDetail: vi.fn(() => null),
}));

import { supabase } from '@/shared/lib/supabase';

/**
 * Helper: crea un chain fluido tipo PostgrestQueryBuilder donde cada
 * método retorna el mismo chain (terminable con `.then`).
 * Captura todas las llamadas en `calls` para inspección.
 */
function makeChain(
  calls: Record<string, unknown[]>,
  terminalData: unknown = null,
  terminalError: unknown = null
) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockImplementation((arg: unknown) => {
    calls.select = calls.select ?? [];
    (calls.select as unknown[]).push(arg);
    return chain;
  });
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockImplementation((payload: unknown) => {
    calls.update = calls.update ?? [];
    (calls.update as unknown[]).push(payload);
    return chain;
  });
  chain.eq = vi.fn().mockImplementation((col: unknown, val: unknown) => {
    calls.eq = calls.eq ?? [];
    (calls.eq as unknown[]).push([col, val]);
    return chain;
  });
  chain.gte = vi.fn().mockImplementation((col: unknown, val: unknown) => {
    calls.gte = calls.gte ?? [];
    (calls.gte as unknown[]).push([col, val]);
    return chain;
  });
  chain.lte = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockImplementation((col: unknown, vals: unknown) => {
    calls.in = calls.in ?? [];
    (calls.in as unknown[]).push([col, vals]);
    return chain;
  });
  chain.order = vi.fn().mockImplementation((col: unknown, opts: unknown) => {
    calls.order = calls.order ?? [];
    (calls.order as unknown[]).push([col, opts]);
    return chain;
  });
  chain.single = vi.fn(() => ({ data: terminalData, error: terminalError }));
  chain.maybeSingle = vi.fn(() => ({ data: terminalData, error: terminalError }));
  chain.then = (resolve: (v: unknown) => void) =>
    resolve({ data: terminalData, error: terminalError });
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('platform-admin.service · listOrganizations', () => {
  it('queries organizations ordered by created_at desc', async () => {
    const calls: Record<string, unknown[]> = {};
    const chain = makeChain(calls, [], null);
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    await listOrganizations();

    expect(supabase.from).toHaveBeenCalledWith('organizations');
    expect(calls.select?.length).toBeGreaterThanOrEqual(1);
  });

  it('applies status, businessType and planType filters via eq chain', async () => {
    const calls: Record<string, unknown[]> = {};
    const chain = makeChain(calls, [], null);
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    await listOrganizations({
      status: 'paused',
      businessType: 'restaurant',
      planType: 'enterprise',
    });

    const eqPairs = (calls.eq ?? []) as Array<[string, string]>;
    expect(eqPairs).toContainEqual(['status', 'paused']);
    expect(eqPairs).toContainEqual(['business_type', 'restaurant']);
    expect(eqPairs).toContainEqual(['plan_type', 'enterprise']);
  });

  it('propagates supabase error', async () => {
    const calls: Record<string, unknown[]> = {};
    const chain = makeChain(calls, null, { message: 'boom' });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    const { data, error } = await listOrganizations();

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'boom' });
  });
});

describe('platform-admin.service · getOrganizationDetail', () => {
  it('returns null when organization not found', async () => {
    const calls: Record<string, unknown[]> = {};
    const chain = makeChain(calls, null, { message: 'not found' });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const { data, error } = await getOrganizationDetail('org-x');

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'not found' });
  });

  it('returns full detail with locations, profiles and counts', async () => {
    const orgRow: Organization = {
      id: 'org-1',
      name: 'Test',
      business_type: 'restaurant',
      status: 'active',
      plan_type: 'pro',
      max_locations: 5,
      created_by: 'u-1',
      created_at: '2026-06-01T00:00:00Z',
    };

    const calls1: Record<string, unknown[]> = {};
    const calls2: Record<string, unknown[]> = {};
    const calls3: Record<string, unknown[]> = {};
    const calls4: Record<string, unknown[]> = {};
    const calls5: Record<string, unknown[]> = {};
    const calls6: Record<string, unknown[]> = {};

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'organizations') return makeChain(calls1, orgRow, null);
      if (table === 'locations')
        return makeChain(calls2, [{ id: 'l-1', name: 'Sede 1', address: 'Av 1' }], null);
      if (table === 'profiles')
        return makeChain(
          calls3,
          [{ id: 'p-1', email: 'a@b.c', full_name: 'A', role: 'owner' }],
          null
        );
      if (table === 'equipment')
        return makeChain(
          calls4,
          [
            { id: 'eq-1', location_id: 'l-1' },
            { id: 'eq-2', location_id: 'l-1' },
          ],
          null
        );
      if (table === 'temperature_readings_summary') return makeChain(calls5, null, null);
      if (table === 'incidents_summary')
        return makeChain(
          calls6,
          [
            { id: 'i-1', status: 'open' },
            { id: 'i-2', status: 'resolved' },
          ],
          null
        );
      return makeChain({});
    });

    const { data, error } = await getOrganizationDetail('org-1');

    expect(error).toBeNull();
    expect(data?.id).toBe('org-1');
    expect(data?.locations).toEqual([{ id: 'l-1', name: 'Sede 1', address: 'Av 1' }]);
    expect(data?.counts.equipment).toBe(2);
    expect(data?.counts.incidents_open).toBe(1);
    expect(data?.counts.incidents_resolved).toBe(1);
  });
});

describe('platform-admin.service · updateOrganizationStatus', () => {
  it('updates status and returns updated row', async () => {
    const updated: Organization = {
      id: 'org-1',
      name: 'Test',
      business_type: 'restaurant',
      status: 'suspended',
      plan_type: 'pro',
      max_locations: 5,
      created_by: 'u-1',
      created_at: '2026-06-01T00:00:00Z',
    };

    const calls: Record<string, unknown[]> = {};
    const chain = makeChain(calls, updated, null);
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    const { data, error } = await updateOrganizationStatus('org-1', 'suspended');

    expect(calls.update).toContainEqual({ status: 'suspended' });
    expect(data?.status).toBe('suspended');
    expect(error).toBeNull();
  });

  it('propagates error', async () => {
    const calls: Record<string, unknown[]> = {};
    const chain = makeChain(calls, null, { message: 'rls denied' });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(chain);

    const { data, error } = await updateOrganizationStatus('org-1', 'paused');

    expect(data).toBeNull();
    expect(error).toEqual({ message: 'rls denied' });
  });
});

describe('platform-admin.service · getGlobalMetrics', () => {
  it('returns aggregated metrics from parallel queries', async () => {
    const calls1: Record<string, unknown[]> = {};
    const calls2: Record<string, unknown[]> = {};
    const calls3: Record<string, unknown[]> = {};

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'organizations')
        return makeChain(
          calls1,
          [
            { id: 'o-1', status: 'active' },
            { id: 'o-2', status: 'active' },
            { id: 'o-3', status: 'paused' },
          ],
          null
        );
      if (table === 'temperature_readings_summary') return makeChain(calls2, null, null);
      if (table === 'incidents_summary')
        return makeChain(calls3, [{ id: 'i-1' }, { id: 'i-2' }], null);
      return makeChain({});
    });

    const { data, error } = await getGlobalMetrics();

    expect(error).toBeNull();
    expect(data?.active_organizations).toBe(2);
    expect(data?.total_organizations).toBe(3);
    expect(data?.open_incidents).toBe(2);
  });
});
