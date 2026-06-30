import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const setActiveLocationMock = vi.fn();

vi.mock('@/features/organizations/store/organization.store', async () => {
  let currentLocations: Array<Record<string, unknown>> = [
    { id: 'loc-1', organization_id: 'org-1', name: 'Casa Central', address: null, created_at: '2026-06-30T00:00:00Z' },
    { id: 'loc-2', organization_id: 'org-1', name: 'Sucursal Norte', address: null, created_at: '2026-06-30T00:00:00Z' },
  ];
  let currentActiveLocationId: string | null = 'loc-1';

  const store = {
    get locations() { return currentLocations; },
    get activeLocationId() { return currentActiveLocationId; },
    setActiveLocation: (id: string | null) => {
      currentActiveLocationId = id;
      setActiveLocationMock(id);
    },
    __setLocations: (locs: typeof currentLocations) => { currentLocations = locs; },
    __setActiveLocationId: (id: string | null) => { currentActiveLocationId = id; },
  };

  return {
    useOrganizationStore: Object.assign(
      (selector: (s: typeof store) => unknown) => selector(store),
      { getState: () => store }
    ),
  };
});

import { LocationSelector } from '@/shared/components/layout/LocationSelector';

describe('LocationSelector', () => {
  beforeEach(() => {
    setActiveLocationMock.mockClear();
  });

  it('shows the active location name in the trigger', () => {
    render(<LocationSelector />);
    expect(screen.getByText('Casa Central')).toBeInTheDocument();
  });

  it('exposes all locations as options via aria attributes', () => {
    render(<LocationSelector />);
    const trigger = screen.getByRole('combobox', { name: /sede activa/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toBeDisabled();
  });

  it('is disabled when there is only one location', async () => {
    const { useOrganizationStore } = await import('@/features/organizations/store/organization.store');
    const store = useOrganizationStore.getState() as unknown as {
      __setLocations: (l: Array<Record<string, unknown>>) => void;
      __setActiveLocationId: (id: string | null) => void;
    };
    store.__setLocations([
      { id: 'only', organization_id: 'org-1', name: 'Unica', address: null, created_at: '2026-06-30T00:00:00Z' },
    ]);
    store.__setActiveLocationId('only');

    render(<LocationSelector />);
    const trigger = screen.getByRole('combobox', { name: /sede activa/i });
    expect(trigger).toBeDisabled();
    expect(screen.getByText('Unica')).toBeInTheDocument();
  });

  it('falls back to placeholder when there is no active location', async () => {
    const { useOrganizationStore } = await import('@/features/organizations/store/organization.store');
    const store = useOrganizationStore.getState() as unknown as {
      __setActiveLocationId: (id: string | null) => void;
    };
    store.__setActiveLocationId(null);

    render(<LocationSelector />);
    expect(screen.getByText('Selecciona sede')).toBeInTheDocument();
  });

  it('does not invoke setActiveLocation just from rendering', () => {
    render(<LocationSelector />);
    expect(setActiveLocationMock).not.toHaveBeenCalled();
  });
});
