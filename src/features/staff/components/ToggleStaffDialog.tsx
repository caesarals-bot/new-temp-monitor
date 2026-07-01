import { useEffect } from 'react';
import { AlertTriangle, Power } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import type { Staff } from '@/shared/types/supabase';

export interface ToggleStaffDialogProps {
  open: boolean;
  staff: Staff | null;
  readingsCount: number | null;
  isLoadingCount?: boolean;
  isToggling?: boolean;
  serverError?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (staff: Staff) => void | Promise<void>;
}

export function ToggleStaffDialog({
  open,
  staff,
  readingsCount,
  isLoadingCount = false,
  isToggling = false,
  serverError = null,
  onOpenChange,
  onConfirm,
}: ToggleStaffDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isToggling && !isLoadingCount && staff) {
        e.preventDefault();
        void onConfirm(staff);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, isToggling, isLoadingCount, staff, onConfirm]);

  if (!staff) return null;

  const willDeactivate = staff.active;
  const actionLabel = willDeactivate ? 'Desactivar' : 'Reactivar';
  const hasReadings = (readingsCount ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionLabel} persona</DialogTitle>
          <DialogDescription>
            {willDeactivate
              ? 'La persona no podrá registrar nuevas lecturas.'
              : 'La persona podrá volver a registrar lecturas.'}
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al {actionLabel.toLowerCase()}</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {isLoadingCount || readingsCount === null ? (
          <div className="flex items-center gap-3 py-2 text-sm text-[--color-text-secondary]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[--color-eucalyptus] border-t-transparent" />
            <span>Verificando lecturas asociadas...</span>
          </div>
        ) : hasReadings ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Esta persona tiene lecturas registradas</AlertTitle>
            <AlertDescription>
              <p>
                <strong>{staff.name}</strong> ha registrado{' '}
                <strong>
                  {readingsCount} {readingsCount === 1 ? 'lectura' : 'lecturas'}
                </strong>
                .
              </p>
              <p className="mt-2">
                {willDeactivate
                  ? 'Al desactivarla, sus lecturas históricas se conservarán pero no podrá registrar nuevas.'
                  : 'Al reactivarla, podrá registrar nuevas lecturas. El historial anterior se mantiene.'}
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-[--color-text-secondary]">
            ¿Estás seguro de que quieres {actionLabel.toLowerCase()} a{' '}
            <strong>{staff.name}</strong>?
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isToggling}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={willDeactivate ? 'destructive' : 'default'}
            onClick={() => void onConfirm(staff)}
            disabled={isToggling || isLoadingCount}
            className="gap-2"
          >
            <Power className="h-4 w-4" aria-hidden="true" />
            {isToggling ? `${actionLabel}...` : `${actionLabel} persona`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
