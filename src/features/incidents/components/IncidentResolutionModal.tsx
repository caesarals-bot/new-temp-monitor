import { useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resolveIncidentSchema, type ResolveIncidentFormData } from '../schemas/incident.schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import type { IncidentWithReading } from '../types';

export interface IncidentResolutionModalProps {
  open: boolean;
  incident: IncidentWithReading | null;
  isResolving: boolean;
  resolveError: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResolveIncidentFormData) => void | Promise<void>;
}

export function IncidentResolutionModal({
  open,
  incident,
  isResolving,
  resolveError,
  onOpenChange,
  onSubmit,
}: IncidentResolutionModalProps) {
  const form: UseFormReturn<ResolveIncidentFormData> = useForm<ResolveIncidentFormData>({
    resolver: zodResolver(resolveIncidentSchema) as never,
    defaultValues: { actionTaken: '' },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ actionTaken: '' });
      form.clearErrors();
    }
  }, [open, form]);

  const equipmentName = incident?.reading?.equipment?.name ?? 'equipo';
  const description = incident?.description ?? '';

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <DialogHeader>
            <DialogTitle>Resolver incidente</DialogTitle>
            <DialogDescription>
              Documenta la acción correctiva aplicada para cumplir con la normativa
              HACCP / ISP. Mínimo 20 caracteres.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-[--color-surface] p-3 text-xs text-[--color-text-secondary]">
            <p>
              <span className="font-medium text-[--color-text-primary]">Equipo:</span>{' '}
              {equipmentName}
            </p>
            <p className="mt-1">
              <span className="font-medium text-[--color-text-primary]">Desviación:</span>{' '}
              {description}
            </p>
          </div>

          {resolveError && (
            <Alert variant="destructive">
              <AlertDescription>{resolveError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="action-taken">Acción correctiva</Label>
            <Textarea
              id="action-taken"
              rows={4}
              placeholder="Ej: Se trasladaron los productos al equipo de respaldo y se llamó al técnico."
              aria-invalid={errors.actionTaken ? 'true' : 'false'}
              {...register('actionTaken')}
            />
            {errors.actionTaken && (
              <p className="text-xs text-[--color-danger]">{errors.actionTaken.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isResolving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isResolving}>
              {isResolving ? 'Cerrando incidente...' : 'Cerrar incidente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}