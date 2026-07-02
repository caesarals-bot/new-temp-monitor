import { Link } from 'react-router';
import { ClipboardList, Thermometer, CheckCircle2, ArrowRight } from 'lucide-react';
import { useReadingForm } from '../hooks/useReadingForm';
import { ReadingForm } from '../components/ReadingForm';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

export function ReadingsPage() {
  const {
    activeLocationId, activeLocationName,
    equipmentList, staffList,
    isLoadingEquipment, isLoadingStaff,
    equipmentError, staffError,
    status, serverError, lastReadingValue, lastReadingEquipmentName,
    submit, resetStatus,
  } = useReadingForm();

  if (!activeLocationId) {
    return (
      <div className="flex flex-col">
        <ReadingsHeader activeLocationName={null} />
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--color-eucalyptus-bg]">
                <Thermometer className="h-6 w-6 text-[--color-eucalyptus]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-medium text-[--color-text-primary]">
                  Sin sede seleccionada
                </p>
                <p className="mt-1 text-sm text-[--color-text-secondary]">
                  Usa el selector de sede en la parte superior para registrar lecturas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fetchError = equipmentError ?? staffError;

  return (
    <div className="flex flex-col">
      <ReadingsHeader activeLocationName={activeLocationName} />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          {status === 'success' && lastReadingValue !== null && (
            <Card className="mb-6 border-[--color-success-border] bg-[--color-success-bg]">
              <CardContent className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="h-6 w-6 shrink-0 text-[--color-success]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-base font-medium text-[--color-text-primary]">
                      Lectura registrada
                    </p>
                    <p className="mt-1 text-sm text-[--color-text-secondary]">
                      {lastReadingValue}°C en{' '}
                      <span className="font-medium">{lastReadingEquipmentName ?? 'el equipo'}</span>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Link to="/readings/history">
                      Ver lecturas
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetStatus}
                  >
                    Registrar otra
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {fetchError && (
            <div className="mb-6 rounded-md border border-[--color-danger-border] bg-[--color-danger-bg] p-4 text-sm text-[--color-danger]">
              {fetchError}
            </div>
          )}

          {equipmentList.length === 0 && !isLoadingEquipment && !equipmentError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--color-eucalyptus-bg]">
                  <Thermometer className="h-6 w-6 text-[--color-eucalyptus]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-medium text-[--color-text-primary]">
                    Aún no hay equipos en esta sede
                  </p>
                  <p className="mt-1 text-sm text-[--color-text-secondary]">
                    Crea equipos primero para registrar lecturas.
                  </p>
                </div>
                <Link
                  to="/equipment"
                  className="mt-2 text-sm font-medium text-[--color-eucalyptus] hover:underline"
                >
                  Ir a equipos
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <ReadingForm
                  equipmentList={equipmentList}
                  staffList={staffList}
                  isSubmitting={status === 'submitting' || isLoadingEquipment || isLoadingStaff}
                  serverError={serverError}
                  onSubmit={submit}
                  onCancel={resetStatus}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReadingsHeaderProps {
  activeLocationName: string | null;
}

function ReadingsHeader({ activeLocationName }: ReadingsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[--color-border] bg-white px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[--color-eucalyptus-bg]">
          <ClipboardList className="h-5 w-5 text-[--color-eucalyptus]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[--color-text-primary]">
            Registrar lectura
          </h1>
          <p className="mt-1 text-sm text-[--color-text-secondary]">
            {activeLocationName ? (
              <>
                Sede activa:{' '}
                <span className="font-medium text-[--color-text-primary]">{activeLocationName}</span>
              </>
            ) : (
              'Selecciona una sede para registrar lecturas'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}