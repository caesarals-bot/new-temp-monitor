import { Thermometer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { isOutOfRange } from '../lib/isOutOfRange';
import { LastReadingBadge } from './LastReadingBadge';
import type { Equipment, TemperatureReading } from '@/shared/types/supabase';

export interface EquipmentStatusCardProps {
  equipment: Equipment;
  latestReading: TemperatureReading | null;
  now?: Date;
  className?: string;
}

type Status = 'ok' | 'alert' | 'no-reading';

function deriveStatus(
  equipment: Equipment,
  latestReading: TemperatureReading | null
): Status {
  if (!latestReading) return 'no-reading';
  return isOutOfRange(latestReading.value, equipment.min_temp, equipment.max_temp)
    ? 'alert'
    : 'ok';
}

const STATUS_STYLES: Record<
  Status,
  { ring: string; icon: string; badgeBg: string; badgeText: string; iconColor: string }
> = {
  ok: {
    ring: 'border-[--color-eucalyptus-border]',
    icon: 'bg-[--color-eucalyptus-bg]',
    badgeBg: 'bg-[--color-eucalyptus-bg]',
    badgeText: 'text-[--color-eucalyptus]',
    iconColor: 'text-[--color-eucalyptus]',
  },
  alert: {
    ring: 'border-[--color-danger-border]',
    icon: 'bg-[--color-danger-bg]',
    badgeBg: 'bg-[--color-danger-bg]',
    badgeText: 'text-[--color-danger]',
    iconColor: 'text-[--color-danger]',
  },
  'no-reading': {
    ring: 'border-[--color-warning-border]',
    icon: 'bg-[--color-warning-bg]',
    badgeBg: 'bg-[--color-warning-bg]',
    badgeText: 'text-[--color-warning]',
    iconColor: 'text-[--color-warning]',
  },
};

export function EquipmentStatusCard({
  equipment,
  latestReading,
  now,
  className,
}: EquipmentStatusCardProps) {
  const status = deriveStatus(equipment, latestReading);
  const styles = STATUS_STYLES[status];

  return (
    <Card
      className={cn('flex flex-col border-2', styles.ring, className)}
      data-testid="equipment-status-card"
      data-status={status}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
              styles.icon
            )}
          >
            {status === 'alert' ? (
              <AlertTriangle className={cn('h-4 w-4', styles.iconColor)} aria-hidden="true" />
            ) : status === 'ok' ? (
              <CheckCircle2 className={cn('h-4 w-4', styles.iconColor)} aria-hidden="true" />
            ) : (
              <Thermometer className={cn('h-4 w-4', styles.iconColor)} aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{equipment.name}</CardTitle>
            {equipment.physical_location && (
              <p className="mt-1 truncate text-xs text-[--color-text-secondary]">
                {equipment.physical_location}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              'font-mono text-3xl font-semibold tabular-nums',
              status === 'alert' ? 'text-[--color-danger]' : 'text-[--color-text-primary]'
            )}
            data-testid="latest-reading-value"
          >
            {latestReading ? `${latestReading.value.toFixed(1)}°C` : '—'}
          </span>
          <span className="text-xs text-[--color-text-muted]">
            {equipment.min_temp}°C / {equipment.max_temp}°C
          </span>
        </div>

        <LastReadingBadge recordedAt={latestReading?.recorded_at ?? null} now={now} />
      </CardContent>
    </Card>
  );
}