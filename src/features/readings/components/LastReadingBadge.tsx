import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { formatTimeSince, isStaleReading } from '../lib/timeSince';

export interface LastReadingBadgeProps {
  recordedAt: string | null | undefined;
  className?: string;
  now?: Date;
}

export function LastReadingBadge({ recordedAt, className, now }: LastReadingBadgeProps) {
  const hasReading = recordedAt !== null && recordedAt !== undefined;
  const stale = isStaleReading(recordedAt, now);

  if (!hasReading) {
    return (
      <Badge
        variant="warning"
        className={cn('gap-1', className)}
        aria-label="Sin lecturas registradas"
        data-testid="last-reading-badge"
        data-state="no-reading"
      >
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        <span>Sin lecturas</span>
      </Badge>
    );
  }

  const label = formatTimeSince(recordedAt, now);

  return (
    <Badge
      variant={stale ? 'warning' : 'secondary'}
      className={cn('gap-1', className)}
      aria-label={`Última lectura ${label}`}
      data-testid="last-reading-badge"
      data-state={stale ? 'stale' : 'fresh'}
    >
      <Clock className="h-3 w-3" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
}