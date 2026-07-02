import { useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createStaffSchema,
  updateStaffSchema,
  type CreateStaffFormData,
  type UpdateStaffFormData,
} from '../schemas/staff.schema';
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
import type { Staff } from '@/shared/types/supabase';

export type StaffFormMode = 'create' | 'edit';

export interface StaffFormDialogProps {
  open: boolean;
  mode: StaffFormMode;
  staff?: Staff | null;
  isLoading?: boolean;
  serverError?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmitCreate: (data: CreateStaffFormData) => void | Promise<void>;
  onSubmitEdit: (id: string, data: UpdateStaffFormData) => void | Promise<void>;
}

type FormValues = CreateStaffFormData & UpdateStaffFormData;

export function StaffFormDialog({
  open,
  mode,
  staff,
  isLoading = false,
  serverError = null,
  onOpenChange,
  onSubmitCreate,
  onSubmitEdit,
}: StaffFormDialogProps) {
  const isEdit = mode === 'edit';

  const form: UseFormReturn<FormValues> = useForm<FormValues>({
    resolver: zodResolver(isEdit ? updateStaffSchema : createStaffSchema),
    defaultValues: {
      name: '',
      role: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && staff) {
      form.reset({
        name: staff.name,
        role: staff.role,
      });
    } else if (!isEdit) {
      form.reset({ name: '', role: '' });
    }
  }, [open, isEdit, staff, form]);

  useEffect(() => {
    if (!open) form.clearErrors();
  }, [open, form]);

  const title = isEdit ? 'Editar persona' : 'Nueva persona';
  const description = isEdit
    ? 'Modifica el nombre o el puesto de la persona.'
    : 'Agrega una nueva persona al personal de esta sede.';

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isEdit) {
      if (staff) await onSubmitEdit(staff.id, { name: data.name, role: data.role });
      return;
    }
    await onSubmitCreate({ name: data.name, role: data.role });
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
            <Label htmlFor="staff-name">Nombre</Label>
            <Input
              id="staff-name"
              placeholder="María López"
              aria-invalid={errors.name ? 'true' : 'false'}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-[--color-danger]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-role">Puesto</Label>
            <Input
              id="staff-role"
              placeholder="Cocinera"
              aria-invalid={errors.role ? 'true' : 'false'}
              {...register('role')}
            />
            {errors.role && (
              <p className="text-xs text-[--color-danger]">{errors.role.message}</p>
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
                  : 'Agregar persona'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
