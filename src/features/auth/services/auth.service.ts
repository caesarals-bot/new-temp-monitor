import { supabase } from '@/shared/lib/supabase';
import type {
  OrganizationFormData,
} from '../schemas/onboarding.schema';

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
}

export const authService = new AuthService();