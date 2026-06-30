import { cn } from '@/shared/lib/utils';
import { Progress } from '@/shared/components/ui/progress';
import type { OnboardingStep } from '../hooks/useOnboarding';

const STEPS: { key: OnboardingStep; label: string }[] = [
  { key: 'organization', label: 'Organización' },
  { key: 'location', label: 'Sede' },
  { key: 'staff', label: 'Personal' },
  { key: 'equipment', label: 'Equipos' },
  { key: 'confirmation', label: 'Listo' },
];

interface WizardProgressProps {
  currentStep: OnboardingStep;
  className?: string;
}

export function WizardProgress({ currentStep, className }: WizardProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between">
        {STEPS.map((step, index) => (
          <span
            key={step.key}
            className={cn(
              'text-xs font-medium transition-colors',
              index <= currentIndex
                ? 'text-[--color-eucalyptus]'
                : 'text-[--color-slate-400]'
            )}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}