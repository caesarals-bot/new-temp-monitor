import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { OnboardingWizard } from '@/features/auth/components/OnboardingWizard';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { organization } = useOrganizationStore();

  useEffect(() => {
    if (profile?.organization_id && organization) {
      navigate('/', { replace: true });
    }
  }, [profile, organization, navigate]);

  if (profile?.organization_id && organization) {
    return null;
  }

  return <OnboardingWizard />;
}