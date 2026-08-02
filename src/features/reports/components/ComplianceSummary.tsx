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
    <Card data-testid="compliance-summary" className="py-1">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm">Cumplimiento del período</CardTitle>
      </CardHeader>
      <CardContent className="flex items-baseline gap-3">
        <span className={`font-mono text-2xl font-medium ${colorClass}`}>
          {summary.percent.toFixed(1)}%
        </span>
        <span className="text-xs text-[--color-text-secondary]">
          {summary.inRangeReadings} de {summary.totalReadings} en rango
        </span>
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
    <Card data-testid="incident-summary" className="py-1">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm">Incidentes del período</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4 text-sm">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl font-medium">{total}</span>
          <span className="text-xs text-[--color-text-secondary]">total</span>
        </div>
        <div className="flex items-center gap-1 text-[--color-eucalyptus]">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span className="font-mono text-base">{resolved}</span>
          <span className="text-xs text-[--color-text-secondary]">resueltos</span>
        </div>
        <div className="flex items-center gap-1 text-[--color-danger]">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <span className="font-mono text-base">{open}</span>
          <span className="text-xs text-[--color-text-secondary]">abiertos</span>
        </div>
      </CardContent>
    </Card>
  );
}
