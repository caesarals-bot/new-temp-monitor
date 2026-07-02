import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    listOrganizations: vi.fn(),
    getGlobalMetrics: vi.fn(),
    updateOrganizationStatus: vi.fn(),
  },
}));

let mockProfile: { is_platform_admin: boolean; role: string; id: string } | null = {
  is_platform_admin: true,
  role: 'owner',
  id: 'u-admin',
};

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ profile: mockProfile }),
}));

vi.mock('@/features/platform-admin/services/platform-admin.service', () => ({
  listOrganizations: mocks.listOrganizations,
  getGlobalMetrics: mocks.getGlobalMetrics,
  updateOrganizationStatus: mocks.updateOrganizationStatus,
}));

import { usePlatformAdmin } from '@/features/platform-admin/hooks/usePlatformAdmin';

beforeEach(() => {
  vi.clearAllMocks();
  mockProfile = { is_platform_admin: true, role: 'owner', id: 'u-admin' };
  mocks.listOrganizations.mockResolvedValue({ data: [], error: null });
  mocks.getGlobalMetrics.mockResolvedValue({ data: null, error: null });
});

describe('usePlatformAdmin · RBAC', () => {
  it('returns isPlatformAdmin=false when profile lacks flag', async () => {
    mockProfile = { is_platform_admin: false, role: 'owner', id: 'u-1' };
    const { result } = renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(mocks.listOrganizations).not.toHaveBeenCalled();
    });
    expect(result.current.isPlatformAdmin).toBe(false);
  });
});

describe('usePlatformAdmin · fetching', () => {
  it('fetches list and metrics in parallel on mount', async () => {
    renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(mocks.listOrganizations).toHaveBeenCalled();
    });
    expect(mocks.getGlobalMetrics).toHaveBeenCalled();
  });

  it('surfaces listError from service', async () => {
    mocks.listOrganizations.mockResolvedValueOnce({
      data: null,
      error: { message: 'boom' },
    });

    const { result } = renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(result.current.listError).toBe('boom');
    });
  });

  it('surfaces metricsError from service', async () => {
    mocks.getGlobalMetrics.mockResolvedValueOnce({
      data: null,
      error: { message: 'metrics boom' },
    });

    const { result } = renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(result.current.metricsError).toBe('metrics boom');
    });
  });

  it('refetches list when filter changes', async () => {
    const { result } = renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(mocks.listOrganizations).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.setFilter('status', 'paused');
    });

    await waitFor(() => {
      expect(mocks.listOrganizations).toHaveBeenCalledTimes(2);
    });
    expect(mocks.listOrganizations).toHaveBeenLastCalledWith({
      status: 'paused',
    });
  });

  it('clearFilters resets filters and refetches', async () => {
    const { result } = renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(mocks.listOrganizations).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.setFilter('status', 'active');
    });

    await waitFor(() => {
      expect(mocks.listOrganizations).toHaveBeenCalledTimes(2);
    });

    act(() => {
      result.current.setFilter('planType', 'pro');
    });

    await waitFor(() => {
      expect(mocks.listOrganizations).toHaveBeenCalledTimes(3);
    });

    act(() => {
      result.current.clearFilters();
    });

    await waitFor(() => {
      expect(mocks.listOrganizations).toHaveBeenCalledTimes(4);
    });
    expect(mocks.listOrganizations).toHaveBeenLastCalledWith({});
  });
});

describe('usePlatformAdmin · status change', () => {
  const sampleOrg = {
    id: 'org-1',
    name: 'Test',
    business_type: 'restaurant' as const,
    status: 'active' as const,
    plan_type: 'pro' as const,
    max_locations: 5,
    created_at: '2026-06-01T00:00:00Z',
    locations_count: 2,
    profiles_count: 3,
    equipment_count: 8,
  };

  it('openStatusDialog and closeStatusDialog manage dialog state', async () => {
    const { result } = renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(mocks.listOrganizations).toHaveBeenCalled();
    });

    act(() => {
      result.current.openStatusDialog(sampleOrg);
    });
    expect(result.current.changingStatusFor).toEqual(sampleOrg);

    act(() => {
      result.current.closeStatusDialog();
    });
    expect(result.current.changingStatusFor).toBeNull();
  });

  it('submitStatusChange calls service, updates list and closes dialog', async () => {
    mocks.listOrganizations.mockResolvedValue({ data: [sampleOrg], error: null });
    mocks.updateOrganizationStatus.mockResolvedValueOnce({ data: null, error: null });

    const { result } = renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(result.current.organizations.length).toBe(1);
    });

    act(() => {
      result.current.openStatusDialog(sampleOrg);
    });

    await act(async () => {
      await result.current.submitStatusChange('suspended');
    });

    expect(mocks.updateOrganizationStatus).toHaveBeenCalledWith('org-1', 'suspended');
    expect(result.current.changingStatusFor).toBeNull();
    expect(result.current.organizations[0]?.status).toBe('suspended');
    expect(mocks.getGlobalMetrics).toHaveBeenCalledTimes(2);
  });

  it('submitStatusChange surfaces statusError on failure', async () => {
    mocks.listOrganizations.mockResolvedValue({ data: [sampleOrg], error: null });
    mocks.updateOrganizationStatus.mockResolvedValueOnce({
      data: null,
      error: { message: 'rls denied' },
    });

    const { result } = renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(result.current.organizations.length).toBe(1);
    });

    act(() => {
      result.current.openStatusDialog(sampleOrg);
    });

    await act(async () => {
      await result.current.submitStatusChange('paused');
    });

    expect(result.current.statusError).toBe('rls denied');
    expect(result.current.changingStatusFor).toEqual(sampleOrg);
  });
});

describe('usePlatformAdmin · pagination', () => {
  it('pages 50 records per page', async () => {
    const orgs = Array.from({ length: 120 }, (_, i) => ({
      id: `org-${i}`,
      name: `Org ${i}`,
      business_type: null,
      status: 'active' as const,
      plan_type: 'pro' as const,
      max_locations: 1,
      created_at: '2026-06-01T00:00:00Z',
      locations_count: 0,
      profiles_count: 0,
      equipment_count: 0,
    }));
    mocks.listOrganizations.mockResolvedValue({ data: orgs, error: null });

    const { result } = renderHook(() => usePlatformAdmin());
    await waitFor(() => {
      expect(result.current.organizations.length).toBe(120);
    });

    expect(result.current.totalPages).toBe(3);
    expect(result.current.pageOrganizations).toHaveLength(50);

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.pageOrganizations).toHaveLength(20);
  });
});
