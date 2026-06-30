import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

let mockOrg: Record<string, unknown> | null = {
  id: 'org-1',
  name: 'Empresa Demo',
  business_type: 'restaurant',
  status: 'active',
  plan_type: 'pro',
  max_locations: 3,
  created_by: 'u',
  created_at: '2026-06-30T00:00:00Z',
};
let mockPlatformAdmin = false;

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) => selector({ organization: mockOrg }),
    { getState: () => ({ organization: mockOrg }) }
  ),
}));

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({ profile: { id: 'u', organization_id: 'org', role: 'owner', is_platform_admin: mockPlatformAdmin } }),
    { getState: () => ({}) }
  ),
}));

vi.mock('@/features/incidents/store/incident.store', () => ({
  useIncidentStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ openIncidents: [] }),
  selectOpenIncidentCount: () => 0,
}));

import { Sidebar } from '@/shared/components/layout/Sidebar';

beforeEach(() => {
  mockPlatformAdmin = false;
  mockOrg = {
    id: 'org-1',
    name: 'Empresa Demo',
    business_type: 'restaurant',
    status: 'active',
    plan_type: 'pro',
    max_locations: 3,
    created_by: 'u',
    created_at: '2026-06-30T00:00:00Z',
  };
});

describe('Sidebar', () => {
  it('renders the brand name', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('TempMonitor')).toBeInTheDocument();
  });

  it('renders organization name', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('Empresa Demo')).toBeInTheDocument();
  });

  it('renders plan badge with plan_type=pro', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('Plan Pro')).toBeInTheDocument();
  });

  it('renders all owner navigation items', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Sedes')).toBeInTheDocument();
    expect(screen.getByText('Equipos')).toBeInTheDocument();
    expect(screen.getByText('Lecturas')).toBeInTheDocument();
    expect(screen.getByText('Incidentes')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });

  it('shows fallback text when no organization', () => {
    mockOrg = null;
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('Sin organización')).toBeInTheDocument();
  });

  it('is hidden from screen readers via aria-label', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/navegación de la aplicación/i)).toBeInTheDocument();
  });

  it('default mode (fixed) is hidden on mobile via hidden class', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    const aside = screen.getByLabelText(/navegación de la aplicación/i);
    expect(aside.className).toMatch(/\bhidden\b/);
    expect(aside.className).toMatch(/\bmd:flex\b/);
  });
});

describe('Sidebar - drawer mode', () => {
  it('does not render visible content when isOpen=false', () => {
    render(
      <MemoryRouter>
        <Sidebar mode="drawer" isOpen={false} />
      </MemoryRouter>
    );
    const aside = screen.getByLabelText(/menú de navegación/i);
    expect(aside.className).toMatch(/translate-x-full/);
    expect(aside).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders visible and shows close button when isOpen=true', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar mode="drawer" isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );
    const aside = screen.getByLabelText(/menú de navegación/i);
    expect(aside.className).toMatch(/translate-x-0/);
    expect(aside).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByLabelText(/cerrar menú/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar mode="drawer" isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );
    await user.click(screen.getByLabelText(/cerrar menú/i));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('Sidebar - platform admin mode', () => {
  it('hides organization block and shows Platform Admin footer', () => {
    mockPlatformAdmin = true;
    mockOrg = null;
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.queryByText('Empresa Demo')).toBeNull();
    expect(screen.queryByText(/^Organización$/)).toBeNull();
    expect(screen.getByText('Modo Platform Admin')).toBeInTheDocument();
  });

  it('drawer mode also reflects platform admin footer', () => {
    mockPlatformAdmin = true;
    mockOrg = null;
    render(
      <MemoryRouter>
        <Sidebar mode="drawer" isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText('Modo Platform Admin')).toBeInTheDocument();
  });
});
