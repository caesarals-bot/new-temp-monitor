import { Plus, Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import type { PlanTypeEnum } from '@/shared/types/supabase';

const PLAN_LABEL: Record<PlanTypeEnum, string> = {
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export interface LocationsHeaderProps {
  totalLocations: number;
  maxLocations: number;
  planType: PlanTypeEnum;
  canCreate: boolean;
  onCreate: () => void;
}

export function LocationsHeader({
  totalLocations,
  maxLocations,
  planType,
  canCreate,
  onCreate,
}: LocationsHeaderProps) {
  const atLimit = totalLocations >= maxLocations;

  return (
    <div className="flex flex-col gap-3 border-b border-[--color-border] bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[--color-text-primary]">
          Sedes
        </h1>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          {totalLocations} de {maxLocations} {maxLocations === 1 ? 'sede' : 'sedes'} del plan{' '}
          <span className="font-medium text-[--color-text-primary]">{PLAN_LABEL[planType]}</span>
        </p>
      </div>

      <TooltipProvider delayDuration={200}>
        {atLimit ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button
                  type="button"
                  variant="default"
                  disabled
                  className="gap-2"
                  aria-label="Nueva sede (deshabilitado: límite del plan alcanzado)"
                >
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Nueva sede
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Has alcanzado el límite de {maxLocations} {maxLocations === 1 ? 'sede' : 'sedes'} de tu plan {PLAN_LABEL[planType]}
              </p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            variant="default"
            onClick={onCreate}
            disabled={!canCreate}
            className="gap-2"
            aria-label="Crear nueva sede"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva sede
          </Button>
        )}
      </TooltipProvider>
    </div>
  );
}
