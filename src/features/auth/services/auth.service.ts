import { supabase } from '@/shared/lib/supabase';
import type {
  OrganizationFormData,
  LocationFormData,
  StaffMemberFormData,
  EquipmentFormData,
} from '../schemas/onboarding.schema';
import type { Location } from '@/shared/types/supabase';

interface AccountInfo {
  email: string;
  fullName: string;
}

export class AuthService {
  async createOrganization(
    data: OrganizationFormData,
    account: AccountInfo,
    userId: string
  ): Promise<{ error: string | null; organizationId: string | null }> {
    const { data: result, error } = await supabase.rpc(
      'create_organization_with_owner',
      {
        p_org_name: data.name,
        p_business_type: data.businessType,
        p_plan_type: data.planType,
        p_owner_email: account.email,
        p_owner_full_name: account.fullName,
        p_user_id: userId,
      }
    );

    if (error) return { error: error.message, organizationId: null };
    return { error: null, organizationId: result as string };
  }

  async createLocation(
    organizationId: string,
    data: LocationFormData
  ): Promise<{ error: string | null; location: Location | null }> {
    const { data: location, error } = await supabase
      .from('locations')
      .insert({
        organization_id: organizationId,
        name: data.name,
        address: data.address ?? null,
      })
      .select()
      .single();

    if (error) return { error: error.message, location: null };
    return { error: null, location };
  }

  async createStaff(
    locationId: string,
    data: StaffMemberFormData
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.from('staff').insert({
      location_id: locationId,
      name: data.name,
      role: data.role,
    });

    return { error: error?.message ?? null };
  }

  async createEquipment(
    locationId: string,
    data: EquipmentFormData
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.from('equipment').insert({
      location_id: locationId,
      name: data.name,
      physical_location: data.physicalLocation ?? null,
      min_temp: data.minTemp,
      max_temp: data.maxTemp,
    });

    return { error: error?.message ?? null };
  }
}

export const authService = new AuthService();