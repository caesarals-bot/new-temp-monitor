import { AlertTriangle, CheckCircle2, Thermometer, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { formatTimeSince } from '@/features/readings/lib/timeSince';
import type { IncidentWithReading } from '../types';

export interface IncidentCardProps {
  incident: IncidentWithReading;
  canResolve: boolean;
  onResolve?: (incident: IncidentWithReading) => void;
  className?: string;
}

function formatRange(min: number, max: number): string {
  return `${min}°C a ${max}°C`;
}

export function IncidentCard({
  incident,
  canResolve,
  onResolve,
  className,
}: IncidentCardProps) {
  const isOpen = incident.status === 'open';
  const equipment = incident.reading?.equipment;
  const recordedAt = incident.reading?.recorded_at ?? incident.created_at;

  const resolveButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => onResolve?.(incident)}
      disabled={!canResolve || !isOpen}
      aria-label={`Resolver incidente de ${equipment?.name ?? 'equipo'}`}
      className="flex-1"
    >
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      Resolver
    </Button>
  );

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
              isOpen ? 'bg-[--color-danger-bg]' : 'bg-[--color-eucalyptus-bg]'
            )}
          >
            <AlertTriangle
              className={cn(
                'h-4 w-4',
                isOpen ? 'text-[--color-danger]' : 'text-[--color-eucalyptus]'
              )}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">
              {equipment?.name ?? 'Equipo desconocido'}
            </CardTitle>
            <p className="mt-1 truncate text-xs text-[--color-text-secondary]">
              {incident.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1 font-mono">
            <Thermometer className="h-3 w-3" aria-hidden="true" />
            <span>
              {incident.reading?.value ?? '—'}°C / {equipment ? formatRange(equipment.min_temp, equipment.max_temp) : '—'}
            </span>
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{formatTimeSince(recordedAt)}</span>
          </Badge>
          {isOpen ? (
            <Badge variant="destructive">Abierto</Badge>
          ) : (
            <Badge variant="secondary" className="bg-[--color-eucalyptus-bg] text-[--color-eucalyptus]">
              Resuelto
            </Badge>
          )}
        </div>

        {!isOpen && incident.action_taken && (
          <div className="rounded-md bg-[--color-surface] p-3 text-xs text-[--color-text-secondary]">
            <p className="font-medium text-[--color-text-primary]">Acción correctiva</p>
            <p className="mt-1">{incident.action_taken}</p>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2">
          {!canResolve && isOpen ? (
            <Tooltip>
              <TooltipTrigger asChild>{resolveButton}</TooltipTrigger>
              <TooltipContent>
                Solo owner, admin o manager pueden resolver incidentes.
              </TooltipContent>
            </Tooltip>
          ) : (
            resolveButton
          )}
        </div>
      </CardContent>
    </Card>
  );
}