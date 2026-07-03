import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError } from '@/shared/lib/supabase';
import type { Location } from '@/shared/types/supabase';

export type { Location };

export interface CreateLocationInput {
  organizationId: string;
  name: string;
  address?: string | null;
}

export type UpdateLocationInput = {
  name?: string;
  address?: string | null;
};

export interface LocationDependencies {
  equipment: number;
  staff: number;
  readings: number;
}

export async function listLocations(
  organizationId: string
): Promise<{ data: Location[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function getLocation(
  locationId: string
): Promise<{ data: Location | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', locationId)
    .single();

  return { data, error };
}

export async function createLocation(
  input: CreateLocationInput
): Promise<{ data: Location | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      organization_id: input.organizationId,
      name: input.name,
      address: input.address ?? null,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateLocation(
  locationId: string,
  input: UpdateLocationInput
): Promise<{ data: Location | null; error: PostgrestError | null }> {
  const patch: UpdateLocationInput = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.address !== undefined) patch.address = input.address;

  const { data, error } = await supabase
    .from('locations')
    .update(patch)
    .eq('id', locationId)
    .select()
    .single();

  return { data, error };
}

export async function deleteLocation(
  locationId: string
): Promise<{ data: null; error: PostgrestError | null }> {
  const { error } = await supabase.from('locations').delete().eq('id', locationId);

  return { data: null, error };
}

export async function countLocationsByOrg(
  organizationId: string
): Promise<{ count: number | null; error: PostgrestError | null }> {
  const { count, error } = await supabase
    .from('locations')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  return { count, error };
}

export async function countLocationDependencies(
  locationId: string
): Promise<{ data: LocationDependencies | null; error: PostgrestError | null }> {
  const equipmentRes = await supabase
    .from('equipment')
    .select('id', { count: 'exact', head: true })
    .eq('location_id', locationId);

  if (equipmentRes.error) return { data: null, error: equipmentRes.error };

  const equipmentIds = (equipmentRes.data ?? []) as { id: string }[];
  const equipmentCount = equipmentRes.count ?? equipmentIds.length;

  const [staff, readings] = await Promise.all([
    supabase
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', locationId),
    equipmentIds.length === 0
      ? Promise.resolve({ count: 0, error: null })
      : supabase
          .from('temperature_readings')
          .select('id', { count: 'exact', head: true })
          .in(
            'equipment_id',
            equipmentIds.map((e) => e.id)
          ),
  ]);

  if (staff.error) return { data: null, error: staff.error };
  if ('error' in readings && readings.error) return { data: null, error: readings.error };

  return {
    data: {
      equipment: equipmentCount,
      staff: staff.count ?? 0,
      readings: readings.count ?? 0,
    },
    error: null,
  };
}
