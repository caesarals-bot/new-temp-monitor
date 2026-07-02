import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { usePlatformAdmin } from '../hooks/usePlatformAdmin';
import { getOrganizationDetail } from '../services/platform-admin.service';
import { OrganizationDetailView } from '../components/OrganizationDetailView';
import type { OrganizationDetail } from '../types';

type LoadResult =
  { kind: 'ok'; detail: OrganizationDetail | null } | { kind: 'error'; message: string };

async function loadDetail(id: string): Promise<LoadResult> {
  const { data, error } = await getOrganizationDetail(id);
  if (error) return { kind: 'error', message: error.message };
  return { kind: 'ok', detail: data };
}

export function OrganizationDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const hook = usePlatformAdmin();
  const [detail, setDetail] = useState<OrganizationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hook.isPlatformAdmin || !id) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch trigger resets loading state
    setIsLoading(true);

    setError(null);
    void loadDetail(id).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (result.kind === 'error') {
        setError(result.message);
        return;
      }
      setDetail(result.detail);
    });
    return () => {
      cancelled = true;
    };
  }, [id, hook.isPlatformAdmin]);

  if (!hook.isPlatformAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-8 text-sm text-[--color-text-muted]">
        No autorizado.
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <BackLink />
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || !detail) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <BackLink />
        <p className="text-center text-sm text-[--color-text-muted]">Cargando detalle...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="border-b border-[--color-border] bg-[--color-surface] px-6 py-4">
        <Link
          to="/admin/organizations"
          className="inline-flex items-center gap-1 text-xs text-[--color-text-secondary] hover:text-[--color-text-primary]"
        >
          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
          Volver a organizaciones
        </Link>
      </header>
      <div className="flex-1 p-6">
        <OrganizationDetailView detail={detail} />
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/organizations"
      className="inline-flex items-center gap-1 text-xs text-[--color-text-secondary] hover:text-[--color-text-primary]"
    >
      <ChevronLeft className="h-3 w-3" aria-hidden="true" />
      Volver a organizaciones
    </Link>
  );
}
