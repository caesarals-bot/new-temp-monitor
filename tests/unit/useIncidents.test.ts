import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const { mocks, refs } = vi.hoisted(() => {
  const listIncidentsMock = vi.fn();
  const resolveIncidentMock = vi.fn();
  const upsertIncidentMock = vi.fn();
  return {
    mocks: { listIncidentsMock, resolveIncidentMock, upsertIncidentMock },
    refs: {
      listIncidentsMock,
      resolveIncidentMock,
      upsertIncidentMock,
    },
  };
});

const incidentState = {
  openIncidents: [] as Array<Record<string, unknown>>,
  openIncidentsByLocation: new Map<string, number>(),
  isLoading: false,
  error: null as string | null,
};

let mockOrganization: { id: string } | null = { id: 'org-1' };
let mockProfile: { id: string; role: string } | null = { id: 'u-1', role: 'owner' };

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ organization: mockOrganization }),
}));

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ profile: mockProfile }),
}));

vi.mock('@/features/incidents/store/incident.store', () => ({
  useIncidentStore: Object.assign(
    (selector: (s: typeof incidentState) => unknown) => selector(incidentState),
    {
      getState: () => ({
        ...incidentState,
        upsertIncident: mocks.upsertIncidentMock,
      }),
    }
  ),
  selectIsIncidentsLoading: (s: { isLoading: boolean }) => s.isLoading,
  selectIncidentsError: (s: { error: string | null }) => s.error,
}));

vi.mock('@/features/incidents/services/incidents.service', () => ({
  listIncidents: mocks.listIncidentsMock,
  resolveIncident: mocks.resolveIncidentMock,
}));

import { useIncidents } from '@/features/incidents/hooks/useIncidents';

const { listIncidentsMock, resolveIncidentMock, upsertIncidentMock } = refs;

beforeEach(() => {
  vi.clearAllMocks();
  mockOrganization = { id: 'org-1' };
  mockProfile = { id: 'u-1', role: 'owner' };
  incidentState.openIncidents = [];
  incidentState.openIncidentsByLocation = new Map();
  incidentState.isLoading = false;
  incidentState.error = null;
  listIncidentsMock.mockResolvedValue({ data: [], error: null });
});

describe('useIncidents · RBAC', () => {
  it('owner can resolve', async () => {
    mockProfile = { id: 'u-1', role: 'owner' };
    const { result } = renderHook(() => useIncidents());
    expect(result.current.canResolve).toBe(true);
  });

  it('admin can resolve', async () => {
    mockProfile = { id: 'u-1', role: 'admin' };
    const { result } = renderHook(() => useIncidents());
    expect(result.current.canResolve).toBe(true);
  });

  it('manager can resolve', async () => {
    mockProfile = { id: 'u-1', role: 'manager' };
    const { result } = renderHook(() => useIncidents());
    expect(result.current.canResolve).toBe(true);
  });

  it('staff cannot resolve', async () => {
    mockProfile = { id: 'u-1', role: 'staff' };
    const { result } = renderHook(() => useIncidents());
    expect(result.current.canResolve).toBe(false);
  });
});

describe('useIncidents · fetching', () => {
  it('fetches on mount with orgId and filters', async () => {
    renderHook(() => useIncidents());
    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalled();
    });
    expect(listIncidentsMock).toHaveBeenCalledWith({
      organizationId: 'org-1',
      filters: {},
    });
  });

  it('does not fetch when organization is null', () => {
    mockOrganization = null;
    renderHook(() => useIncidents());
    expect(listIncidentsMock).not.toHaveBeenCalled();
  });

  it('exposes listError from service error', async () => {
    listIncidentsMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'fetch failed' },
    });
    const { result } = renderHook(() => useIncidents());
    await waitFor(() => {
      expect(result.current.listError).toBe('fetch failed');
    });
  });

  it('refetches when filters change', async () => {
    const { result } = renderHook(() => useIncidents());
    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.setFilter('status', 'open');
    });

    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalledTimes(2);
    });
    expect(listIncidentsMock).toHaveBeenLastCalledWith({
      organizationId: 'org-1',
      filters: { status: 'open' },
    });
  });

  it('clearFilters resets filters and refetches', async () => {
    const { result } = renderHook(() => useIncidents());
    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.setFilter('status', 'open');
    });

    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalledTimes(2);
    });

    act(() => {
      result.current.setFilter('locationId', 'loc-1');
    });

    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalledTimes(3);
    });

    act(() => {
      result.current.clearFilters();
    });

    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalledTimes(4);
    });
    expect(listIncidentsMock).toHaveBeenLastCalledWith({
      organizationId: 'org-1',
      filters: {},
    });
  });
});

describe('useIncidents · resolution', () => {
  const sampleIncident = {
    id: 'inc-1',
    reading_id: 'r-1',
    status: 'open' as const,
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
        name: 'Eq',
        min_temp: 2,
        max_temp: 8,
        location_id: 'loc-1',
      },
    },
  };

  it('openResolve and closeResolve manage resolving state', async () => {
    const { result } = renderHook(() => useIncidents());
    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalled();
    });

    act(() => {
      result.current.openResolve(sampleIncident);
    });
    expect(result.current.resolving).toEqual(sampleIncident);

    act(() => {
      result.current.closeResolve();
    });
    expect(result.current.resolving).toBeNull();
  });

  it('submitResolve calls service, upserts store with resolved status, closes modal', async () => {
    resolveIncidentMock.mockResolvedValueOnce({ data: null, error: null });

    const { result } = renderHook(() => useIncidents());
    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalled();
    });

    act(() => {
      result.current.openResolve(sampleIncident);
    });

    await act(async () => {
      await result.current.submitResolve({ actionTaken: 'Se reubicó la mercadería al equipo de respaldo' });
    });

    expect(resolveIncidentMock).toHaveBeenCalledWith({
      incidentId: 'inc-1',
      actionTaken: 'Se reubicó la mercadería al equipo de respaldo',
      resolvedBy: 'u-1',
    });
    expect(upsertIncidentMock).toHaveBeenCalledWith({
      ...sampleIncident,
      status: 'resolved',
    });
    expect(result.current.resolving).toBeNull();
    expect(result.current.resolveError).toBeNull();
  });

  it('submitResolve surfaces resolveError and keeps modal open on failure', async () => {
    resolveIncidentMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'update failed' },
    });

    const { result } = renderHook(() => useIncidents());
    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalled();
    });

    act(() => {
      result.current.openResolve(sampleIncident);
    });

    await act(async () => {
      await result.current.submitResolve({
        actionTaken: 'Se reubicó la mercadería al equipo de respaldo',
      });
    });

    expect(result.current.resolveError).toBe('update failed');
    expect(result.current.resolving).toEqual(sampleIncident);
    expect(upsertIncidentMock).not.toHaveBeenCalled();
  });

  it('does nothing when resolving without a profile', async () => {
    mockProfile = null;
    const { result } = renderHook(() => useIncidents());
    await waitFor(() => {
      expect(listIncidentsMock).toHaveBeenCalled();
    });

    act(() => {
      result.current.openResolve(sampleIncident);
    });

    await act(async () => {
      await result.current.submitResolve({
        actionTaken: 'Se reubicó la mercadería al equipo de respaldo',
      });
    });

    expect(resolveIncidentMock).not.toHaveBeenCalled();
  });
});