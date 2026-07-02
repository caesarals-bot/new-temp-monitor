import { useMemo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { IncidentCard } from './IncidentCard';
import type { IncidentWithReading } from '../types';

export interface IncidentListProps {
  incidents: IncidentWithReading[];
  isLoading: boolean;
  listError: string | null;
  canResolve: boolean;
  onResolve: (incident: IncidentWithReading) => void;
}

export function IncidentList({
  incidents,
  isLoading,
  listError,
  canResolve,
  onResolve,
}: IncidentListProps) {
  const sorted = useMemo(() => {
    return [...incidents].sort((a, b) => {
      if (a.status === b.status) {
        return b.created_at.localeCompare(a.created_at);
      }
      return a.status === 'open' ? -1 : 1;
    });
  }, [incidents]);

  if (listError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{listError}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading && sorted.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-[--color-text-secondary]">
          Cargando incidentes...
        </CardContent>
      </Card>
    );
  }

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-base font-medium text-[--color-text-primary]">
            Sin incidentes
          </p>
          <p className="text-sm text-[--color-text-secondary]">
            No hay incidentes que coincidan con los filtros actuales.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="incidents-grid">
      {sorted.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          canResolve={canResolve}
          onResolve={onResolve}
        />
      ))}
    </div>
  );
}