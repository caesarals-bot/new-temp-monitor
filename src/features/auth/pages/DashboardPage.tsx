import { useAuthStore } from '@/features/auth/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AppShell } from '@/shared/components/layout/AppShell';

export function DashboardPage() {
  const profile = useAuthStore((s) => s.profile);

  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[--color-text-primary]">Dashboard</h1>
          <p className="text-[--color-text-secondary]">
            Bienvenido, {profile?.full_name || profile?.email}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[--color-eucalyptus]">0</p>
              <p className="text-sm text-[--color-text-muted]">equipos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Incidentes activos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[--color-danger]">0</p>
              <p className="text-sm text-[--color-text-muted]">incidentes abiertos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lecturas hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[--color-eucalyptus]">0</p>
              <p className="text-sm text-[--color-text-muted]">registros hoy</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
