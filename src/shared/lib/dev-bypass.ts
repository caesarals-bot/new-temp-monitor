/**
 * Bypass de autenticación para desarrollo.
 *
 * SOLO se activa cuando `VITE_DEV_BYPASS_AUTH === 'true'` en .env.local.
 * NO usar en producción. Si el flag no está seteado, devuelve sesión/profile
 * nulos y el flujo real de Supabase Auth toma el control.
 *
 * Datos mockeados:
 * - Usuario: dev@tempmonitor.local (role: owner)
 * - Organización: "Empresa Demo" (plan: pro)
 * - 2 sedes: "Casa Central", "Sucursal Norte"
 */

import type { Session, User } from '@supabase/supabase-js';
import type { Organization, Location, Profile } from '@/shared/types/supabase';

export const isDevBypassEnabled = (): boolean => {
  return import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
};

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEV_ORG_ID = '00000000-0000-0000-0000-000000000010';
const DEV_LOC_1_ID = '00000000-0000-0000-0000-000000000101';
const DEV_LOC_2_ID = '00000000-0000-0000-0000-000000000102';

export function getDevMockUser(): User {
  return {
    id: DEV_USER_ID,
    email: 'dev@tempmonitor.local',
    app_metadata: {},
    user_metadata: { full_name: 'Dev User' },
    aud: 'authenticated',
    created_at: '2026-06-30T00:00:00Z',
  } as User;
}

export function getDevMockSession(): Session {
  const user = getDevMockUser();
  return {
    access_token: 'dev-bypass-token',
    refresh_token: 'dev-bypass-refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user,
  } as Session;
}

export function getDevMockProfile(): Profile {
  return {
    id: DEV_USER_ID,
    email: 'dev@tempmonitor.local',
    full_name: 'Dev User',
    organization_id: DEV_ORG_ID,
    role: 'owner',
    is_platform_admin: false,
    created_at: '2026-06-30T00:00:00Z',
  };
}

export function getDevMockOrganization(): Organization {
  return {
    id: DEV_ORG_ID,
    name: 'Empresa Demo',
    business_type: 'restaurant',
    status: 'active',
    plan_type: 'pro',
    max_locations: 3,
    created_by: DEV_USER_ID,
    created_at: '2026-06-30T00:00:00Z',
  };
}

export function getDevMockLocations(): Location[] {
  return [
    {
      id: DEV_LOC_1_ID,
      organization_id: DEV_ORG_ID,
      name: 'Casa Central',
      address: 'Av. Demo 123, Santiago',
      created_at: '2026-06-30T00:00:00Z',
    },
    {
      id: DEV_LOC_2_ID,
      organization_id: DEV_ORG_ID,
      name: 'Sucursal Norte',
      address: 'Av. Norte 456, Santiago',
      created_at: '2026-06-30T00:00:00Z',
    },
  ];
}

export function getDevMockActiveLocationId(): string {
  return DEV_LOC_1_ID;
}
