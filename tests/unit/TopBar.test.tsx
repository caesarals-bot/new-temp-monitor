import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

const signOutMock = vi.fn();

let mockProfile: Record<string, unknown> | null = {
  id: 'u',
  email: 'dev@tempmonitor.local',
  full_name: 'Dev User',
  organization_id: 'org',
  role: 'owner',
  is_platform_admin: false,
};

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) => selector({ profile: mockProfile, signOut: signOutMock }),
    { getState: () => ({}) }
  ),
}));

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        locations: [
          { id: 'loc-1', organization_id: 'org-1', name: 'Casa Central', address: null, created_at: '2026-06-30' },
          { id: 'loc-2', organization_id: 'org-1', name: 'Sucursal Norte', address: null, created_at: '2026-06-30' },
        ],
        activeLocationId: 'loc-1',
      }),
    { getState: () => ({}) }
  ),
}));

import { TopBar } from '@/shared/components/layout/TopBar';

beforeEach(() => {
  vi.clearAllMocks();
  mockProfile = {
    id: 'u',
    email: 'dev@tempmonitor.local',
    full_name: 'Dev User',
    organization_id: 'org',
    role: 'owner',
    is_platform_admin: false,
  };
});

describe('TopBar', () => {
  function renderTopBar(props?: { onMenuClick?: () => void }) {
    return render(
      <MemoryRouter>
        <TopBar {...props} />
      </MemoryRouter>
    );
  }

  it('renders user display name', () => {
    renderTopBar();
    expect(screen.getByText('Dev User')).toBeInTheDocument();
  });

  it('shows initials avatar (DU)', () => {
    renderTopBar();
    expect(screen.getByText('DU')).toBeInTheDocument();
  });

  it('falls back to single-letter initial when no full_name', () => {
    mockProfile = {
      id: 'u',
      email: 'dev@tempmonitor.local',
      organization_id: 'org',
      role: 'owner',
      is_platform_admin: false,
    };
    renderTopBar();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('shows hamburger button (mobile only)', () => {
    renderTopBar();
    expect(screen.getByLabelText(/abrir menú/i)).toBeInTheDocument();
  });

  it('fires onMenuClick when hamburger is clicked', async () => {
    const onMenuClick = vi.fn();
    const user = userEvent.setup();
    renderTopBar({ onMenuClick });
    await user.click(screen.getByLabelText(/abrir menú/i));
    expect(onMenuClick).toHaveBeenCalledOnce();
  });

  it('renders LocationSelector', () => {
    renderTopBar();
    expect(screen.getByText('Casa Central')).toBeInTheDocument();
  });

  it('calls signOut when logout is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderTopBar();

    await user.click(screen.getByLabelText(/menú de usuario/i));

    const logoutItem = await screen.findByText(/cerrar sesión/i);
    await user.click(logoutItem);

    expect(signOutMock).toHaveBeenCalledOnce();
  });
});
