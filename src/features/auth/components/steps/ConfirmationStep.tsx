import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import type {
  OrganizationFormData,
  LocationFormData,
  StaffMemberFormData,
  EquipmentFormData,
} from '../../schemas/onboarding.schema';
import { useAuthStore } from '../../store/auth.store';

interface ConfirmationStepProps {
  fullName: string;
  organization: OrganizationFormData | null;
  location: LocationFormData | null;
  staffMembers: StaffMemberFormData[];
  equipment: EquipmentFormData[];
  onConfirm: () => Promise<{ success: boolean }>;
  isLoading?: boolean;
}

export function ConfirmationStep({
  fullName,
  organization,
  location,
  staffMembers,
  equipment,
  onConfirm,
  isLoading,
}: ConfirmationStepProps) {
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = async () => {
    const result = await onConfirm();
    if (result.success) {
      setIsSuccess(true);
      navigate('/');
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-12 w-12 text-[--color-eucalyptus] mb-4" />
            <CardTitle>¡Todo listo!</CardTitle>
            <CardDescription>
              Tu cuenta y organización han sido creadas exitosamente.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Confirmar configuración</CardTitle>
        <CardDescription>
          Revisa el resumen y crea tu cuenta. Luego podrás agregar más personal y equipos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-[--color-border] p-4 space-y-3">
          <h4 className="font-medium text-sm">Resumen de configuración</h4>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-[--color-slate-500]">Cuenta:</span>
              <span className="ml-2">{fullName} ({session?.user?.email})</span>
            </div>

            {organization && (
              <div>
                <span className="text-[--color-slate-500]">Organización:</span>
                <span className="ml-2">{organization.name}</span>
              </div>
            )}

            {location && (
              <div>
                <span className="text-[--color-slate-500]">Sede:</span>
                <span className="ml-2">{location.name}</span>
              </div>
            )}

            <div>
              <span className="text-[--color-slate-500]">Personal:</span>
              <span className="ml-2">{staffMembers.length} persona(s)</span>
            </div>

            <div>
              <span className="text-[--color-slate-500]">Equipos:</span>
              <span className="ml-2">{equipment.length} equipo(s)</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Creando...' : 'Crear y entrar al dashboard'}
        </Button>
      </CardContent>
    </Card>
  );
}
