import { Building2, MapPin, Users, Thermometer, Activity, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { OrganizationStatusBadge } from './OrganizationStatusBadge';
import type { OrganizationDetail } from '../types';

export interface OrganizationDetailViewProps {
  detail: OrganizationDetail;
}

export function OrganizationDetailView({ detail }: OrganizationDetailViewProps) {
  return (
    <div className="flex flex-col gap-6" data-testid="organization-detail">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[--color-eucalyptus-bg]">
              <Building2 className="h-5 w-5 text-[--color-eucalyptus]" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-lg">{detail.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <OrganizationStatusBadge status={detail.status} />
                <span className="text-xs text-[--color-text-muted]">
                  Plan {detail.plan_type} · Máx {detail.max_locations} sedes
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[--color-text-muted]">
            Registrada el {new Date(detail.created_at).toLocaleDateString('es-CL')}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MapPin}
          label="Sedes"
          value={detail.counts.locations}
          hint={`${detail.locations.length} registradas`}
        />
        <StatCard
          icon={Users}
          label="Usuarios"
          value={detail.counts.profiles}
          hint={`${detail.profiles.length} registrados`}
        />
        <StatCard icon={Thermometer} label="Equipos" value={detail.counts.equipment} />
        <StatCard icon={Activity} label="Lecturas totales" value={detail.counts.readings} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Incidentes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-medium">
                {detail.counts.incidents_open + detail.counts.incidents_resolved}
              </span>
              <span className="text-[--color-text-secondary]">total</span>
            </div>
            <div className="flex items-center gap-2 text-[--color-danger]">
              <span className="font-mono text-lg">{detail.counts.incidents_open}</span>
              <span className="text-[--color-text-secondary]">abiertos</span>
            </div>
            <div className="flex items-center gap-2 text-[--color-eucalyptus]">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span className="font-mono text-lg">{detail.counts.incidents_resolved}</span>
              <span className="text-[--color-text-secondary]">resueltos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuarios ({detail.profiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {detail.profiles.length === 0 ? (
              <p className="text-sm text-[--color-text-muted]">Sin usuarios.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {detail.profiles.slice(0, 8).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {p.full_name ?? p.email}
                      <span className="ml-2 text-xs text-[--color-text-muted]">{p.email}</span>
                    </span>
                    <span className="rounded-full bg-[--color-surface] px-2 py-0.5 text-xs">
                      {p.role}
                    </span>
                  </li>
                ))}
                {detail.profiles.length > 8 && (
                  <li className="text-xs text-[--color-text-muted]">
                    y {detail.profiles.length - 8} más...
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sedes ({detail.locations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.locations.length === 0 ? (
            <p className="text-sm text-[--color-text-muted]">Sin sedes.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {detail.locations.map((loc) => (
                <li key={loc.id} className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-[--color-text-secondary]" aria-hidden="true" />
                  <span>{loc.name}</span>
                  {loc.address && (
                    <span className="text-xs text-[--color-text-muted]">· {loc.address}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: typeof Building2;
  label: string;
  value: number;
  hint?: string;
}

function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[--color-text-secondary]">{label}</CardTitle>
        <Icon className="h-4 w-4 text-[--color-eucalyptus]" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="font-mono text-2xl font-medium">{value}</div>
        {hint && <p className="mt-1 text-xs text-[--color-text-muted]">{hint}</p>}
      </CardContent>
    </Card>
  );
}
