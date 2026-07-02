import { Thermometer, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EquipmentStatusCard } from './EquipmentStatusCard';
import type { Equipment, TemperatureReading } from '@/shared/types/supabase';

export interface EquipmentStatusGridProps {
  equipmentList: Equipment[];
  latestByEquipment: Map<string, TemperatureReading>;
  now?: Date;
  addEquipmentHref?: string;
}

export function EquipmentStatusGrid({
  equipmentList,
  latestByEquipment,
  now,
  addEquipmentHref = '/equipment',
}: EquipmentStatusGridProps) {
  if (equipmentList.length === 0) {
    return (
      <Card data-testid="equipment-status-grid-empty">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--color-eucalyptus-bg]">
            <Thermometer className="h-6 w-6 text-[--color-eucalyptus]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-medium text-[--color-text-primary]">
              Aún no hay equipos en esta sede
            </p>
            <p className="mt-1 text-sm text-[--color-text-secondary]">
              Crea equipos primero para ver su estado en el dashboard.
            </p>
          </div>
          <a
            href={addEquipmentHref}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[--color-eucalyptus] hover:underline"
          >
            <LinkIcon className="h-4 w-4" aria-hidden="true" />
            Ir a equipos
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="equipment-status-grid"
    >
      {equipmentList.map((equipment) => (
        <EquipmentStatusCard
          key={equipment.id}
          equipment={equipment}
          latestReading={latestByEquipment.get(equipment.id) ?? null}
          now={now}
        />
      ))}
    </div>
  );
}