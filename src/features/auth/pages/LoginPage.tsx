import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const organization = useOrganizationStore((s) => s.organization);
  const fetchOrganization = useOrganizationStore((s) => s.fetchOrganization);
  const fetchLocations = useOrganizationStore((s) => s.fetchLocations);
  const navigate = useNavigate();

  useEffect(() => {
    if (session && profile?.organization_id && !organization) {
      fetchOrganization();
    }
  }, [session, profile, organization, fetchOrganization]);

  useEffect(() => {
    if (session && profile?.organization_id && organization) {
      fetchLocations(organization.id);
      navigate('/', { replace: true });
    } else if (session && profile?.organization_id) {
      // still loading org
    } else if (session && !profile?.organization_id) {
      navigate('/onboarding', { replace: true });
    }
  }, [session, profile, organization, fetchLocations, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
    }
  };

  if (session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[--color-eucalyptus] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-surface] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">TempMonitor</CardTitle>
          <CardDescription>Monitoreo de cadena de frío</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-[--color-danger-bg] p-3 text-sm text-[--color-danger]">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>

            <p className="text-center text-sm text-[--color-slate-500]">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-[--color-eucalyptus] hover:underline">
                Regístrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
