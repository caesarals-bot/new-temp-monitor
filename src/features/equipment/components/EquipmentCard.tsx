import { Thermometer, Pencil, Trash2, MapPin, Hash, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { Equipment } from '@/shared/types/supabase';

export interface EquipmentCardProps {
  equipment: Equipment;
  readingsCount: number;
  canEdit: boolean;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
  className?: string;
}

function formatRange(min: number, max: number): string {
  return `${min}°C a ${max}°C`;
}

export function EquipmentCard({
  equipment,
  readingsCount,
  canEdit,
  onEdit,
  onDelete,
  className,
}: EquipmentCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[--color-eucalyptus-bg]">
            <Thermometer className="h-4 w-4 text-[--color-eucalyptus]" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{equipment.name}</CardTitle>
            {equipment.physical_location && (
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-[--color-text-secondary]">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{equipment.physical_location}</span>
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {formatRange(equipment.min_temp, equipment.max_temp)}
          </Badge>

          <Badge variant="secondary" className="gap-1">
            <ClipboardList className="h-3 w-3" aria-hidden="true" />
            <span>
              {readingsCount} {readingsCount === 1 ? 'lectura' : 'lecturas'}
            </span>
          </Badge>
        </div>

        {equipment.code && (
          <p className="flex items-center gap-1 text-xs text-[--color-text-muted]">
            <Hash className="h-3 w-3" aria-hidden="true" />
            <span className="font-mono">{equipment.code}</span>
          </p>
        )}

        {canEdit && (
          <div className="mt-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(equipment)}
              className="flex-1"
              aria-label={`Editar ${equipment.name}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Editar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDelete(equipment)}
              className="text-[--color-danger] hover:bg-[--color-danger-bg] hover:text-[--color-danger]"
              aria-label={`Eliminar ${equipment.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
