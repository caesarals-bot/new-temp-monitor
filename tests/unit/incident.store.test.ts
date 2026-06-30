import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockTerminalResult: { data: unknown; error: unknown } = { data: null, error: null };

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: () => {
      const builder: Record<string, unknown> = {};
      builder.select = vi.fn(() => builder);
      builder.eq = vi.fn(() => builder);
      builder.then = (resolve: (v: unknown) => void) => resolve(mockTerminalResult);
      return builder;
    },
  },
}));

import { useIncidentStore, selectOpenIncidentCount, selectHasOpenIncidents } from '@/features/incidents/store/incident.store';

beforeEach(() => {
  mockTerminalResult.data = null;
  mockTerminalResult.error = null;
  useIncidentStore.getState().reset();
});

describe('useIncidentStore', () => {
  it('starts with empty open incidents', () => {
    const state = useIncidentStore.getState();
    expect(state.openIncidents).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('does nothing if organizationId is empty', async () => {
    const store = useIncidentStore.getState();
    await store.fetchOpenIncidents('');
    expect(useIncidentStore.getState().isLoading).toBe(false);
  });

  it('fetches open incidents from supabase filtered by org', async () => {
    mockTerminalResult.data = [
      { id: 'inc-1', status: 'open', reading_id: 'r-1', description: 'd', action_taken: null, resolved_by: null, resolved_at: null, created_at: '2026-06-30' },
      { id: 'inc-2', status: 'open', reading_id: 'r-2', description: 'd', action_taken: null, resolved_by: null, resolved_at: null, created_at: '2026-06-30' },
    ];

    await useIncidentStore.getState().fetchOpenIncidents('org-1');

    const state = useIncidentStore.getState();
    expect(state.openIncidents).toHaveLength(2);
    expect(state.isLoading).toBe(false);
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

  it('subscribeRealtime is a noop returning a cleanup function in B3 (placeholder)', () => {
    const cleanup = useIncidentStore.getState().subscribeRealtime('org-1');
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });

  it('reset clears state', () => {
    useIncidentStore.setState({
      openIncidents: [{ id: 'x', status: 'open', reading_id: 'r', description: 'd', action_taken: null, resolved_by: null, resolved_at: null, created_at: '2026-06-30' }],
      error: 'old',
    });
    useIncidentStore.getState().reset();

    const state = useIncidentStore.getState();
    expect(state.openIncidents).toEqual([]);
    expect(state.error).toBeNull();
  });
});

describe('incident selectors', () => {
  it('selectOpenIncidentCount returns array length', () => {
    expect(selectOpenIncidentCount({ openIncidents: [] })).toBe(0);
    expect(selectOpenIncidentCount({ openIncidents: [{ id: 'a' } as never, { id: 'b' } as never] })).toBe(2);
  });

  it('selectHasOpenIncidents returns true when count > 0', () => {
    expect(selectHasOpenIncidents({ openIncidents: [] })).toBe(false);
    expect(selectHasOpenIncidents({ openIncidents: [{ id: 'a' } as never] })).toBe(true);
  });
});
