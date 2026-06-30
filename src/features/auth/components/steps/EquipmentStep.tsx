import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { equipmentSchema, type EquipmentFormData } from '../../schemas/onboarding.schema';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface EquipmentStepProps {
  equipment: EquipmentFormData[];
  onAdd: (data: EquipmentFormData) => void;
  onRemove: (index: number) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function EquipmentStep({ equipment, onAdd, onRemove, onNext, onBack, isLoading }: EquipmentStepProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
  });

  const handleAdd = (data: EquipmentFormData) => {
    onAdd(data);
    reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Equipos de frío</CardTitle>
        <CardDescription>
          ¿Qué equipos monitorearás? Puedes agregar varios o saltar este paso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleAdd)} className="space-y-4">
          <div className="grid grid-cols-[1fr,1fr,1fr,auto] gap-3">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="equipName">Nombre del equipo</Label>
              <Input
                id="equipName"
                placeholder="Nevera Lácteos 1"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-[--color-danger]">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="physicalLocation">Ubicación</Label>
              <Input
                id="physicalLocation"
                placeholder="Cocina"
                {...register('physicalLocation')}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="icon" variant="outline" disabled={isLoading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minTemp">Temp. mínima (°C)</Label>
              <Input
                id="minTemp"
                type="number"
                step="0.1"
                placeholder="-10"
                {...register('minTemp', { valueAsNumber: true })}
              />
              {errors.minTemp && (
                <p className="text-xs text-[--color-danger]">{errors.minTemp.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTemp">Temp. máxima (°C)</Label>
              <Input
                id="maxTemp"
                type="number"
                step="0.1"
                placeholder="8"
                {...register('maxTemp', { valueAsNumber: true })}
              />
              {errors.maxTemp && (
                <p className="text-xs text-[--color-danger]">{errors.maxTemp.message}</p>
              )}
            </div>
          </div>
        </form>

        {equipment.length > 0 && (
          <div className="space-y-2">
            <Label className="text-[--color-slate-500]">Equipos agregados:</Label>
            {equipment.map((equip, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-[--color-border] px-3 py-2"
              >
                <span className="text-sm">
                  <span className="font-medium">{equip.name}</span>
                  <span className="text-[--color-slate-500]">
                    {' '}· {equip.minTemp}°C a {equip.maxTemp}°C
                    {equip.physicalLocation && ` · ${equip.physicalLocation}`}
                  </span>
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="h-4 w-4 text-[--color-danger]" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
            Volver
          </Button>
          <Button type="button" variant="outline" onClick={onNext} disabled={isLoading}>
            Saltar por ahora
          </Button>
          <Button onClick={onNext} disabled={isLoading || equipment.length === 0}>
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}