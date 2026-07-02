import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffMemberSchema, type StaffMemberFormData } from '../../schemas/onboarding.schema';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface StaffStepProps {
  staffMembers: StaffMemberFormData[];
  onAdd: (data: StaffMemberFormData) => void;
  onRemove: (index: number) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function StaffStep({ staffMembers, onAdd, onRemove, onNext, onBack, isLoading }: StaffStepProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffMemberFormData>({
    resolver: zodResolver(staffMemberSchema),
  });

  const handleAdd = (data: StaffMemberFormData) => {
    onAdd(data);
    reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Personal de la sede</CardTitle>
        <CardDescription>
          ¿Quién registrará las temperaturas? Puedes agregar varios o saltar este paso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleAdd)} className="space-y-4">
          <div className="grid grid-cols-[1fr,1fr,auto] gap-3">
            <div className="space-y-2">
              <Label htmlFor="staffName">Nombre</Label>
              <Input
                id="staffName"
                placeholder="María López"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-[--color-danger]">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffRole">Puesto</Label>
              <Input
                id="staffRole"
                placeholder="Cocinero"
                {...register('role')}
              />
              {errors.role && (
                <p className="text-xs text-[--color-danger]">{errors.role.message}</p>
              )}
            </div>
            <div className="flex items-end">
              <Button type="submit" size="icon" variant="outline" disabled={isLoading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>

        {staffMembers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-[--color-slate-500]">Personal agregado:</Label>
            {staffMembers.map((staff, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-[--color-border] px-3 py-2"
              >
                <span className="text-sm">
                  <span className="font-medium">{staff.name}</span>
                  <span className="text-[--color-slate-500]"> — {staff.role}</span>
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
          <Button onClick={onNext} disabled={isLoading || staffMembers.length === 0}>
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}