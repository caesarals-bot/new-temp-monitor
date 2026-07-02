import { Building2, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { GlobalMetrics } from '../types';

export interface GlobalMetricsProps {
  metrics: GlobalMetrics | null;
  isLoading: boolean;
}

interface MetricCardProps {
  icon: typeof Building2;
  label: string;
  value: number | null;
  hint?: string;
  colorClass?: string;
}

function MetricCard({ icon: Icon, label, value, hint, colorClass }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[--color-text-secondary]">{label}</CardTitle>
        <Icon
          className={`h-4 w-4 ${colorClass ?? 'text-[--color-eucalyptus]'}`}
          aria-hidden="true"
        />
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-medium">{value ?? '—'}</div>
        {hint && <p className="mt-1 text-xs text-[--color-text-muted]">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function GlobalMetricsCards({ metrics, isLoading }: GlobalMetricsProps) {
  if (isLoading && !metrics) {
    return <p className="text-center text-sm text-[--color-text-muted]">Cargando métricas...</p>;
  }
  if (!metrics) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="global-metrics">
      <MetricCard
        icon={Building2}
        label="Organizaciones activas"
        value={metrics.active_organizations}
        hint={`de ${metrics.total_organizations} totales`}
      />
      <MetricCard
        icon={TrendingUp}
        label="Lecturas (7 días)"
        value={metrics.readings_last_7_days}
        hint="volumen global"
      />
      <MetricCard
        icon={AlertTriangle}
        label="Incidentes abiertos"
        value={metrics.open_incidents}
        colorClass="text-[--color-danger]"
      />
      <MetricCard
        icon={Activity}
        label="Total organizaciones"
        value={metrics.total_organizations}
        hint="registradas en plataforma"
      />
    </div>
  );
}
