import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { createLocation as createLocationService } from '@/features/locations/services/locations.service';
import { createStaff as createStaffService } from '@/features/staff/services/staff.service';
import { createEquipment as createEquipmentService } from '@/features/equipment/services/equipment.service';
import { supabase } from '@/shared/lib/supabase';
import type {
  OrganizationFormData,
  LocationFormData,
  StaffMemberFormData,
  EquipmentFormData,
} from '../schemas/onboarding.schema';
import { useAuthStore } from '../store/auth.store';

export type OnboardingStep = 'organization' | 'location' | 'staff' | 'equipment' | 'confirmation';

const STEP_ORDER: OnboardingStep[] = ['organization', 'location', 'staff', 'equipment', 'confirmation'];

interface UseOnboardingReturn {
  currentStep: OnboardingStep;
  currentStepIndex: number;
  isLoading: boolean;
  error: string | null;
  fullName: string;
  organization: OrganizationFormData | null;
  location: LocationFormData | null;
  staffMembers: StaffMemberFormData[];
  equipment: EquipmentFormData[];
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setOrganization: (data: OrganizationFormData) => void;
  setLocation: (data: LocationFormData) => void;
  addStaff: (data: StaffMemberFormData) => void;
  removeStaff: (index: number) => void;
  addEquipment: (data: EquipmentFormData) => void;
  removeEquipment: (index: number) => void;
  submit: () => Promise<{ success: boolean }>;
}

export function useOnboarding(): UseOnboardingReturn {
  const fetchOrganization = useOrganizationStore((s) => s.fetchOrganization);
  const fetchLocations = useOrganizationStore((s) => s.fetchLocations);
  const setActiveLocation = useOrganizationStore((s) => s.setActiveLocation);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('organization');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const session = useAuthStore((s) => s.session);
  const fullName = (session?.user?.user_metadata?.full_name as string) ?? '';

  const [organization, setOrganization] = useState<OrganizationFormData | null>(null);
  const [location, setLocation] = useState<LocationFormData | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMemberFormData[]>([]);
  const [equipment, setEquipment] = useState<EquipmentFormData[]>([]);

  const currentStepIndex = STEP_ORDER.indexOf(currentStep);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
    setError(null);
  }, []);

  const nextStep = useCallback(() => {
    const idx = STEP_ORDER.indexOf(currentStep);
    const next = STEP_ORDER[idx + 1];
    if (next) {
      setCurrentStep(next);
      setError(null);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const idx = STEP_ORDER.indexOf(currentStep);
    const prev = STEP_ORDER[idx - 1];
    if (prev) {
      setCurrentStep(prev);
      setError(null);
    }
  }, [currentStep]);

  const addStaff = useCallback((data: StaffMemberFormData) => {
    setStaffMembers((prev) => [...prev, data]);
  }, []);

  const removeStaff = useCallback((index: number) => {
    setStaffMembers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addEquipment = useCallback((data: EquipmentFormData) => {
    setEquipment((prev) => [...prev, data]);
  }, []);

  const removeEquipment = useCallback((index: number) => {
    setEquipment((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const submit = useCallback(async (): Promise<{ success: boolean }> => {
    if (!organization || !location) {
      setError('Faltan datos obligatorios');
      return { success: false };
    }

    const userId = session?.user?.id;
    if (!userId) {
      setError('No hay sesión de usuario');
      return { success: false };
    }

    if (!session.user?.email) {
      setError('No hay email de usuario');
      return { success: false };
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: orgError, organizationId } = await authService.createOrganization(
        organization,
        { email: session.user.email, fullName },
        userId
      );
      if (orgError || !organizationId) {
        setError(orgError ?? 'Error al crear organización');
        return { success: false };
      }

      const { data: createdLoc, error: locationError } = await createLocationService({
        organizationId,
        name: location.name,
        address: location.address ?? null,
      });
      if (locationError || !createdLoc) {
        setError(locationError?.message ?? 'Error al crear sede');
        return { success: false };
      }
      if (locationError || !createdLoc) {
        setError(locationError ?? 'Error al crear sede');
        return { success: false };
      }

      for (const staff of staffMembers) {
        const { error: staffError } = await createStaffService({
          locationId: createdLoc.id,
          name: staff.name,
          role: staff.role,
        });
        if (staffError) {
          setError(staffError.message);
          return { success: false };
        }
      }

      for (const equip of equipment) {
        const { error: equipError } = await createEquipmentService({
          locationId: createdLoc.id,
          name: equip.name,
          physicalLocation: equip.physicalLocation ?? null,
          minTemp: equip.minTemp,
          maxTemp: equip.maxTemp,
        });
        if (equipError) {
          setError(equipError.message);
          return { success: false };
        }
      }

      await fetchOrganization();
      await fetchLocations(organizationId);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) setProfile(profileData);

      setActiveLocation(createdLoc.id);

      return { success: true };
    } catch {
      setError('Error inesperado durante el registro');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [
    organization,
    location,
    staffMembers,
    equipment,
    session,
    fullName,
    fetchOrganization,
    fetchLocations,
    setActiveLocation,
    setProfile,
  ]);

  return {
    currentStep,
    currentStepIndex,
    isLoading,
    error,
    fullName,
    organization,
    location,
    staffMembers,
    equipment,
    goToStep,
    nextStep,
    prevStep,
    setOrganization,
    setLocation,
    addStaff,
    removeStaff,
    addEquipment,
    removeEquipment,
    submit,
  };
}
