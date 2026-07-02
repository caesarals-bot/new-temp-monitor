import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError, TemperatureReading } from '@/shared/types/supabase';

export interface CreateReadingInput {
  equipmentId: string;
  value: number;
  recordedByProfile: string | null;
  recordedByStaff: string | null;
  takenBy: string | null;
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
    recorded_by_profile: input.recordedByProfile,
    recorded_by_staff: input.recordedByStaff,
    taken_by: input.takenBy,
  };
  if (input.recordedAt) row.recorded_at = input.recordedAt;

  const { data, error } = await supabase
    .from('temperature_readings')
    .insert(row)
    .select()
    .single();

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