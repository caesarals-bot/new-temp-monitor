/**
 * Servicios puros para la feature `reports`.
 *
 * Patrón: funciones puras que retornan `{ data, error }`. No tocan stores ni
 * hacen logging. El estado vive en `useReport`.
 *
 * Reglas ADR:
 * - ADR-007: cuando filtramos por location, 2 queries (primero equipment IDs
 *   via `listEquipmentByLocation`, luego readings filtrados por IN).
 * - Reusamos services de `readings` e `incidents` (feature-first: services
 *   son punto de integración entre features).
 */
import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError } from '@/shared/lib/supabase';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { listIncidents } from '@/features/incidents/services/incidents.service';
import type { TemperatureReading } from '@/shared/types/supabase';
import type { IncidentWithReading, IncidentFilters } from '@/features/incidents/types';
import type { ReportFilters, ReadingTypeFilter } from '../types';

export interface ListReadingsReportParams {
  organizationId: string;
  filters: ReportFilters;
}

export async function listReadingsReport({
  organizationId,
  filters,
}: ListReadingsReportParams): Promise<{
  data: TemperatureReading[] | null;
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
    .from('temperature_readings')
    .select(
      `
      id,
      equipment_id,
      value,
      reading_type,
      sensor_battery,
      sensor_signal,
      snapshot_min_temp,
      snapshot_max_temp,
      recorded_by_profile,
      recorded_by_staff,
      taken_by,
      recorded_at,
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
    `
    )
    .eq('equipment.locations.organization_id', organizationId)
    .gte('recorded_at', filters.from)
    .lte('recorded_at', filters.to)
    .order('recorded_at', { ascending: false });

  if (equipmentIds) {
    query = query.in('equipment_id', equipmentIds);
  }
  if (filters.equipmentId) {
    query = query.eq('equipment_id', filters.equipmentId);
  }
  applyReadingTypeFilter(query, filters.readingType);

  const { data, error } = await query;
  return { data: data as unknown as TemperatureReading[] | null, error };
}

function applyReadingTypeFilter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  type: ReadingTypeFilter
): void {
  if (type === 'all') return;
  query.eq('reading_type', type);
}

export async function listIncidentsForReport({
  organizationId,
  filters,
}: ListReadingsReportParams): Promise<{
  data: IncidentWithReading[] | null;
  error: PostgrestError | null;
}> {
  const incidentFilters: IncidentFilters = {
    from: filters.from,
    to: filters.to,
  };
  if (filters.locationId) incidentFilters.locationId = filters.locationId;
  if (filters.equipmentId) incidentFilters.equipmentId = filters.equipmentId;

  return listIncidents({ organizationId, filters: incidentFilters });
}
