import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSchema, type OrganizationFormData } from '../../schemas/onboarding.schema';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { BusinessTypeEnum, PlanTypeEnum } from '@/shared/types/supabase';

const BUSINESS_TYPES: { value: BusinessTypeEnum; label: string }[] = [
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'pharmacy', label: 'Farmacia' },
  { value: 'butcher_shop', label: 'Carnicería' },
  { value: 'supermarket', label: 'Supermercado' },
  { value: 'general', label: 'Otro' },
];

const PLANS: { value: PlanTypeEnum; label: string }[] = [
  { value: 'basic', label: 'Básico (1 sede)' },
  { value: 'pro', label: 'Pro (3 sedes)' },
  { value: 'enterprise', label: 'Enterprise (sedes ilimitadas)' },
];

interface OrganizationStepProps {
  defaultValues?: OrganizationFormData;
  onNext: (data: OrganizationFormData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function OrganizationStep({ defaultValues, onNext, onBack, isLoading }: OrganizationStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: defaultValues ?? { planType: 'basic' },
  });

  const selectedBusinessType = watch('businessType');
  const selectedPlan = watch('planType');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Datos de tu organización</CardTitle>
        <CardDescription>Cuéntanos sobre tu empresa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la organización</Label>
            <Input
              id="name"
              placeholder="Mi Empresa Ltda."
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-[--color-danger]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Tipo de negocio</Label>
            <Select
              value={selectedBusinessType}
              onValueChange={(value) => setValue('businessType', value as BusinessTypeEnum)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && (
              <p className="text-xs text-[--color-danger]">{errors.businessType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="planType">Plan inicial</Label>
            <Select
              value={selectedPlan}
              onValueChange={(value) => setValue('planType', value as PlanTypeEnum)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((plan) => (
                  <SelectItem key={plan.value} value={plan.value}>
                    {plan.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.planType && (
              <p className="text-xs text-[--color-danger]">{errors.planType.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
              Volver
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Continuar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}