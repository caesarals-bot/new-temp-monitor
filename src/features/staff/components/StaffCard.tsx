import { User as UserIcon, Pencil, Power, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { Staff } from '@/shared/types/supabase';

export interface StaffCardProps {
  staff: Staff;
  readingsCount: number;
  canEdit: boolean;
  onEdit: (staff: Staff) => void;
  onToggle: (staff: Staff) => void;
  className?: string;
}

export function StaffCard({
  staff,
  readingsCount,
  canEdit,
  onEdit,
  onToggle,
  className,
}: StaffCardProps) {
  const isActive = staff.active;

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
              isActive ? 'bg-[--color-eucalyptus-bg]' : 'bg-[--color-surface]'
            )}
          >
            <UserIcon
              className={cn(
                'h-4 w-4',
                isActive ? 'text-[--color-eucalyptus]' : 'text-[--color-text-muted]'
              )}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle
              className={cn(
                'truncate text-base',
                !isActive && 'text-[--color-text-muted]'
              )}
            >
              {staff.name}
            </CardTitle>
            <p className="mt-1 truncate text-sm text-[--color-text-secondary]">
              {staff.role}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>

          <Badge variant="secondary" className="gap-1">
            <ClipboardList className="h-3 w-3" aria-hidden="true" />
            <span>
              {readingsCount} {readingsCount === 1 ? 'lectura' : 'lecturas'}
            </span>
          </Badge>
        </div>

        {canEdit && (
          <div className="mt-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(staff)}
              className="flex-1"
              aria-label={`Editar ${staff.name}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Editar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggle(staff)}
              aria-label={
                isActive ? `Desactivar ${staff.name}` : `Reactivar ${staff.name}`
              }
            >
              <Power className="h-4 w-4" aria-hidden="true" />
              {isActive ? 'Desactivar' : 'Reactivar'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
