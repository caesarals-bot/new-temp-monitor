/**
 * Mocks dev-bypass para platform-admin.
 *
 * Retorna 3 organizaciones mock distintas a la del usuario activo, con
 * metadatos cross-tenant para que el panel admin tenga datos en V1 sin
 * depender de Supabase real. Solo expone metadata (no values de readings,
 * no description/action_taken de incidents, no min/max temp).
 *
 * Se activa vía `VITE_DEV_BYPASS_AUTH=true` (igual que el resto del
 * dev-bypass). Ver `src/shared/lib/dev-bypass.ts`.
 */
import type { Organization } from '@/shared/types/supabase';

export interface DevMockOrganization {
  id: string;
  name: string;
  business_type: string | null;
  status: Organization['status'];
  plan_type: Organization['plan_type'];
  max_locations: number;
  created_by: string | null;
  created_at: string;
}

interface DevMockLocation {
  id: string;
  organization_id: string;
  name: string;
  address: string | null;
}

interface DevMockProfile {
  id: string;
  email: string;
  full_name: string | null;
  organization_id: string;
  role: string;
}

const ORG_A = '00000000-0000-0000-0000-00000000a001';
const ORG_B = '00000000-0000-0000-0000-00000000a002';
const ORG_C = '00000000-0000-0000-0000-00000000a003';

const ORGS: DevMockOrganization[] = [
  {
    id: ORG_A,
    name: 'Restaurante Demo Norte',
    business_type: 'restaurant',
    status: 'active',
    plan_type: 'pro',
    max_locations: 5,
    created_by: null,
    created_at: '2026-05-15T10:00:00Z',
  },
  {
    id: ORG_B,
    name: 'Farmacia Vital',
    business_type: 'pharmacy',
    status: 'active',
    plan_type: 'enterprise',
    max_locations: 20,
    created_by: null,
    created_at: '2026-04-02T08:30:00Z',
  },
  {
    id: ORG_C,
    name: 'Carnicería Don Pedro',
    business_type: 'butcher_shop',
    status: 'paused',
    plan_type: 'basic',
    max_locations: 1,
    created_by: null,
    created_at: '2026-06-20T14:15:00Z',
  },
];

const LOCATIONS: Record<string, DevMockLocation[]> = {
  [ORG_A]: [
    {
      id: '00000000-0000-0000-0000-00000000b001',
      organization_id: ORG_A,
      name: 'Casa Central',
      address: 'Av. Norte 123',
    },
    {
      id: '00000000-0000-0000-0000-00000000b002',
      organization_id: ORG_A,
      name: 'Sucursal Providencia',
      address: 'Av. Pte. 456',
    },
  ],
  [ORG_B]: [
    {
      id: '00000000-0000-0000-0000-00000000b003',
      organization_id: ORG_B,
      name: 'Sede Las Condes',
      address: 'Av. Apoquindo 789',
    },
    {
      id: '00000000-0000-0000-0000-00000000b004',
      organization_id: ORG_B,
      name: 'Sede Maipú',
      address: 'Av. Pajaritos 234',
    },
    {
      id: '00000000-0000-0000-0000-00000000b005',
      organization_id: ORG_B,
      name: 'Sede Viña',
      address: 'Av. Libertad 567',
    },
  ],
  [ORG_C]: [
    {
      id: '00000000-0000-0000-0000-00000000b006',
      organization_id: ORG_C,
      name: 'Local Centro',
      address: 'Calle Central 89',
    },
  ],
};

const PROFILES: Record<string, DevMockProfile[]> = {
  [ORG_A]: [
    {
      id: '00000000-0000-0000-0000-00000000c001',
      email: 'owner@restonorte.cl',
      full_name: 'Juan Pérez',
      organization_id: ORG_A,
      role: 'owner',
    },
    {
      id: '00000000-0000-0000-0000-00000000c002',
      email: 'admin@restonorte.cl',
      full_name: 'María González',
      organization_id: ORG_A,
      role: 'admin',
    },
  ],
  [ORG_B]: [
    {
      id: '00000000-0000-0000-0000-00000000c003',
      email: 'owner@farmavital.cl',
      full_name: 'Carlos Soto',
      organization_id: ORG_B,
      role: 'owner',
    },
    {
      id: '00000000-0000-0000-0000-00000000c004',
      email: 'admin@farmavital.cl',
      full_name: 'Ana Ramírez',
      organization_id: ORG_B,
      role: 'admin',
    },
    {
      id: '00000000-0000-0000-0000-00000000c005',
      email: 'manager@farmavital.cl',
      full_name: 'Luis Vega',
      organization_id: ORG_B,
      role: 'manager',
    },
  ],
  [ORG_C]: [
    {
      id: '00000000-0000-0000-0000-00000000c006',
      email: 'owner@donpedro.cl',
      full_name: 'Pedro Muñoz',
      organization_id: ORG_C,
      role: 'owner',
    },
  ],
};

const COUNTS: Record<
  string,
  { equipment: number; readings: number; incidents_open: number; incidents_resolved: number }
> = {
  [ORG_A]: { equipment: 8, readings: 240, incidents_open: 2, incidents_resolved: 5 },
  [ORG_B]: { equipment: 25, readings: 1840, incidents_open: 0, incidents_resolved: 12 },
  [ORG_C]: { equipment: 2, readings: 18, incidents_open: 1, incidents_resolved: 0 },
};

export function getDevMockOrganizations(_count: number): DevMockOrganization[] {
  return ORGS;
}

export function getDevMockOrganizationCounts(orgId: string): {
  locations: number;
  profiles: number;
  equipment: number;
  readings: number;
  incidents_open: number;
  incidents_resolved: number;
} {
  const locs = LOCATIONS[orgId] ?? [];
  const profs = PROFILES[orgId] ?? [];
  const counts = COUNTS[orgId] ?? {
    equipment: 0,
    readings: 0,
    incidents_open: 0,
    incidents_resolved: 0,
  };
  return {
    locations: locs.length,
    profiles: profs.length,
    equipment: counts.equipment,
    readings: counts.readings,
    incidents_open: counts.incidents_open,
    incidents_resolved: counts.incidents_resolved,
  };
}

export function getDevMockOrganizationDetail(orgId: string): {
  id: string;
  name: string;
  business_type: string | null;
  status: Organization['status'];
  plan_type: Organization['plan_type'];
  max_locations: number;
  created_at: string;
  locations: { id: string; name: string; address: string | null }[];
  profiles: { id: string; email: string; full_name: string | null; role: string }[];
  counts: ReturnType<typeof getDevMockOrganizationCounts>;
} | null {
  const org = ORGS.find((o) => o.id === orgId);
  if (!org) return null;

  return {
    id: org.id,
    name: org.name,
    business_type: org.business_type,
    status: org.status,
    plan_type: org.plan_type,
    max_locations: org.max_locations,
    created_at: org.created_at,
    locations: LOCATIONS[orgId] ?? [],
    profiles: PROFILES[orgId] ?? [],
    counts: getDevMockOrganizationCounts(orgId),
  };
}
