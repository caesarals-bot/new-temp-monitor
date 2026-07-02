import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) => selector(useAuthStoreState),
    {
      getState: () => useAuthStoreState,
    }
  ),
}));

let useAuthStoreState: Record<string, unknown>;

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

beforeEach(() => {
  useAuthStoreState = {};
});

describe('ProtectedRoute', () => {
  it('shows loading spinner while not hydrated', () => {
    useAuthStoreState = {
      session: null,
      profile: null,
      isHydrated: false,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>SECRET</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('SECRET')).toBeNull();
    expect(screen.queryByText('LOGIN')).toBeNull();
  });

  it('redirects to /login when there is no session', () => {
    useAuthStoreState = {
      session: null,
      profile: null,
      isHydrated: true,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>SECRET</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    expect(screen.queryByText('SECRET')).toBeNull();
  });

  it('redirects to /onboarding when session exists but no organization in profile', () => {
    useAuthStoreState = {
      session: { user: { id: 'u1' } },
      profile: { id: 'u1', organization_id: null },
      isHydrated: true,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>SECRET</div>
              </ProtectedRoute>
            }
          />
          <Route path="/onboarding" element={<div>ONBOARDING</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('ONBOARDING')).toBeInTheDocument();
    expect(screen.queryByText('SECRET')).toBeNull();
  });

  it('renders children when session and organization exist (reentry case)', () => {
    useAuthStoreState = {
      session: { user: { id: 'u1' } },
      profile: { id: 'u1', organization_id: 'org-1' },
      isHydrated: true,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>SECRET</div>
              </ProtectedRoute>
            }
          />
          <Route path="/onboarding" element={<div>ONBOARDING</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('SECRET')).toBeInTheDocument();
    expect(screen.queryByText('ONBOARDING')).toBeNull();
  });

  it('does not enforce onboarding when requireOnboarding is false', () => {
    useAuthStoreState = {
      session: { user: { id: 'u1' } },
      profile: { id: 'u1', organization_id: null },
      isHydrated: true,
    };

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <div>WIZARD</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('WIZARD')).toBeInTheDocument();
  });
});
