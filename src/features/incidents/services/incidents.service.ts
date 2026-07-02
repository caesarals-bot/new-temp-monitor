/**
 * Servicios puros para la feature `incidents`.
 *
 * Patrón: funciones puras que retornan `{ data, error }`. No tocan stores ni
 * hacen logging. El estado vive en hooks (`useIncidents`) y stores
 * (`useIncidentStore`).
 *
 * Reglas ADR:
 * - ADR-007: cuando filtramos por location/equipment usamos 2 queries (primero
 *   traer IDs de equipment via `listEquipmentByLocation`, luego filtrar
 *   incidents por `equipment_id IN (...)`). Evitamos `!inner` join anidado.
 */
import { supabase } from '@/shared/lib/supabase';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { outOfRangeDirection } from '@/features/readings/lib/isOutOfRange';
import type {
  CreateIncidentInput,
  IncidentFilters,
  IncidentWithReading,
} from '../types';

// Tipo local mientras @/shared/types/supabase no exporta PostgrestError
// (pendiente housekeeping pre-existente). Sigue la forma de Supabase JS.
type PostgrestError = { message: string; details?: string; hint?: string; code?: string };

export interface ListIncidentsParams {
  organizationId: string;
  filters?: IncidentFilters;
}

export async function listIncidents({
  organizationId,
  filters = {},
}: ListIncidentsParams): Promise<{
  data: IncidentWithReading[] | null;
  error: PostgrestError | null;
}> {
  let equipmentIds: string[] | null = null;

  if (filters.locationId) {
    const { data, error } = await listEquipmentByLocation(filters.locationId);
    if (error) {
      return { data: null, error };
    }
    equipmentIds = (data ?? []).map((e) => e.id);
    if (equipmentIds.length === 0) {
      return { data: [], error: null };
    }
  }

  let query = supabase
    .from('incidents')
    .select(
      `
      id,
      reading_id,
      status,
      description,
      action_taken,
      resolved_by,
      resolved_at,
      created_at,
      reading:temperature_readings!inner (
        id,
        value,
        recorded_at,
        equipment_id,
        equipment:equipment!inner (
          id,
          name,
          min_temp,
          max_temp,
          location_id,
          locations!inner (
            organization_id
          )
        )
      )
    `
    )
    .eq('reading.equipment.locations.organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (equipmentIds) {
    query = query.in('reading.equipment_id', equipmentIds);
  }
  if (filters.equipmentId) {
    query = query.eq('reading.equipment_id', filters.equipmentId);
  }
  if (filters.from) {
    query = query.gte('created_at', filters.from);
  }
  if (filters.to) {
    query = query.lte('created_at', filters.to);
  }

  const { data, error } = await query;
  return { data: data as unknown as IncidentWithReading[] | null, error };
}

export interface ResolveIncidentInput {
  incidentId: string;
  actionTaken: string;
  resolvedBy: string;
}

export async function resolveIncident(
  input: ResolveIncidentInput
): Promise<{ data: null; error: PostgrestError | null }> {
  const { error } = await supabase
    .from('incidents')
    .update({
      status: 'resolved',
      action_taken: input.actionTaken.trim(),
      resolved_by: input.resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', input.incidentId);

  return { data: null, error };
}

export async function createIncidentFromReading(
  input: CreateIncidentInput
): Promise<{ data: { id: string } | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      reading_id: input.readingId,
      description: input.description,
    })
    .select('id')
    .single();

  return { data, error };
}

/**
 * Genera la descripción legible del incidente a partir de la lectura que lo
 * gatilló. Usado por `useReadingForm` al detectar out-of-range y por
 * `createIncidentFromReading` como contrato único (la UI no construye
 * strings de descripción).
 *
 * Ejemplos:
 *   buildIncidentDescription({ value: 12, min: 2, max: 8 }) →
 *     "Temperatura de 12°C supera el rango permitido [2, 8]"
 *   buildIncidentDescription({ value: -25, min: -22, max: -15 }) →
 *     "Temperatura de -25°C está bajo el rango permitido [-22, -15]"
 */
export function buildIncidentDescription(params: {
  value: number;
  minTemp: number;
  maxTemp: number;
}): string {
  const direction = outOfRangeDirection(params.value, params.minTemp, params.maxTemp);
  const range = `[${params.minTemp}, ${params.maxTemp}]`;
  if (direction === 'high') {
    return `Temperatura de ${params.value}°C supera el rango permitido ${range}`;
  }
  if (direction === 'low') {
    return `Temperatura de ${params.value}°C está bajo el rango permitido ${range}`;
  }
  return `Temperatura de ${params.value}°C fuera del rango permitido ${range}`;
}