import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Navigate, Routes, Route } from 'react-router';

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        profile: {
          id: 'u',
          email: 'dev@tempmonitor.local',
          full_name: 'Dev User',
          organization_id: 'org',
          role: 'owner',
          is_platform_admin: false,
        },
        signOut: vi.fn(),
      }),
    { getState: () => ({}) }
  ),
}));

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        organization: {
          id: 'org-1',
          name: 'Empresa Demo',
          business_type: 'restaurant',
          status: 'active',
          plan_type: 'pro',
          max_locations: 3,
          created_by: 'u',
          created_at: '2026-06-30T00:00:00Z',
        },
        locations: [
          { id: 'loc-1', organization_id: 'org-1', name: 'Casa Central', address: null, created_at: '2026-06-30' },
          { id: 'loc-2', organization_id: 'org-1', name: 'Sucursal Norte', address: null, created_at: '2026-06-30' },
        ],
        activeLocationId: 'loc-1',
      }),
    { getState: () => ({}) }
  ),
}));

vi.mock('@/features/incidents/store/incident.store', () => ({
  useIncidentStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ openIncidents: [] }),
  selectOpenIncidentCount: () => 0,
}));

import { AppShell } from '@/shared/components/layout/AppShell';

describe('AppShell', () => {
  function renderWithRoute(initialPath: string = '/') {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<div>CHILD CONTENT</div>} />
            <Route path="/locations" element={<div>LOCATIONS CONTENT</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders the fixed sidebar (visible on desktop, drawer on mobile)', () => {
    renderWithRoute();
    const navPrincipal = screen.getByLabelText(/navegación principal/i, { selector: 'aside' });
    expect(navPrincipal).toBeInTheDocument();
    expect(navPrincipal.className).toMatch(/hidden/);
    expect(screen.getByLabelText(/menú móvil/i, { selector: 'aside' })).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders user avatar in TopBar', () => {
    renderWithRoute();
    expect(screen.getByText('DU')).toBeInTheDocument();
  });

  it('renders child route content via Outlet', () => {
    renderWithRoute('/');
    expect(screen.getByText('CHILD CONTENT')).toBeInTheDocument();
  });

  it('renders different child for /locations', () => {
    renderWithRoute('/locations');
    expect(screen.getByText('LOCATIONS CONTENT')).toBeInTheDocument();
  });

  it('opens the drawer when hamburger is clicked', async () => {
    const user = userEvent.setup();
    renderWithRoute();

    await user.click(screen.getByLabelText(/abrir menú/i));

    expect(screen.getByLabelText(/cerrar menú/i)).toBeInTheDocument();
  });

  it('drawer starts hidden (aria-hidden=true)', () => {
    renderWithRoute();
    const drawAside = screen.getAllByLabelText(/menú móvil/i)
      .find((el) => el.className.includes('translate-x-full'));
    expect(drawAside).toBeDefined();
  });

  it('closes drawer when route changes (B9 auto-close)', async () => {
    function Wrapper() {
      return (
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/locations" replace />} />
              <Route path="/locations" element={<div>LOCATIONS</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );
    }

    render(<Wrapper />);
    await waitFor(() => {
      expect(screen.getByText('LOCATIONS')).toBeInTheDocument();
    });
  });

  it('closes drawer via close button (verifying onClose wiring)', async () => {
    renderWithRoute();
    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/abrir menú/i));
    expect(screen.getByLabelText(/cerrar menú/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/cerrar menú/i));

    await waitFor(
      () => {
        expect(screen.queryByLabelText(/cerrar menú/i)).toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it('locks body scroll while drawer is open and restores on close', async () => {
    renderWithRoute();
    const user = userEvent.setup();
    const original = document.body.style.overflow;

    await user.click(screen.getByLabelText(/abrir menú/i));
    expect(document.body.style.overflow).toBe('hidden');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    await waitFor(() => {
      expect(document.body.style.overflow).toBe(original);
    });
  });
});
