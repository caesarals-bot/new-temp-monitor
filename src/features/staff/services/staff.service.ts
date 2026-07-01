import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError, Staff } from '@/shared/types/supabase';

export interface CreateStaffInput {
  locationId: string;
  name: string;
  role: string;
}

export type UpdateStaffInput = {
  name?: string;
  role?: string;
};

export async function listStaffByLocation(
  locationId: string
): Promise<{ data: Staff[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('location_id', locationId)
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function getStaff(
  staffId: string
): Promise<{ data: Staff | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', staffId)
    .single();

  return { data, error };
}

export async function createStaff(
  input: CreateStaffInput
): Promise<{ data: Staff | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('staff')
    .insert({
      location_id: input.locationId,
      name: input.name,
      role: input.role,
      active: true,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateStaff(
  staffId: string,
  input: UpdateStaffInput
): Promise<{ data: Staff | null; error: PostgrestError | null }> {
  const patch: UpdateStaffInput = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.role !== undefined) patch.role = input.role;

  const { data, error } = await supabase
    .from('staff')
    .update(patch)
    .eq('id', staffId)
    .select()
    .single();

  return { data, error };
}

export async function setStaffActive(
  staffId: string,
  active: boolean
): Promise<{ data: Staff | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('staff')
    .update({ active })
    .eq('id', staffId)
    .select()
    .single();

  return { data, error };
}

export async function countStaffReadings(
  staffId: string
): Promise<{ count: number | null; error: PostgrestError | null }> {
  const { count, error } = await supabase
    .from('temperature_readings')
    .select('id', { count: 'exact', head: true })
    .eq('recorded_by_staff', staffId);

  return { count, error };
}
