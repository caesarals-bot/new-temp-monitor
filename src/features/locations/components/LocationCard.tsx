import { MapPin, Pencil, Trash2, Thermometer, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { Location } from '@/shared/types/supabase';

export interface LocationCardProps {
  location: Location;
  equipmentCount: number;
  openIncidentCount: number;
  canEdit: boolean;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  className?: string;
}

export function LocationCard({
  location,
  equipmentCount,
  openIncidentCount,
  canEdit,
  onEdit,
  onDelete,
  className,
}: LocationCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[--color-eucalyptus-bg]">
            <MapPin className="h-4 w-4 text-[--color-eucalyptus]" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{location.name}</CardTitle>
            {location.address && (
              <CardDescription className="mt-1 truncate">{location.address}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Thermometer className="h-3 w-3" aria-hidden="true" />
            <span>
              {equipmentCount} {equipmentCount === 1 ? 'equipo' : 'equipos'}
            </span>
          </Badge>

          {openIncidentCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              <span>
                {openIncidentCount} {openIncidentCount === 1 ? 'incidente' : 'incidentes'}
              </span>
            </Badge>
          )}
        </div>

        {canEdit && (
          <div className="mt-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(location)}
              className="flex-1"
              aria-label={`Editar ${location.name}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Editar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDelete(location)}
              className="text-[--color-danger] hover:bg-[--color-danger-bg] hover:text-[--color-danger]"
              aria-label={`Eliminar ${location.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
