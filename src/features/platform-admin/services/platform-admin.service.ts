/**
 * Servicios del feature `platform-admin`.
 *
 * Acceso cross-tenant exclusivo para `is_platform_admin === true`. El service
 * solo expone metadatos (no datos sensibles: sin values de readings, sin
 * description/action_taken de incidents, sin min/max temp de equipos).
 *
 * Pendiente H-004: las RLS policies de Supabase deben permitir SELECT de
 * metadata a platform admins. En V1 con dev-bypass funciona sin policies;
 * en producción requiere migration SQL.
 *
 * Patrón: funciones puras `{ data, error }`. Sin tocar stores. Sin logging.
 */
import { supabase } from '@/shared/lib/supabase';
import { isDevBypassEnabled } from '@/shared/lib/dev-bypass';
import type { Organization } from '@/shared/types/supabase';

// Tipo local mientras @/shared/types/supabase no exporta PostgrestError
// (mismo workaround que TASK-010/011).
type PostgrestError = { message: string; details?: string; hint?: string; code?: string };

export interface OrganizationListItem {
  id: string;
  name: string;
  business_type: string | null;
  status: Organization['status'];
  plan_type: Organization['plan_type'];
  max_locations: number;
  created_at: string;
  locations_count: number;
  profiles_count: number;
  equipment_count: number;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  business_type: string | null;
  status: Organization['status'];
  plan_type: Organization['plan_type'];
  max_locations: number;
  created_at: string;
  locations: { id: string; name: string; address: string | null }[];
  profiles: { id: string; email: string; full_name: string | null; role: string }[];
  counts: {
    locations: number;
    profiles: number;
    equipment: number;
    readings: number;
    incidents_open: number;
    incidents_resolved: number;
  };
}

export interface GlobalMetrics {
  active_organizations: number;
  total_organizations: number;
  readings_last_7_days: number;
  open_incidents: number;
}

export interface ListOrganizationsParams {
  status?: Organization['status'];
  businessType?: string;
  planType?: Organization['plan_type'];
}

// Tipo para mocks dev-bypass (definidos en otro archivo).
interface DevMockOrgLite {
  id: string;
  name: string;
  business_type: string | null;
  status: Organization['status'];
  plan_type: Organization['plan_type'];
  max_locations: number;
  created_at: string;
}

export async function listOrganizations(
  params: ListOrganizationsParams = {}
): Promise<{ data: OrganizationListItem[] | null; error: PostgrestError | null }> {
  if (isDevBypassEnabled()) {
    // Lazy import para evitar circular deps y permitir commit aislado en bloque 3.
    const { getDevMockOrganizations, getDevMockOrganizationCounts } =
      await import('@/shared/lib/dev-bypass-platform-admin');
    const mocks = getDevMockOrganizations(3);
    let filtered: DevMockOrgLite[] = mocks;
    if (params.status) filtered = filtered.filter((o) => o.status === params.status);
    if (params.businessType)
      filtered = filtered.filter((o) => o.business_type === params.businessType);
    if (params.planType) filtered = filtered.filter((o) => o.plan_type === params.planType);

    const items: OrganizationListItem[] = filtered.map((o) => {
      const counts = getDevMockOrganizationCounts(o.id);
      return {
        id: o.id,
        name: o.name,
        business_type: o.business_type,
        status: o.status,
        plan_type: o.plan_type,
        max_locations: o.max_locations,
        created_at: o.created_at,
        locations_count: counts.locations,
        profiles_count: counts.profiles,
        equipment_count: counts.equipment,
      };
    });

    return { data: items, error: null };
  }

  let query = supabase
    .from('organizations')
    .select(
      `
      id,
      name,
      business_type,
      status,
      plan_type,
      max_locations,
      created_at,
      locations (id),
      profiles (id),
      equipment (id)
    `
    )
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);
  if (params.businessType) query = query.eq('business_type', params.businessType);
  if (params.planType) query = query.eq('plan_type', params.planType);

  const { data, error } = await query;
  if (error) return { data: null, error };

  const rows = (data ?? []) as unknown as Array<
    Omit<OrganizationListItem, 'locations_count' | 'profiles_count' | 'equipment_count'> & {
      locations: { id: string }[];
      profiles: { id: string }[];
      equipment: { id: string }[];
    }
  >;

  const items: OrganizationListItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    business_type: r.business_type,
    status: r.status,
    plan_type: r.plan_type,
    max_locations: r.max_locations,
    created_at: r.created_at,
    locations_count: r.locations?.length ?? 0,
    profiles_count: r.profiles?.length ?? 0,
    equipment_count: r.equipment?.length ?? 0,
  }));

  return { data: items, error: null };
}

export async function getOrganizationDetail(
  organizationId: string
): Promise<{ data: OrganizationDetail | null; error: PostgrestError | null }> {
  if (isDevBypassEnabled()) {
    const { getDevMockOrganizationDetail } = await import('@/shared/lib/dev-bypass-platform-admin');
    const detail = getDevMockOrganizationDetail(organizationId);
    if (!detail) return { data: null, error: null };
    return { data: detail, error: null };
  }

  const [orgRes, locationsRes, profilesRes, countsRes] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', organizationId).single(),
    supabase.from('locations').select('id, name, address').eq('organization_id', organizationId),
    supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('organization_id', organizationId),
    getOrganizationCounts(organizationId),
  ]);

  if (orgRes.error) return { data: null, error: orgRes.error };
  if (locationsRes.error) return { data: null, error: locationsRes.error };
  if (profilesRes.error) return { data: null, error: profilesRes.error };
  if (countsRes.error) return { data: null, error: countsRes.error };

  const org = orgRes.data as Organization;
  return {
    data: {
      id: org.id,
      name: org.name,
      business_type: org.business_type,
      status: org.status,
      plan_type: org.plan_type,
      max_locations: org.max_locations,
      created_at: org.created_at,
      locations: locationsRes.data ?? [],
      profiles: (profilesRes.data ?? []) as {
        id: string;
        email: string;
        full_name: string | null;
        role: string;
      }[],
      counts: countsRes.data!,
    },
    error: null,
  };
}

async function getOrganizationCounts(organizationId: string): Promise<{
  data: OrganizationDetail['counts'] | null;
  error: PostgrestError | null;
}> {
  const equipmentRes = await supabase
    .from('equipment')
    .select('id, location_id, locations!inner(organization_id)')
    .eq('locations.organization_id', organizationId);

  if (equipmentRes.error) return { data: null, error: equipmentRes.error };

  const equipmentIds = (equipmentRes.data ?? []).map((e) => e.id);

  const [readingsRes, incidentsRes] = await Promise.all([
    equipmentIds.length === 0
      ? Promise.resolve({ count: 0, error: null })
      : supabase
          .from('temperature_readings')
          .select('id', { count: 'exact', head: true })
          .in('equipment_id', equipmentIds),
    supabase
      .from('incidents')
      .select(
        'id, status, reading:temperature_readings!inner(equipment_id, equipment:equipment!inner(location_id, locations!inner(organization_id)))'
      )
      .eq('reading.equipment.locations.organization_id', organizationId),
  ]);

  if ('error' in readingsRes && readingsRes.error) {
    return { data: null, error: readingsRes.error };
  }
  if (incidentsRes.error) return { data: null, error: incidentsRes.error };

  const incidents = (incidentsRes.data ?? []) as Array<{ status: 'open' | 'resolved' }>;
  const openIncidents = incidents.filter((i) => i.status === 'open').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved').length;

  return {
    data: {
      locations: 0,
      profiles: 0,
      equipment: equipmentIds.length,
      readings: 'count' in readingsRes ? (readingsRes.count ?? 0) : 0,
      incidents_open: openIncidents,
      incidents_resolved: resolvedIncidents,
    },
    error: null,
  };
}

export async function updateOrganizationStatus(
  organizationId: string,
  newStatus: Organization['status']
): Promise<{ data: Organization | null; error: PostgrestError | null }> {
  if (isDevBypassEnabled()) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('organizations')
    .update({ status: newStatus })
    .eq('id', organizationId)
    .select()
    .single();

  return { data: data as Organization | null, error };
}

export async function getGlobalMetrics(): Promise<{
  data: GlobalMetrics | null;
  error: PostgrestError | null;
}> {
  if (isDevBypassEnabled()) {
    const { getDevMockOrganizations, getDevMockOrganizationCounts } =
      await import('@/shared/lib/dev-bypass-platform-admin');
    const mocks = getDevMockOrganizations(3);
    const active = mocks.filter((o) => o.status === 'active').length;
    let totalReadings = 0;
    let openIncidents = 0;
    for (const m of mocks) {
      const c = getDevMockOrganizationCounts(m.id);
      totalReadings += c.readings;
      openIncidents += c.incidents_open;
    }
    return {
      data: {
        active_organizations: active,
        total_organizations: mocks.length,
        readings_last_7_days: totalReadings,
        open_incidents: openIncidents,
      },
      error: null,
    };
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [orgsRes, readingsRes, incidentsRes] = await Promise.all([
    supabase.from('organizations').select('id, status'),
    supabase
      .from('temperature_readings')
      .select('id', { count: 'exact', head: true })
      .gte('recorded_at', sevenDaysAgo.toISOString()),
    supabase.from('incidents').select('id, status').eq('status', 'open'),
  ]);

  if (orgsRes.error) return { data: null, error: orgsRes.error };
  if ('error' in readingsRes && readingsRes.error) {
    return { data: null, error: readingsRes.error };
  }
  if (incidentsRes.error) return { data: null, error: incidentsRes.error };

  const orgs = (orgsRes.data ?? []) as Array<{ status: Organization['status'] }>;
  const active = orgs.filter((o) => o.status === 'active').length;

  return {
    data: {
      active_organizations: active,
      total_organizations: orgs.length,
      readings_last_7_days: 'count' in readingsRes ? (readingsRes.count ?? 0) : 0,
      open_incidents: (incidentsRes.data ?? []).length,
    },
    error: null,
  };
}
