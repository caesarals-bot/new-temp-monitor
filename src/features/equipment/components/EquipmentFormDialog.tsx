import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  type CreateEquipmentFormData,
  type UpdateEquipmentFormData,
} from '../schemas/equipment.schema';
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
import type { Equipment } from '@/shared/types/supabase';

export type EquipmentFormMode = 'create' | 'edit';

export interface EquipmentFormDialogProps {
  open: boolean;
  mode: EquipmentFormMode;
  equipment?: Equipment | null;
  isLoading?: boolean;
  serverError?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmitCreate: (data: CreateEquipmentFormData) => void | Promise<void>;
  onSubmitEdit: (id: string, data: UpdateEquipmentFormData) => void | Promise<void>;
}

type FormValues = {
  name: string;
  physicalLocation: string;
  code: string;
  minTemp: number;
  maxTemp: number;
};

const EMPTY: FormValues = {
  name: '',
  physicalLocation: '',
  code: '',
  minTemp: 0,
  maxTemp: 6,
};

export function EquipmentFormDialog({
  open,
  mode,
  equipment,
  isLoading = false,
  serverError = null,
  onOpenChange,
  onSubmitCreate,
  onSubmitEdit,
}: EquipmentFormDialogProps) {
  const isEdit = mode === 'edit';

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? updateEquipmentSchema : createEquipmentSchema) as never,
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && equipment) {
      form.reset({
        name: equipment.name,
        physicalLocation: equipment.physical_location ?? '',
        code: equipment.code ?? '',
        minTemp: equipment.min_temp,
        maxTemp: equipment.max_temp,
      });
    } else if (!isEdit) {
      form.reset(EMPTY);
    }
  }, [open, isEdit, equipment, form]);

  useEffect(() => {
    if (!open) form.clearErrors();
  }, [open, form]);

  const title = isEdit ? 'Editar equipo' : 'Nuevo equipo';
  const description = isEdit
    ? 'Modifica el nombre, ubicación o rangos térmicos del equipo.'
    : 'Crea un nuevo equipo de frío en esta sede.';

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isEdit) {
      if (!equipment) return;
      const editData: UpdateEquipmentFormData = {
        name: data.name,
        physicalLocation: data.physicalLocation === '' ? null : data.physicalLocation,
        code: data.code === '' ? null : data.code,
        minTemp: data.minTemp,
        maxTemp: data.maxTemp,
      };
      await onSubmitEdit(equipment.id, editData);
      return;
    }
    const createData: CreateEquipmentFormData = {
      name: data.name,
      physicalLocation: data.physicalLocation === '' ? undefined : data.physicalLocation,
      minTemp: data.minTemp,
      maxTemp: data.maxTemp,
    };
    await onSubmitCreate(createData);
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
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="equipment-name">Nombre del equipo</Label>
            <Input
              id="equipment-name"
              placeholder="Refrigerador Lácteos"
              aria-invalid={errors.name ? 'true' : 'false'}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-[--color-danger]">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-physical-location">Ubicación física (opcional)</Label>
            <Input
              id="equipment-physical-location"
              placeholder="Cocina - pared norte"
              {...register('physicalLocation')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-code">Código (opcional)</Label>
            <Input id="equipment-code" placeholder="EQ-CC-001" {...register('code')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="equipment-min-temp">Temp. mínima (°C)</Label>
              <Input
                id="equipment-min-temp"
                type="number"
                step="any"
                aria-invalid={errors.minTemp ? 'true' : 'false'}
                {...register('minTemp', { valueAsNumber: true })}
              />
              {errors.minTemp && (
                <p className="text-xs text-[--color-danger]">{errors.minTemp.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment-max-temp">Temp. máxima (°C)</Label>
              <Input
                id="equipment-max-temp"
                type="number"
                step="any"
                aria-invalid={errors.maxTemp ? 'true' : 'false'}
                {...register('maxTemp', { valueAsNumber: true })}
              />
              {errors.maxTemp && (
                <p className="text-xs text-[--color-danger]">{errors.maxTemp.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? 'Guardando...'
                  : 'Creando...'
                : isEdit
                  ? 'Guardar cambios'
                  : 'Crear equipo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
