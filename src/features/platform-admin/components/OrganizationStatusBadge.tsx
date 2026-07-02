import { Badge } from '@/shared/components/ui/badge';
import type { OrganizationListItem } from '../types';

const variants: Record<OrganizationListItem['status'], { label: string; className: string }> = {
  active: {
    label: 'Activa',
    className: 'bg-[--color-eucalyptus-bg] text-[--color-eucalyptus]',
  },
  paused: {
    label: 'Pausada',
    className: 'bg-[--color-warning-bg] text-[--color-warning]',
  },
  suspended: {
    label: 'Suspendida',
    className: 'bg-[--color-danger-bg] text-[--color-danger]',
  },
};

export interface OrganizationStatusBadgeProps {
  status: OrganizationListItem['status'];
}

export function OrganizationStatusBadge({ status }: OrganizationStatusBadgeProps) {
  const v = variants[status];
  return (
    <Badge variant="secondary" className={v.className} data-testid={`org-status-${status}`}>
      {v.label}
    </Badge>
  );
}
