import { useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createLocationSchema,
  updateLocationSchema,
  type CreateLocationFormData,
  type UpdateLocationFormData,
} from '../schemas/location.schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import type { Location } from '@/shared/types/supabase';

export type LocationFormMode = 'create' | 'edit';

export interface LocationFormDialogProps {
  open: boolean;
  mode: LocationFormMode;
  location?: Location | null;
  isLoading?: boolean;
  serverError?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmitCreate: (data: CreateLocationFormData) => void | Promise<void>;
  onSubmitEdit: (id: string, data: UpdateLocationFormData) => void | Promise<void>;
}

type FormValues = CreateLocationFormData & UpdateLocationFormData;

export function LocationFormDialog({
  open,
  mode,
  location,
  isLoading = false,
  serverError = null,
  onOpenChange,
  onSubmitCreate,
  onSubmitEdit,
}: LocationFormDialogProps) {
  const isEdit = mode === 'edit';

  const form: UseFormReturn<FormValues> = useForm<FormValues>({
    resolver: zodResolver(isEdit ? updateLocationSchema : createLocationSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && location) {
      form.reset({
        name: location.name,
        address: location.address ?? '',
      });
    } else if (!isEdit) {
      form.reset({ name: '', address: '' });
    }
  }, [open, isEdit, location, form]);

  useEffect(() => {
    if (!open) form.clearErrors();
  }, [open, form]);

  const title = isEdit ? 'Editar sede' : 'Nueva sede';
  const description = isEdit
    ? 'Modifica el nombre o la dirección de la sede.'
    : 'Crea una nueva sede para tu organización.';

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isEdit) {
      const editData: UpdateLocationFormData = {
        name: data.name,
        address: data.address === '' ? null : (data.address ?? null),
      };
      if (location) await onSubmitEdit(location.id, editData);
      return;
    }
    const createData: CreateLocationFormData = {
      name: data.name,
      address: data.address === '' ? undefined : data.address,
    };
    await onSubmitCreate(createData);
  });

  const { register, formState: { errors } } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="location-name">Nombre de la sede</Label>
            <Input
              id="location-name"
              placeholder="Casa Central"
              aria-invalid={errors.name ? 'true' : 'false'}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-[--color-danger]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-address">Dirección (opcional)</Label>
            <Input
              id="location-address"
              placeholder="Av. Principal 123, Santiago"
              {...register('address')}
            />
            {errors.address && (
              <p className="text-xs text-[--color-danger]">{errors.address.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? 'Guardando...'
                  : 'Creando...'
                : isEdit
                  ? 'Guardar cambios'
                  : 'Crear sede'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
