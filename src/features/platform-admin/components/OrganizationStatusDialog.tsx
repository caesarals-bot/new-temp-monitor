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

const STATUS_VALUES = ['active', 'paused', 'suspended'] as const;

const schema = z.object({
  status: z.enum(STATUS_VALUES),
  confirmation: z.literal('confirmar', {
    message: 'Debes escribir "confirmar" para proceder',
  }),
});

type FormValues = z.infer<typeof schema>;

const statusLabels: Record<OrganizationListItem['status'], string> = {
  active: 'Activa',
  paused: 'Pausada',
  suspended: 'Suspendida',
};

const statusDescriptions: Record<OrganizationListItem['status'], string> = {
  active: 'Los usuarios podrán iniciar sesión y operar normalmente.',
  paused: 'Los usuarios no podrán registrar lecturas hasta que sea reactivada.',
  suspended: 'Todos los accesos quedan bloqueados. Solo un platform admin puede revertir.',
};

export interface OrganizationStatusDialogProps {
  open: boolean;
  org: OrganizationListItem | null;
  isChanging: boolean;
  statusError: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newStatus: OrganizationListItem['status']) => Promise<void>;
}

export function OrganizationStatusDialog({
  open,
  org,
  isChanging,
  statusError,
  onOpenChange,
  onSubmit,
}: OrganizationStatusDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { status: org?.status ?? 'active', confirmation: '' as never },
  });

  useEffect(() => {
    if (open && org) {
      form.reset({ status: org.status, confirmation: '' as never });
      form.clearErrors();
    }
  }, [open, org, form]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data.status);
  });

  if (!org) return null;
  const currentStatus = org.status;
  const newStatus = form.watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          <DialogHeader>
            <DialogTitle>Cambiar estado de {org.name}</DialogTitle>
            <DialogDescription>
              Esta acción afecta el acceso de todos los usuarios de la organización.
            </DialogDescription>
          </DialogHeader>

          {statusError && (
            <Alert variant="destructive">
              <AlertDescription>{statusError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="status-select" className="text-sm font-medium">
              Nuevo estado
            </label>
            <select
              id="status-select"
              className="w-full rounded-md border border-[--color-border] bg-white px-3 py-2 text-sm"
              {...register('status')}
            >
              {STATUS_VALUES.map((s) => (
                <option key={s} value={s} disabled={s === currentStatus}>
                  {statusLabels[s]}
                  {s === currentStatus ? ' (actual)' : ''}
                </option>
              ))}
            </select>
            {newStatus && newStatus !== currentStatus && (
              <p className="text-xs text-[--color-text-secondary]">
                {statusDescriptions[newStatus]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="status-confirmation" className="text-sm font-medium">
              Escribe <span className="font-mono">confirmar</span> para proceder
            </label>
            <input
              id="status-confirmation"
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
              {isChanging ? 'Aplicando...' : 'Confirmar cambio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
