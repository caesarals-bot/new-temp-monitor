import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/features/auth/services/auth.service', () => ({
  authService: {
    createOrganization: vi.fn(),
    createStaff: vi.fn(),
    createEquipment: vi.fn(),
  },
}));

vi.mock('@/features/locations/services/locations.service', () => ({
  createLocation: vi.fn(),
}));

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        fetchOrganization: vi.fn().mockResolvedValue(undefined),
        fetchLocations: vi.fn().mockResolvedValue(undefined),
        setActiveLocation: vi.fn(),
      }),
    {
      getState: () => ({
        setActiveLocation: vi.fn(),
      }),
    }
  ),
}));

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'profile-1' }, error: null }),
        }),
      }),
    }),
  },
}));

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        session: {
          user: {
            id: 'user-1',
            email: 'cesar@example.com',
            user_metadata: { full_name: 'Cesar' },
          },
        },
        setProfile: vi.fn(),
      }),
    {
      getState: () => ({
        session: {
          user: {
            id: 'user-1',
            email: 'cesar@example.com',
            user_metadata: { full_name: 'Cesar' },
          },
        },
      }),
    }
  ),
}));

import { authService } from '@/features/auth/services/auth.service';
import { createLocation } from '@/features/locations/services/locations.service';
import { useOnboarding } from '@/features/auth/hooks/useOnboarding';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useOnboarding', () => {
  it('starts at organization step', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.currentStep).toBe('organization');
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('advances through steps via nextStep and goes back via prevStep', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe('location');

    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe('staff');

    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe('location');

    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe('organization');

    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe('organization');
  });

  it('can skip directly to confirmation from staff/equipment', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe('confirmation');
  });

  it('accumulates staff and equipment without calling any service', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.addStaff({ name: 'Maria', role: 'Cocinero' }));
    act(() => result.current.addStaff({ name: 'Pedro', role: 'Auxiliar' }));
    expect(result.current.staffMembers).toHaveLength(2);

    act(() => result.current.removeStaff(0));
    expect(result.current.staffMembers).toEqual([{ name: 'Pedro', role: 'Auxiliar' }]);

    act(() => result.current.addEquipment({ name: 'Nevera 1', minTemp: 0, maxTemp: 8 }));
    act(() => result.current.removeEquipment(0));
    expect(result.current.equipment).toEqual([]);

    expect(authService.createStaff).not.toHaveBeenCalled();
    expect(authService.createEquipment).not.toHaveBeenCalled();
  });

  it('returns error if submitting without organization or location', async () => {
    const { result } = renderHook(() => useOnboarding());

    let res: { success: boolean } | undefined;
    await act(async () => {
      res = await result.current.submit();
    });

    expect(res).toEqual({ success: false });
    expect(result.current.error).toMatch(/Faltan datos obligatorios/);
    expect(authService.createOrganization).not.toHaveBeenCalled();
  });

  it('executes full submit cascade when organization and location are set', async () => {
    (authService.createOrganization as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: null,
      organizationId: 'org-1',
    });
    (createLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: 'loc-1', name: 'Casa Central', address: null, organization_id: 'org-1' },
      error: null,
    });
    (authService.createStaff as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
    (authService.createEquipment as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.setOrganization({
      name: 'Mi Empresa',
      businessType: 'restaurant',
      planType: 'basic',
    }));
    act(() => result.current.setLocation({ name: 'Casa Central', address: 'Av. 123' }));
    act(() => result.current.addStaff({ name: 'Maria', role: 'Cocinero' }));
    act(() => result.current.addEquipment({ name: 'Nevera 1', minTemp: 0, maxTemp: 8, physicalLocation: 'Cocina' }));

    let res: { success: boolean } | undefined;
    await act(async () => {
      res = await result.current.submit();
    });

    expect(res).toEqual({ success: true });
    expect(authService.createOrganization).toHaveBeenCalledOnce();
    expect(createLocation).toHaveBeenCalledOnce();
    expect(authService.createStaff).toHaveBeenCalledOnce();
    expect(authService.createEquipment).toHaveBeenCalledOnce();
    expect(result.current.error).toBeNull();
  });
});
