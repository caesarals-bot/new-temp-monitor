import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import type { OrganizationListItem } from '../types';

const PLAN_VALUES = ['basic', 'pro', 'enterprise'] as const;

// Sugerencias de máx. sedes por plan (editable por el admin).
const PLAN_DEFAULT_MAX_LOCATIONS: Record<(typeof PLAN_VALUES)[number], number> = {
  basic: 1,
  pro: 5,
  enterprise: 20,
};

const schema = z.object({
  planType: z.enum(PLAN_VALUES),
  maxLocations: z.coerce
    .number({ message: 'Máximo de sedes debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 sede')
    .max(50, 'Máximo 50 sedes'),
  confirmation: z.literal('confirmar', {
    message: 'Debes escribir "confirmar" para proceder',
  }),
});

type FormValues = z.infer<typeof schema>;

const planLabels: Record<(typeof PLAN_VALUES)[number], string> = {
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const planDescriptions: Record<(typeof PLAN_VALUES)[number], string> = {
  basic: '1 sede. Para negocios pequeños.',
  pro: '5 sedes sugeridas. Para operaciones medianas.',
  enterprise: '20 sedes sugeridas. Multi-sucursal.',
};

export interface OrganizationPlanDialogProps {
  open: boolean;
  org: OrganizationListItem | null;
  isChanging: boolean;
  planError: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    planType: OrganizationListItem['plan_type'];
    maxLocations: number;
  }) => Promise<void>;
}

export function OrganizationPlanDialog({
  open,
  org,
  isChanging,
  planError,
  onOpenChange,
  onSubmit,
}: OrganizationPlanDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      planType: org?.plan_type ?? 'basic',
      maxLocations: org?.max_locations ?? PLAN_DEFAULT_MAX_LOCATIONS.basic,
      confirmation: '' as never,
    },
  });

  useEffect(() => {
    if (open && org) {
      form.reset({
        planType: org.plan_type,
        maxLocations: org.max_locations,
        confirmation: '' as never,
      });
      form.clearErrors();
    }
  }, [open, org, form]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedPlan = watch('planType');
  const currentMax = watch('maxLocations');

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({ planType: data.planType, maxLocations: data.maxLocations });
  });

  if (!org) return null;

  const willLowerMaxLocations = currentMax < org.max_locations;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          <DialogHeader>
            <DialogTitle>Cambiar plan de {org.name}</DialogTitle>
            <DialogDescription>
              Actualiza el plan y el máximo de sedes permitidas. Afecta el límite de altas futuras.
            </DialogDescription>
          </DialogHeader>

          {planError && (
            <Alert variant="destructive">
              <AlertDescription>{planError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="plan-select" className="text-sm font-medium">
              Nuevo plan
            </label>
            <select
              id="plan-select"
              className="w-full rounded-md border border-[--color-border] bg-white px-3 py-2 text-sm"
              {...register('planType', {
                onChange: (e) => {
                  const plan = e.target.value as (typeof PLAN_VALUES)[number];
                  // Solo sugerir si el admin no escribió un valor custom mayor.
                  if (!currentMax || currentMax <= PLAN_DEFAULT_MAX_LOCATIONS[plan]) {
                    setValue('maxLocations', PLAN_DEFAULT_MAX_LOCATIONS[plan]);
                  }
                },
              })}
            >
              {PLAN_VALUES.map((p) => (
                <option key={p} value={p} disabled={p === org.plan_type}>
                  {planLabels[p]}
                  {p === org.plan_type ? ' (actual)' : ''}
                </option>
              ))}
            </select>
            {selectedPlan && (
              <p className="text-xs text-[--color-text-secondary]">
                {planDescriptions[selectedPlan]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="max-locations" className="text-sm font-medium">
              Máximo de sedes
            </label>
            <input
              id="max-locations"
              type="number"
              min={1}
              max={50}
              className="w-full rounded-md border border-[--color-border] bg-white px-3 py-2 text-sm"
              {...register('maxLocations')}
            />
            {errors.maxLocations && (
              <p className="text-xs text-[--color-danger]">{errors.maxLocations.message}</p>
            )}
            {willLowerMaxLocations && (
              <p className="text-xs text-[--color-warning]">
                ⚠️ Estás bajando el máximo de {org.max_locations} a {currentMax} sedes. No se
                eliminan sedes existentes, pero el trigger `check_location_limit` bloqueará altas
                futuras.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="plan-confirmation" className="text-sm font-medium">
              Escribe <span className="font-mono">confirmar</span> para proceder
            </label>
            <input
              id="plan-confirmation"
              type="text"
              autoComplete="off"
              className="w-full rounded-md border border-[--color-border] bg-white px-3 py-2 text-sm"
              {...register('confirmation')}
            />
            {errors.confirmation && (
              <p className="text-xs text-[--color-danger]">{errors.confirmation.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isChanging}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isChanging}>
              {isChanging ? 'Aplicando...' : 'Confirmar cambio de plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
