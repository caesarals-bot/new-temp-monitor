import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

let mockProfile: Record<string, unknown> = {
  id: 'u',
  organization_id: 'org',
  role: 'owner',
  is_platform_admin: false,
};

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) => selector({ profile: mockProfile }),
    { getState: () => ({}) }
  ),
}));

let mockIncidentCount = 0;

vi.mock('@/features/incidents/store/incident.store', () => ({
  useIncidentStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ openIncidents: new Array(mockIncidentCount).fill({ id: 'i' }) }),
  selectOpenIncidentCount: (state: { openIncidents: unknown[] }) => state.openIncidents.length,
}));

import { NavItems } from '@/shared/components/layout/NavItems';

beforeEach(() => {
  mockIncidentCount = 0;
  mockProfile = {
    id: 'u',
    organization_id: 'org',
    role: 'owner',
    is_platform_admin: false,
  };
});

describe('NavItems - owner role', () => {
  it('renders 7 items', () => {
    render(
      <MemoryRouter>
        <NavItems />
      </MemoryRouter>
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(7);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Sedes')).toBeInTheDocument();
    expect(screen.getByText('Equipos')).toBeInTheDocument();
    expect(screen.getByText('Lecturas')).toBeInTheDocument();
    expect(screen.getByText('Incidentes')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });

  it('does not show incidents badge when count is 0', () => {
    render(
      <MemoryRouter>
        <NavItems />
      </MemoryRouter>
    );
    expect(screen.queryByText('0')).toBeNull();
  });

  it('shows the open incident count next to Incidentes', () => {
    mockIncidentCount = 3;

    render(
      <MemoryRouter>
        <NavItems />
      </MemoryRouter>
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('marks the active route with aria-current="page"', () => {
    render(
      <MemoryRouter initialEntries={['/equipment']}>
        <NavItems />
      </MemoryRouter>
    );

    const equipmentLink = screen.getByRole('link', { name: /equipos/i });
    expect(equipmentLink).toHaveAttribute('aria-current', 'page');

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).not.toHaveAttribute('aria-current');
  });
});

describe('NavItems - staff role', () => {
  it('renders only the Lecturas item', () => {
    mockProfile = {
      id: 'u',
      organization_id: 'org',
      role: 'staff',
      is_platform_admin: false,
    };

    render(
      <MemoryRouter>
        <NavItems />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(screen.getByText('Lecturas')).toBeInTheDocument();
  });
});
