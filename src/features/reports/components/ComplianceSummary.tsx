import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { ComplianceSummary } from '../types';

export interface ComplianceSummaryProps {
  summary: ComplianceSummary;
}

export function ComplianceSummaryCard({ summary }: ComplianceSummaryProps) {
  const colorClass =
    summary.percent >= 90
      ? 'text-[--color-eucalyptus]'
      : summary.percent >= 70
        ? 'text-[--color-warning]'
        : 'text-[--color-danger]';

  return (
    <Card data-testid="compliance-summary">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cumplimiento del período</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <span className={`font-mono text-4xl font-medium ${colorClass}`}>
            {summary.percent.toFixed(1)}%
          </span>
          <span className="text-sm text-[--color-text-secondary]">
            {summary.inRangeReadings} de {summary.totalReadings} lecturas en rango
          </span>
        </div>

        {summary.byEquipment.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-[--color-border] pt-3">
            <p className="text-xs font-medium uppercase text-[--color-text-muted]">Por equipo</p>
            <ul className="space-y-1 text-sm">
              {summary.byEquipment.map((eq) => (
                <li key={eq.equipmentId} className="flex items-center justify-between">
                  <span className="truncate">{eq.equipmentName}</span>
                  <span
                    className={
                      eq.percent >= 90
                        ? 'text-[--color-eucalyptus]'
                        : eq.percent >= 70
                          ? 'text-[--color-warning]'
                          : 'text-[--color-danger]'
                    }
                  >
                    {eq.inRangeReadings}/{eq.totalReadings} ({eq.percent.toFixed(0)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function IncidentSummaryCard({
  total,
  resolved,
  open,
}: {
  total: number;
  resolved: number;
  open: number;
}) {
  return (
    <Card data-testid="incident-summary">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Incidentes del período</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl font-medium">{total}</span>
          <span className="text-[--color-text-secondary]">total</span>
        </div>
        <div className="flex items-center gap-2 text-[--color-eucalyptus]">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span className="font-mono text-lg">{resolved}</span>
          <span className="text-[--color-text-secondary]">resueltos</span>
        </div>
        <div className="flex items-center gap-2 text-[--color-danger]">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <span className="font-mono text-lg">{open}</span>
          <span className="text-[--color-text-secondary]">abiertos</span>
        </div>
      </CardContent>
    </Card>
  );
}
