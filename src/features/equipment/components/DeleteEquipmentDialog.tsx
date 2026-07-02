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
import type { Equipment } from '@/shared/types/supabase';

export interface DeleteEquipmentDialogProps {
  open: boolean;
  equipment: Equipment | null;
  readingsCount: number | null;
  isLoadingCount?: boolean;
  isDeleting?: boolean;
  serverError?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (equipment: Equipment) => void | Promise<void>;
}

export function DeleteEquipmentDialog({
  open,
  equipment,
  readingsCount,
  isLoadingCount = false,
  isDeleting = false,
  serverError = null,
  onOpenChange,
  onConfirm,
}: DeleteEquipmentDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isDeleting && !isLoadingCount && equipment) {
        e.preventDefault();
        void onConfirm(equipment);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, isDeleting, isLoadingCount, equipment, onConfirm]);

  if (!equipment) return null;

  const hasReadings = (readingsCount ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar equipo</DialogTitle>
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

        {isLoadingCount || readingsCount === null ? (
          <div className="flex items-center gap-3 py-2 text-sm text-[--color-text-secondary]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[--color-eucalyptus] border-t-transparent" />
            <span>Calculando dependencias...</span>
          </div>
        ) : hasReadings ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Este equipo tiene lecturas registradas</AlertTitle>
            <AlertDescription>
              <p>
                Al eliminar <strong>{equipment.name}</strong> se borrarán también{' '}
                <strong>
                  {readingsCount} {readingsCount === 1 ? 'lectura' : 'lecturas'}
                </strong>{' '}
                de temperatura y los incidentes asociados.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-[--color-text-secondary]">
            ¿Estás seguro de que quieres eliminar el equipo{' '}
            <strong>{equipment.name}</strong>?
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
            onClick={() => void onConfirm(equipment)}
            disabled={isDeleting || isLoadingCount}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {isDeleting ? 'Eliminando...' : 'Eliminar equipo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
