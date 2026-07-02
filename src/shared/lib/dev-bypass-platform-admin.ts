/**
 * STUB temporal para TASK-012 bloque 2 (service + tests).
 * El contenido real se implementa en el bloque 3 (mocks dev-bypass).
 */
import type { Organization } from '@/shared/types/supabase';

export interface DevMockOrganization {
  id: string;
  name: string;
  business_type: string | null;
  status: Organization['status'];
  plan_type: Organization['plan_type'];
  max_locations: number;
  created_at: string;
}

export function getDevMockOrganizations(_count: number): DevMockOrganization[] {
  return [];
}

export function getDevMockOrganizationCounts(_orgId: string): {
  locations: number;
  profiles: number;
  equipment: number;
  readings: number;
  incidents_open: number;
  incidents_resolved: number;
} {
  return {
    locations: 0,
    profiles: 0,
    equipment: 0,
    readings: 0,
    incidents_open: 0,
    incidents_resolved: 0,
  };
}

export function getDevMockOrganizationDetail(_orgId: string): unknown {
  return null;
}
