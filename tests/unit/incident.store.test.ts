import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useIncidentStore,
  selectOpenIncidentCount,
  selectOpenIncidentsByLocation,
  selectHasOpenIncidents,
  selectIncidentsError,
} from '@/features/incidents/store/incident.store';
import type { IncidentWithReading } from '@/features/incidents/types';

const mockTerminalResult: { data: unknown; error: unknown } = { data: null, error: null };

const fakeChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn((cb: (status: string) => void) => {
    cb('SUBSCRIBED');
    return fakeChannel;
  }),
};

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: () => {
      const builder: Record<string, unknown> = {};
      builder.select = vi.fn(() => builder);
      builder.eq = vi.fn(() => builder);
      builder.then = (resolve: (v: unknown) => void) => resolve(mockTerminalResult);
      return builder;
    },
    channel: vi.fn(() => fakeChannel),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/shared/lib/dev-bypass', () => ({
  isDevBypassEnabled: vi.fn(() => false),
}));

import { supabase } from '@/shared/lib/supabase';
import { isDevBypassEnabled } from '@/shared/lib/dev-bypass';

function makeIncident(
  id: string,
  locationId: string,
  status: 'open' | 'resolved' = 'open'
): IncidentWithReading {
  return {
    id,
    reading_id: `r-${id}`,
    status,
    description: 'd',
    action_taken: null,
    resolved_by: null,
    resolved_at: null,
    created_at: '2026-06-30T00:00:00Z',
    reading: {
      id: `r-${id}`,
      value: 12,
      recorded_at: '2026-06-30T00:00:00Z',
      equipment: {
        id: `eq-${id}`,
        name: 'Eq',
        min_temp: 2,
        max_temp: 8,
        location_id: locationId,
      },
    },
  };
}

beforeEach(() => {
  mockTerminalResult.data = null;
  mockTerminalResult.error = null;
  vi.clearAllMocks();
  (isDevBypassEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);
  fakeChannel.on.mockClear();
  fakeChannel.subscribe.mockClear();
  (supabase.removeChannel as ReturnType<typeof vi.fn>).mockClear();
  useIncidentStore.getState().reset();
});

describe('useIncidentStore · fetchOpenIncidents', () => {
  it('starts with empty open incidents and empty byLocation index', () => {
    const state = useIncidentStore.getState();
    expect(state.openIncidents).toEqual([]);
    expect(state.openIncidentsByLocation).toEqual(new Map());
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('does nothing if organizationId is empty', async () => {
    await useIncidentStore.getState().fetchOpenIncidents('');
    expect(useIncidentStore.getState().isLoading).toBe(false);
  });

  it('fetches open incidents and indexes by location', async () => {
    mockTerminalResult.data = [
      makeIncident('1', 'loc-1'),
      makeIncident('2', 'loc-1'),
      makeIncident('3', 'loc-2'),
    ];

    await useIncidentStore.getState().fetchOpenIncidents('org-1');

    const state = useIncidentStore.getState();
    expect(state.openIncidents).toHaveLength(3);
    expect(state.openIncidentsByLocation.get('loc-1')).toBe(2);
    expect(state.openIncidentsByLocation.get('loc-2')).toBe(1);
    expect(state.error).toBeNull();
  });

  it('stores error message when supabase returns an error', async () => {
    mockTerminalResult.error = { message: 'boom' };

    await useIncidentStore.getState().fetchOpenIncidents('org-1');

    const state = useIncidentStore.getState();
    expect(state.error).toBe('boom');
    expect(state.isLoading).toBe(false);
    expect(state.openIncidents).toEqual([]);
  });
});

describe('useIncidentStore · subscribeRealtime', () => {
  it('returns noop cleanup when orgId is empty', () => {
    const cleanup = useIncidentStore.getState().subscribeRealtime('');
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it('skips channel creation in dev-bypass', () => {
    (isDevBypassEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const cleanup = useIncidentStore.getState().subscribeRealtime('org-1');
    expect(supabase.channel).not.toHaveBeenCalled();
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('creates a single channel per org and removes it on cleanup', () => {
    const cleanup = useIncidentStore.getState().subscribeRealtime('org-1');

    expect(supabase.channel).toHaveBeenCalledWith('incidents:org:org-1');
    expect(fakeChannel.on).toHaveBeenCalledTimes(3);
    expect(fakeChannel.subscribe).toHaveBeenCalled();

    expect(useIncidentStore.getState().isSubscribed).toBe(true);
    expect(useIncidentStore.getState().subscribedOrgId).toBe('org-1');

    cleanup();

    expect(supabase.removeChannel).toHaveBeenCalledWith(fakeChannel);
    expect(useIncidentStore.getState().isSubscribed).toBe(false);
    expect(useIncidentStore.getState().subscribedOrgId).toBeNull();
  });

  it('is idempotent for the same orgId', () => {
    useIncidentStore.getState().subscribeRealtime('org-1');
    useIncidentStore.getState().subscribeRealtime('org-1');

    expect(supabase.channel).toHaveBeenCalledTimes(1);
  });
});

describe('useIncidentStore · upsertIncident', () => {
  it('adds a new open incident and updates byLocation index', () => {
    useIncidentStore.getState().upsertIncident(makeIncident('1', 'loc-1'));

    const state = useIncidentStore.getState();
    expect(state.openIncidents).toHaveLength(1);
    expect(state.openIncidentsByLocation.get('loc-1')).toBe(1);
  });

  it('removes from store when updated to resolved', () => {
    useIncidentStore.getState().upsertIncident(makeIncident('1', 'loc-1'));
    useIncidentStore.getState().upsertIncident(makeIncident('1', 'loc-1', 'resolved'));

    const state = useIncidentStore.getState();
    expect(state.openIncidents).toHaveLength(0);
    expect(state.openIncidentsByLocation.get('loc-1')).toBeUndefined();
  });

  it('updates existing open incident in place', () => {
    useIncidentStore.getState().upsertIncident(makeIncident('1', 'loc-1'));
    const updated = { ...makeIncident('1', 'loc-1'), description: 'updated' };
    useIncidentStore.getState().upsertIncident(updated);

    const state = useIncidentStore.getState();
    expect(state.openIncidents).toHaveLength(1);
    expect(state.openIncidents[0]?.description).toBe('updated');
  });

  it('ignores resolved incidents being inserted', () => {
    useIncidentStore.getState().upsertIncident(makeIncident('1', 'loc-1', 'resolved'));

    expect(useIncidentStore.getState().openIncidents).toHaveLength(0);
  });
});

describe('useIncidentStore · removeIncident', () => {
  it('removes incident and updates byLocation index', () => {
    useIncidentStore.getState().upsertIncident(makeIncident('1', 'loc-1'));
    useIncidentStore.getState().upsertIncident(makeIncident('2', 'loc-1'));
    useIncidentStore.getState().removeIncident('1');

    const state = useIncidentStore.getState();
    expect(state.openIncidents).toHaveLength(1);
    expect(state.openIncidentsByLocation.get('loc-1')).toBe(1);
  });

  it('is a noop when id is unknown', () => {
    useIncidentStore.getState().upsertIncident(makeIncident('1', 'loc-1'));
    useIncidentStore.getState().removeIncident('999');

    expect(useIncidentStore.getState().openIncidents).toHaveLength(1);
  });
});

describe('useIncidentStore · reset', () => {
  it('clears state including realtime flags', () => {
    useIncidentStore.setState({
      openIncidents: [makeIncident('1', 'loc-1')],
      error: 'old',
      isSubscribed: true,
      subscribedOrgId: 'org-1',
    });
    useIncidentStore.getState().reset();

    const state = useIncidentStore.getState();
    expect(state.openIncidents).toEqual([]);
    expect(state.openIncidentsByLocation).toEqual(new Map());
    expect(state.error).toBeNull();
    expect(state.isSubscribed).toBe(false);
    expect(state.subscribedOrgId).toBeNull();
  });
});

describe('incident selectors', () => {
  it('selectOpenIncidentCount returns array length', () => {
    expect(selectOpenIncidentCount({ openIncidents: [] })).toBe(0);
    expect(
      selectOpenIncidentCount({
        openIncidents: [{ id: 'a' } as never, { id: 'b' } as never],
      })
    ).toBe(2);
  });

  it('selectOpenIncidentsByLocation returns the map by reference', () => {
    const map = new Map([['loc-1', 3]]);
    expect(selectOpenIncidentsByLocation({ openIncidentsByLocation: map })).toBe(map);
  });

  it('selectHasOpenIncidents is true when count > 0', () => {
    expect(selectHasOpenIncidents({ openIncidents: [] })).toBe(false);
    expect(selectHasOpenIncidents({ openIncidents: [{ id: 'a' } as never] })).toBe(true);
  });

  it('selectIncidentsError returns the error string', () => {
    expect(selectIncidentsError({ error: null })).toBeNull();
    expect(selectIncidentsError({ error: 'msg' })).toBe('msg');
  });
});