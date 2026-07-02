import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('dev-bypass', () => {
  const originalEnv = import.meta.env.VITE_DEV_BYPASS_AUTH;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete import.meta.env.VITE_DEV_BYPASS_AUTH;
    } else {
      import.meta.env.VITE_DEV_BYPASS_AUTH = originalEnv;
    }
  });

  it('isDevBypassEnabled returns false when flag is not set', async () => {
    delete import.meta.env.VITE_DEV_BYPASS_AUTH;
    const { isDevBypassEnabled } = await import('@/shared/lib/dev-bypass');
    expect(isDevBypassEnabled()).toBe(false);
  });

  it('isDevBypassEnabled returns false when flag is anything other than "true"', async () => {
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'yes';
    const { isDevBypassEnabled } = await import('@/shared/lib/dev-bypass');
    expect(isDevBypassEnabled()).toBe(false);
  });

  it('isDevBypassEnabled returns true when flag is "true"', async () => {
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'true';
    const { isDevBypassEnabled } = await import('@/shared/lib/dev-bypass');
    expect(isDevBypassEnabled()).toBe(true);
  });

  it('getDevMockUser returns a user with dev email', async () => {
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'true';
    const { getDevMockUser } = await import('@/shared/lib/dev-bypass');
    const user = getDevMockUser();
    expect(user.email).toBe('dev@tempmonitor.local');
    expect(user.id).toBeTruthy();
  });

  it('getDevMockSession exposes a session wrapping the dev user', async () => {
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'true';
    const { getDevMockSession, getDevMockUser } = await import('@/shared/lib/dev-bypass');
    const session = getDevMockSession();
    expect(session.user.id).toBe(getDevMockUser().id);
    expect(session.access_token).toBeTruthy();
  });

  it('getDevMockProfile returns owner role and organization_id', async () => {
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'true';
    const { getDevMockProfile } = await import('@/shared/lib/dev-bypass');
    const profile = getDevMockProfile();
    expect(profile.role).toBe('owner');
    expect(profile.organization_id).toBeTruthy();
    expect(profile.is_platform_admin).toBe(false);
  });

  it('getDevMockOrganization returns Empresa Demo', async () => {
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'true';
    const { getDevMockOrganization } = await import('@/shared/lib/dev-bypass');
    const org = getDevMockOrganization();
    expect(org.name).toBe('Empresa Demo');
    expect(org.plan_type).toBe('pro');
  });

  it('getDevMockLocations returns 2 locations', async () => {
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'true';
    const { getDevMockLocations } = await import('@/shared/lib/dev-bypass');
    const locations = getDevMockLocations();
    expect(locations).toHaveLength(2);
    expect(locations[0]?.name).toBe('Casa Central');
    expect(locations[1]?.name).toBe('Sucursal Norte');
  });

  it('getDevMockIncidents returns 3 open incidents by default', async () => {
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'true';
    const { getDevMockIncidents } = await import('@/shared/lib/dev-bypass');
    const incidents = getDevMockIncidents();
    expect(incidents).toHaveLength(3);
    expect(incidents[0]?.status).toBe('open');
    expect(incidents.every((i) => i.status === 'open')).toBe(true);
  });

  it('getDevMockIncidents respects custom count', async () => {
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'true';
    const { getDevMockIncidents } = await import('@/shared/lib/dev-bypass');
    expect(getDevMockIncidents(0)).toHaveLength(0);
    expect(getDevMockIncidents(7)).toHaveLength(7);
  });

  it('isDevPlatformAdminBypassEnabled reflects env flag', async () => {
    import.meta.env.VITE_DEV_BYPASS_PLATFORM_ADMIN = 'true';
    const { isDevPlatformAdminBypassEnabled } = await import('@/shared/lib/dev-bypass');
    expect(isDevPlatformAdminBypassEnabled()).toBe(true);

    import.meta.env.VITE_DEV_BYPASS_PLATFORM_ADMIN = 'false';
    const { isDevPlatformAdminBypassEnabled: fn2 } = await import('@/shared/lib/dev-bypass');
    expect(fn2()).toBe(false);
  });

  it('getDevMockProfile returns platform_admin when flag enabled', async () => {
    import.meta.env.VITE_DEV_BYPASS_PLATFORM_ADMIN = 'true';
    const { getDevMockProfile } = await import('@/shared/lib/dev-bypass');
    const profile = getDevMockProfile();
    expect(profile.is_platform_admin).toBe(true);
    expect(profile.organization_id).toBeNull();
  });

  it('getDevMockProfile returns regular owner by default', async () => {
    import.meta.env.VITE_DEV_BYPASS_PLATFORM_ADMIN = 'false';
    const { getDevMockProfile } = await import('@/shared/lib/dev-bypass');
    const profile = getDevMockProfile();
    expect(profile.is_platform_admin).toBe(false);
    expect(profile.organization_id).toBeTruthy();
  });
});
