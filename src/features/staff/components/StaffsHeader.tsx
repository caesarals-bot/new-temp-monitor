import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

export interface StaffsHeaderProps {
  totalStaff: number;
  activeLocationName: string | null;
  canCreate: boolean;
  onCreate: () => void;
}

export function StaffsHeader({
  totalStaff,
  activeLocationName,
  canCreate,
  onCreate,
}: StaffsHeaderProps) {
  const noLocation = !activeLocationName;

  return (
    <div className="flex flex-col gap-3 border-b border-[--color-border] bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[--color-text-primary]">
          Personal
        </h1>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          {noLocation ? (
            'Selecciona una sede para ver su personal'
          ) : (
            <>
              {totalStaff} {totalStaff === 1 ? 'persona' : 'personas'} en{' '}
              <span className="font-medium text-[--color-text-primary]">{activeLocationName}</span>
            </>
          )}
        </p>
      </div>

      <TooltipProvider delayDuration={200}>
        {noLocation ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button
                  type="button"
                  variant="default"
                  disabled
                  className="gap-2"
                  aria-label="Agregar persona (deshabilitado: sin sede activa)"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Agregar persona
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Selecciona una sede en el selector superior para agregar personal</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            variant="default"
            onClick={onCreate}
            disabled={!canCreate}
            className="gap-2"
            aria-label="Agregar nueva persona al personal"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar persona
          </Button>
        )}
      </TooltipProvider>
    </div>
  );
}
