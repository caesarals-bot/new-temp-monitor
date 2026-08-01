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

interface DistributionBarProps {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}

function DistributionBar({ label, value, total, colorClass }: DistributionBarProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-[--color-text-secondary]">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[--color-surface]">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
          data-testid={`distribution-bar-${label.toLowerCase()}`}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-mono">{value}</span>
    </div>
  );
}

const statusColors: Record<string, string> = {
  active: 'bg-[--color-eucalyptus]',
  paused: 'bg-[--color-warning]',
  suspended: 'bg-[--color-danger]',
};

const planColors: Record<string, string> = {
  basic: 'bg-[--color-text-muted]',
  pro: 'bg-[--color-eucalyptus]',
  enterprise: 'bg-[--color-primary]',
};

export function GlobalMetricsCards({ metrics, isLoading }: GlobalMetricsProps) {
  if (isLoading && !metrics) {
    return <p className="text-center text-sm text-[--color-text-muted]">Cargando métricas...</p>;
  }
  if (!metrics) return null;

  return (
    <div className="flex flex-col gap-4">
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

      <div className="grid gap-4 md:grid-cols-2" data-testid="global-metrics-distributions">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[--color-text-secondary]">
              Distribución por estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['active', 'paused', 'suspended'] as const).map((s) => (
              <DistributionBar
                key={s}
                label={s === 'active' ? 'Activa' : s === 'paused' ? 'Pausada' : 'Suspendida'}
                value={metrics.by_status?.[s] ?? 0}
                total={metrics.total_organizations}
                colorClass={statusColors[s] ?? 'bg-[--color-text-muted]'}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[--color-text-secondary]">
              Distribución por plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['basic', 'pro', 'enterprise'] as const).map((p) => (
              <DistributionBar
                key={p}
                label={p.charAt(0).toUpperCase() + p.slice(1)}
                value={metrics.by_plan?.[p] ?? 0}
                total={metrics.total_organizations}
                colorClass={planColors[p] ?? 'bg-[--color-text-muted]'}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
