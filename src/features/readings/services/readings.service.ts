import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError } from '@/shared/lib/supabase';
import type { TemperatureReading } from '@/shared/types/supabase';

export interface CreateReadingInput {
  equipmentId: string;
  value: number;
  recordedByProfile: string | null;
  recordedByStaff: string | null;
  takenBy: string | null;
  snapshotMin: number;
  snapshotMax: number;
  recordedAt?: string;
}

export async function listReadingsByEquipment(
  equipmentId: string,
  options: { limit?: number } = {}
): Promise<{ data: TemperatureReading[] | null; error: PostgrestError | null }> {
  let query = supabase
    .from('temperature_readings')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('recorded_at', { ascending: false });

  if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function listReadingsByLocation(
  locationId: string
): Promise<{ data: TemperatureReading[] | null; error: PostgrestError | null }> {
  const equipmentRes = await supabase.from('equipment').select('id').eq('location_id', locationId);

  if (equipmentRes.error) {
    return { data: null, error: equipmentRes.error };
  }

  const equipmentIds = (equipmentRes.data ?? []).map((e) => e.id);

  if (equipmentIds.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('temperature_readings')
    .select('*')
    .in('equipment_id', equipmentIds)
    .order('recorded_at', { ascending: false });

  return { data, error };
}

export async function latestReadingByEquipment(
  equipmentId: string
): Promise<{ data: TemperatureReading | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('temperature_readings')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

export async function countReadingsByLocation(
  locationId: string
): Promise<{ count: number | null; error: PostgrestError | null }> {
  const equipmentRes = await supabase.from('equipment').select('id').eq('location_id', locationId);

  if (equipmentRes.error) {
    return { count: null, error: equipmentRes.error };
  }

  const equipmentIds = (equipmentRes.data ?? []).map((e) => e.id);

  if (equipmentIds.length === 0) {
    return { count: 0, error: null };
  }

  const { count, error } = await supabase
    .from('temperature_readings')
    .select('id', { count: 'exact', head: true })
    .in('equipment_id', equipmentIds);

  return { count, error };
}

/**
 * Cuenta las lecturas registradas hoy (desde el inicio del día local) para una
 * sede. Reusa el patrón de 2 queries de `countReadingsByLocation` y filtra por
 * `recorded_at >=` inicio de hoy. Alimenta el KPI "Lecturas hoy" del dashboard.
 */
export async function countReadingsTodayByLocation(
  locationId: string,
  now: Date = new Date()
): Promise<{ count: number | null; error: PostgrestError | null }> {
  const equipmentRes = await supabase.from('equipment').select('id').eq('location_id', locationId);

  if (equipmentRes.error) {
    return { count: null, error: equipmentRes.error };
  }

  const equipmentIds = (equipmentRes.data ?? []).map((e) => e.id);

  if (equipmentIds.length === 0) {
    return { count: 0, error: null };
  }

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('temperature_readings')
    .select('id', { count: 'exact', head: true })
    .in('equipment_id', equipmentIds)
    .gte('recorded_at', startOfToday.toISOString());

  return { count, error };
}

/**
 * Lista las lecturas de una sede registradas en los últimos 7 días (desde
 * `now - 7d`). Reusa el patrón de 2 queries por location (ADR-007). Alimenta
 * las métricas del dashboard (tendencia, cumplimiento, promedios).
 */
export async function getReadingsLast7Days(
  locationId: string,
  now: Date = new Date()
): Promise<{ data: TemperatureReading[] | null; error: PostgrestError | null }> {
  const equipmentRes = await supabase.from('equipment').select('id').eq('location_id', locationId);

  if (equipmentRes.error) {
    return { data: null, error: equipmentRes.error };
  }

  const equipmentIds = (equipmentRes.data ?? []).map((e) => e.id);

  if (equipmentIds.length === 0) {
    return { data: [], error: null };
  }

  const since = new Date(now);
  since.setDate(since.getDate() - 7);

  const { data, error } = await supabase
    .from('temperature_readings')
    .select('*')
    .in('equipment_id', equipmentIds)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: false });

  return { data, error };
}

export async function getReading(
  readingId: string
): Promise<{ data: TemperatureReading | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('temperature_readings')
    .select('*')
    .eq('id', readingId)
    .single();

  return { data, error };
}

export async function createReading(
  input: CreateReadingInput
): Promise<{ data: TemperatureReading | null; error: PostgrestError | null }> {
  const row: Record<string, unknown> = {
    equipment_id: input.equipmentId,
    value: input.value,
    reading_type: 'manual',
    snapshot_min_temp: input.snapshotMin,
    snapshot_max_temp: input.snapshotMax,
    recorded_by_profile: input.recordedByProfile,
    recorded_by_staff: input.recordedByStaff,
    taken_by: input.takenBy,
  };
  if (input.recordedAt) row.recorded_at = input.recordedAt;

  const { data, error } = await supabase.from('temperature_readings').insert(row).select().single();

  return { data, error };
}

export async function countReadingsByEquipment(
  equipmentId: string
): Promise<{ count: number | null; error: PostgrestError | null }> {
  const { count, error } = await supabase
    .from('temperature_readings')
    .select('id', { count: 'exact', head: true })
    .eq('equipment_id', equipmentId);

  return { count, error };
}
