import { useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
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
import type { Location, LocationDependencies } from '../services/locations.service';

export interface DeleteLocationDialogProps {
  open: boolean;
  location: Location | null;
  dependencies: LocationDependencies | null;
  isLoadingDependencies?: boolean;
  isDeleting?: boolean;
  serverError?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (location: Location) => void | Promise<void>;
}

export function DeleteLocationDialog({
  open,
  location,
  dependencies,
  isLoadingDependencies = false,
  isDeleting = false,
  serverError = null,
  onOpenChange,
  onConfirm,
}: DeleteLocationDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isDeleting && !isLoadingDependencies && dependencies && location) {
        e.preventDefault();
        void onConfirm(location);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, isDeleting, isLoadingDependencies, dependencies, location, onConfirm]);

  if (!location) return null;

  const totalDependencies = dependencies
    ? dependencies.equipment + dependencies.staff + dependencies.readings
    : 0;
  const hasDependencies = totalDependencies > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar sede</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al eliminar</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {isLoadingDependencies || !dependencies ? (
          <div className="flex items-center gap-3 py-2 text-sm text-[--color-text-secondary]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[--color-eucalyptus] border-t-transparent" />
            <span>Calculando dependencias...</span>
          </div>
        ) : hasDependencies ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Esta sede tiene datos asociados</AlertTitle>
            <AlertDescription>
              <p>
                Al eliminar <strong>{location.name}</strong> se borrarán también:
              </p>
              <ul className="mt-2 list-disc space-y-0.5 pl-5">
                {dependencies.equipment > 0 && (
                  <li>
                    {dependencies.equipment} {dependencies.equipment === 1 ? 'equipo' : 'equipos'}
                  </li>
                )}
                {dependencies.staff > 0 && (
                  <li>
                    {dependencies.staff} {dependencies.staff === 1 ? 'persona' : 'personas'} de staff
                  </li>
                )}
                {dependencies.readings > 0 && (
                  <li>
                    {dependencies.readings}{' '}
                    {dependencies.readings === 1 ? 'lectura' : 'lecturas'} de temperatura
                  </li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-[--color-text-secondary]">
            ¿Estás seguro de que quieres eliminar la sede <strong>{location.name}</strong>?
            Esta acción no se puede deshacer.
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void onConfirm(location)}
            disabled={isDeleting || isLoadingDependencies || !dependencies}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {isDeleting ? 'Eliminando...' : 'Eliminar sede'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
