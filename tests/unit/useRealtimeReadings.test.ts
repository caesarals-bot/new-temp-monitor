import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

let mockDevBypass = false;
let mockLocationId: string | null = 'loc-1';
let mockEnabled = true;

vi.mock('@/shared/lib/dev-bypass', () => ({
  isDevBypassEnabled: () => mockDevBypass,
}));

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeLocationId: mockLocationId }),
}));

const channelInstances: Array<{
  on: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
}> = [];

const mocks = vi.hoisted(() => ({
  removeChannel: vi.fn(),
}));

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    channel: vi.fn((name: string) => {
      const handlers: Record<string, ((payload: unknown) => void)[]> = {};
      const on = vi.fn((event: string, opts: unknown, cb?: (payload: unknown) => void) => {
        if (event === 'postgres_changes') {
          const key = `${opts ? JSON.stringify(opts) : 'no-opts'}`;
          handlers[key] = handlers[key] ?? [];
          if (cb) handlers[key].push(cb);
        }
        return channelInstances[channelInstances.length - 1];
      });
      const instance = {
        on,
        subscribe: vi.fn((cb?: (status: string, err?: unknown) => void) => {
          if (cb) cb('SUBSCRIBED', null);
          return channelInstances[channelInstances.length - 1];
        }),
      };
      channelInstances.push(instance);
      void name;
      return instance;
    }),
    removeChannel: mocks.removeChannel,
  },
}));

import { useRealtimeReadings } from '@/features/readings/hooks/useRealtimeReadings';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.removeChannel.mockClear();
  channelInstances.length = 0;
  mockDevBypass = false;
  mockLocationId = 'loc-1';
  mockEnabled = true;
});

describe('useRealtimeReadings · initial state', () => {
  it('returns empty map and not subscribed before effect runs', () => {
    mockDevBypass = true;

    const { result } = renderHook(() =>
      useRealtimeReadings({ locationId: 'loc-1', enabled: true })
    );

    expect(result.current.latestByEquipment.size).toBe(0);
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useRealtimeReadings · dev-bypass short-circuit', () => {
  it('does not create a channel when bypass is enabled', () => {
    mockDevBypass = true;

    const { result } = renderHook(() =>
      useRealtimeReadings({ locationId: 'loc-1', enabled: true })
    );

    expect(channelInstances.length).toBe(0);
    expect(result.current.isSubscribed).toBe(false);
  });
});

describe('useRealtimeReadings · disabled / no location', () => {
  it('does not subscribe when locationId is null', () => {
    mockLocationId = null;

    const { result } = renderHook(() =>
      useRealtimeReadings({ locationId: null, enabled: true })
    );

    expect(channelInstances.length).toBe(0);
    expect(result.current.isSubscribed).toBe(false);
  });

  it('does not subscribe when enabled is false', () => {
    mockEnabled = false;

    const { result } = renderHook(() =>
      useRealtimeReadings({ locationId: 'loc-1', enabled: false })
    );

    expect(channelInstances.length).toBe(0);
    expect(result.current.isSubscribed).toBe(false);
  });
});

describe('useRealtimeReadings · subscription lifecycle', () => {
  it('subscribes to a channel scoped by locationId', () => {
    const { result } = renderHook(() =>
      useRealtimeReadings({ locationId: 'loc-1', enabled: true })
    );

    expect(channelInstances.length).toBe(1);
    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('removes the channel on unmount (memory leak prevention)', () => {
    const { unmount } = renderHook(() =>
      useRealtimeReadings({ locationId: 'loc-1', enabled: true })
    );

    expect(mocks.removeChannel).not.toHaveBeenCalled();
    unmount();
    expect(mocks.removeChannel).toHaveBeenCalledTimes(1);
  });

  it('removes the channel when locationId changes', () => {
    const { rerender } = renderHook(
      ({ id }: { id: string | null }) =>
        useRealtimeReadings({ locationId: id, enabled: true }),
      { initialProps: { id: 'loc-1' as string | null } }
    );

    expect(channelInstances.length).toBe(1);
    expect(mocks.removeChannel).not.toHaveBeenCalled();

    rerender({ id: 'loc-2' });
    expect(mocks.removeChannel).toHaveBeenCalledTimes(1);
    expect(channelInstances.length).toBe(2);
  });
});