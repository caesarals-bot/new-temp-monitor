import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

let mockBypassEnabled = true;

vi.mock('@/shared/lib/dev-bypass', () => ({
  isDevBypassEnabled: () => mockBypassEnabled,
  getDevMockIncidents: (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `mock-${i}`,
      status: 'open',
      description: `mock ${i}`,
      action_taken: null,
      resolved_by: null,
      resolved_at: null,
      reading_id: 'mock-reading',
      created_at: '2026-06-30T00:00:00Z',
    })),
}));

let mockOrganization: { id: string } | null = { id: 'org-1' };

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: (selector: (s: { organization: typeof mockOrganization }) => unknown) =>
    selector({ organization: mockOrganization }),
}));

const fetchOpenIncidentsMock = vi.fn();
const subscribeRealtimeMock = vi.fn(() => () => {});

vi.mock('@/features/incidents/store/incident.store', () => ({
  useIncidentStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        fetchOpenIncidents: fetchOpenIncidentsMock,
        subscribeRealtime: subscribeRealtimeMock,
      }),
    { getState: () => ({}), setState: vi.fn() }
  ),
}));

import { useIncidentsBootstrap } from '@/features/incidents/hooks/useIncidentsBootstrap';

beforeEach(() => {
  vi.clearAllMocks();
  mockOrganization = { id: 'org-1' };
  mockBypassEnabled = true;
});

describe('useIncidentsBootstrap', () => {
  it('does nothing when there is no organization', () => {
    mockOrganization = null;
    renderHook(() => useIncidentsBootstrap());
    expect(fetchOpenIncidentsMock).not.toHaveBeenCalled();
  });

  it('with bypass enabled, sets the store with mock incidents', () => {
    mockBypassEnabled = true;
    renderHook(() => useIncidentsBootstrap());
    expect(fetchOpenIncidentsMock).not.toHaveBeenCalled();
  });

  it('with bypass disabled, calls fetchOpenIncidents and subscribes to realtime', () => {
    mockBypassEnabled = false;
    renderHook(() => useIncidentsBootstrap());
    expect(fetchOpenIncidentsMock).toHaveBeenCalledWith('org-1');
    expect(subscribeRealtimeMock).toHaveBeenCalledWith('org-1');
  });
});
