import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, type LocationFormData } from '../../schemas/onboarding.schema';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface FirstLocationStepProps {
  defaultValues?: LocationFormData;
  onNext: (data: LocationFormData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function FirstLocationStep({ defaultValues, onNext, onBack, isLoading }: FirstLocationStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues,
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Tu primera sede</CardTitle>
        <CardDescription>¿Dónde estarás monitoreando temperaturas?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la sede</Label>
            <Input
              id="name"
              placeholder="Casa Central"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-[--color-danger]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección (opcional)</Label>
            <Input
              id="address"
              placeholder="Av. Principal 123, Santiago"
              {...register('address')}
            />
            {errors.address && (
              <p className="text-xs text-[--color-danger]">{errors.address.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
              Volver
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Continuar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}