import { Link } from 'react-router';
import { Building2, MapPin, Users, Thermometer, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { OrganizationStatusBadge } from './OrganizationStatusBadge';
import type { OrganizationListItem } from '../types';

export interface OrganizationListProps {
  organizations: OrganizationListItem[];
  isLoading: boolean;
  listError: string | null;
  onChangeStatus: (org: OrganizationListItem) => void;
}

const businessTypeLabels: Record<string, string> = {
  restaurant: 'Restaurante',
  pharmacy: 'Farmacia',
  butcher_shop: 'Carnicería',
  supermarket: 'Supermercado',
  general: 'General',
};

export function OrganizationList({
  organizations,
  isLoading,
  listError,
  onChangeStatus,
}: OrganizationListProps) {
  if (listError) {
    return (
      <div className="rounded-md border border-[--color-danger-border] bg-[--color-danger-bg] p-4 text-sm text-[--color-danger]">
        {listError}
      </div>
    );
  }

  if (isLoading && organizations.length === 0) {
    return (
      <p className="text-center text-sm text-[--color-text-muted]">Cargando organizaciones...</p>
    );
  }

  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-[--color-text-muted]">
          Sin organizaciones que coincidan con los filtros.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4" data-testid="organization-list">
      {organizations.map((org) => (
        <Card key={org.id} className="hover:bg-[--color-surface]">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[--color-eucalyptus-bg]">
                <Building2 className="h-4 w-4 text-[--color-eucalyptus]" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/organizations/${org.id}`}
                    className="truncate text-base font-semibold text-[--color-text-primary] hover:underline"
                  >
                    {org.name}
                  </Link>
                  <OrganizationStatusBadge status={org.status} />
                </div>
                <p className="mt-1 text-xs text-[--color-text-muted]">
                  {org.business_type ? businessTypeLabels[org.business_type] : 'Sin rubro'} · Plan{' '}
                  {org.plan_type} · Máx {org.max_locations} sedes · Registrada el{' '}
                  {new Date(org.created_at).toLocaleDateString('es-CL')}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[--color-text-secondary]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {org.locations_count} {org.locations_count === 1 ? 'sede' : 'sedes'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" aria-hidden="true" />
                    {org.profiles_count} {org.profiles_count === 1 ? 'usuario' : 'usuarios'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Thermometer className="h-3 w-3" aria-hidden="true" />
                    {org.equipment_count} equipos
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onChangeStatus(org)}>
                Cambiar estado
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link
                  to={`/admin/organizations/${org.id}`}
                  aria-label={`Ver detalle de ${org.name}`}
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
