import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError } from '@/shared/lib/supabase';
import type { Equipment } from '@/shared/types/supabase';

export interface CreateEquipmentInput {
  locationId: string;
  name: string;
  physicalLocation?: string | null;
  code?: string | null;
  minTemp: number;
  maxTemp: number;
}

export type UpdateEquipmentInput = {
  name?: string;
  physicalLocation?: string | null;
  code?: string | null;
  minTemp?: number;
  maxTemp?: number;
};

export async function listEquipmentByLocation(
  locationId: string
): Promise<{ data: Equipment[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('location_id', locationId)
    .order('created_at', { ascending: true });

  return { data, error };
}

/**
 * Lista todos los equipos de una organización (todas las sedes). Útil cuando
 * un reporte no filtra por sede y necesita nombres/rangos reales por equipo.
 *
 * Patrón ADR-007: 2 queries (locations de la org → equipos con `in`).
 */
export async function listEquipmentByOrganization(
  organizationId: string
): Promise<{ data: Equipment[] | null; error: PostgrestError | null }> {
  const { data: locations, error: locError } = await supabase
    .from('locations')
    .select('id')
    .eq('organization_id', organizationId);

  if (locError) return { data: null, error: locError };

  const locationIds = (locations ?? []).map((l) => l.id);
  if (locationIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .in('location_id', locationIds)
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function getEquipment(
  equipmentId: string
): Promise<{ data: Equipment | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', equipmentId)
    .single();

  return { data, error };
}

export async function createEquipment(
  input: CreateEquipmentInput
): Promise<{ data: Equipment | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('equipment')
    .insert({
      location_id: input.locationId,
      name: input.name,
      physical_location: input.physicalLocation ?? null,
      code: input.code ?? null,
      min_temp: input.minTemp,
      max_temp: input.maxTemp,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateEquipment(
  equipmentId: string,
  input: UpdateEquipmentInput
): Promise<{ data: Equipment | null; error: PostgrestError | null }> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.physicalLocation !== undefined) patch.physical_location = input.physicalLocation;
  if (input.code !== undefined) patch.code = input.code;
  if (input.minTemp !== undefined) patch.min_temp = input.minTemp;
  if (input.maxTemp !== undefined) patch.max_temp = input.maxTemp;

  const { data, error } = await supabase
    .from('equipment')
    .update(patch)
    .eq('id', equipmentId)
    .select()
    .single();

  return { data, error };
}

export async function deleteEquipment(
  equipmentId: string
): Promise<{ data: null; error: PostgrestError | null }> {
  const { error } = await supabase.from('equipment').delete().eq('id', equipmentId);

  return { data: null, error };
}

export async function countEquipmentReadings(
  equipmentId: string
): Promise<{ count: number | null; error: PostgrestError | null }> {
  const { count, error } = await supabase
    .from('temperature_readings')
    .select('id', { count: 'exact', head: true })
    .eq('equipment_id', equipmentId);

  return { count, error };
}
