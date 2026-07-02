import { useOnboarding } from '../hooks/useOnboarding';
import { WizardProgress } from './WizardProgress';
import { OrganizationStep } from './steps/OrganizationStep';
import { FirstLocationStep } from './steps/FirstLocationStep';
import { StaffStep } from './steps/StaffStep';
import { EquipmentStep } from './steps/EquipmentStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

export function OnboardingWizard() {
  const {
    currentStep,
    isLoading,
    error,
    fullName,
    organization,
    location,
    staffMembers,
    equipment,
    nextStep,
    prevStep,
    setOrganization,
    setLocation,
    addStaff,
    removeStaff,
    addEquipment,
    removeEquipment,
    submit,
  } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 'organization':
        return (
          <OrganizationStep
            defaultValues={organization ?? undefined}
            onNext={(data) => {
              setOrganization(data);
              nextStep();
            }}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );

      case 'location':
        return (
          <FirstLocationStep
            defaultValues={location ?? undefined}
            onNext={(data) => {
              setLocation(data);
              nextStep();
            }}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );

      case 'staff':
        return (
          <StaffStep
            staffMembers={staffMembers}
            onAdd={addStaff}
            onRemove={removeStaff}
            onNext={nextStep}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );

      case 'equipment':
        return (
          <EquipmentStep
            equipment={equipment}
            onAdd={addEquipment}
            onRemove={removeEquipment}
            onNext={nextStep}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );

      case 'confirmation':
        return (
          <ConfirmationStep
            fullName={fullName}
            organization={organization}
            location={location}
            staffMembers={staffMembers}
            equipment={equipment}
            onConfirm={submit}
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[--color-surface]">
      <div className="w-full max-w-lg space-y-6">
        {currentStep !== 'confirmation' && (
          <WizardProgress currentStep={currentStep} />
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {renderStep()}
      </div>
    </div>
  );
}
