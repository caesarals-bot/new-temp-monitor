import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Progress } from '@/shared/components/ui/progress';
import { useDashboardData } from '@/features/auth/hooks/useDashboardData';

function formatDayLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' });
}

export function DashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const {
    equipmentCount,
    openIncidentCount,
    readingsTodayCount,
    trend,
    compliancePercent,
    averagesByEquipment,
    equipmentNames,
    minMaxToday,
    incidentCounts7d,
    isLoading,
    error,
  } = useDashboardData();

  const trendData = useMemo(
    () => (trend ?? []).map((t) => ({ ...t, label: formatDayLabel(t.date) })),
    [trend]
  );

  const topAverages = useMemo(() => (averagesByEquipment ?? []).slice(0, 3), [averagesByEquipment]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[--color-text-primary]">Dashboard</h1>
        <p className="text-[--color-text-secondary]">
          Bienvenido, {profile?.full_name || profile?.email}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPIs principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[--color-eucalyptus]">
              {isLoading && equipmentCount === null ? '—' : (equipmentCount ?? 0)}
            </p>
            <p className="text-sm text-[--color-text-muted]">equipos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incidentes activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[--color-danger]">{openIncidentCount}</p>
            <p className="text-sm text-[--color-text-muted]">incidentes abiertos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lecturas hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[--color-eucalyptus]">
              {isLoading && readingsTodayCount === null ? '—' : (readingsTodayCount ?? 0)}
            </p>
            <p className="text-sm text-[--color-text-muted]">registros hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas 7 días */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Tendencia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendencia de lecturas (7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <p className="text-sm text-[--color-text-muted]">
                Sin lecturas en los últimos 7 días.
              </p>
            ) : (
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [value, 'lecturas']}
                      labelFormatter={(label) => String(label)}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-eucalyptus)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cumplimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cumplimiento (7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            {compliancePercent === null ? (
              <p className="text-sm text-[--color-text-muted]">
                Sin lecturas en los últimos 7 días.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-[--color-eucalyptus]">
                    {compliancePercent}%
                  </p>
                  <p className="text-sm text-[--color-text-muted]">lecturas en rango</p>
                </div>
                <Progress value={compliancePercent} className="h-2" />
                <p className="text-xs text-[--color-text-muted]">
                  % de lecturas dentro del rango térmico del equipo (snapshot HACCP).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promedio por equipo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Promedio por equipo</CardTitle>
          </CardHeader>
          <CardContent>
            {topAverages.length === 0 ? (
              <p className="text-sm text-[--color-text-muted]">
                Sin lecturas en los últimos 7 días.
              </p>
            ) : (
              <ul className="space-y-2">
                {topAverages.map((a) => (
                  <li key={a.equipmentId} className="flex items-center justify-between text-sm">
                    <span className="truncate text-[--color-text-primary]">
                      {equipmentNames?.get(a.equipmentId) ?? a.equipmentId.slice(0, 8)}
                    </span>
                    <span className="text-[--color-text-secondary]">
                      {a.average !== null ? `${a.average}°C` : '—'}
                      <span className="ml-1 text-[--color-text-muted]">
                        (rango {a.min}°–{a.max}°)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Mín/Máx del día + incidentes 7d */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mín/Máx del día</CardTitle>
          </CardHeader>
          <CardContent>
            {minMaxToday ? (
              <p className="text-3xl font-bold text-[--color-eucalyptus]">
                {minMaxToday.min}° – {minMaxToday.max}°
              </p>
            ) : (
              <p className="text-sm text-[--color-text-muted]">Sin lecturas hoy.</p>
            )}
            <div className="mt-4 border-t border-[--color-border] pt-3">
              <p className="text-sm text-[--color-text-muted]">Incidentes (7 días)</p>
              <div className="mt-1 flex gap-4 text-sm">
                <span className="text-[--color-danger]">
                  {incidentCounts7d?.open ?? '—'} abiertos
                </span>
                <span className="text-[--color-eucalyptus]">
                  {incidentCounts7d?.resolved ?? '—'} resueltos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
