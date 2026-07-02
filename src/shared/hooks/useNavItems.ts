import {
  AlertTriangle,
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPin,
  Settings,
  Thermometer,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRoleEnum } from '@/shared/types/supabase';

export type NavBadge = 'incidents';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: NavBadge;
}

export interface UseNavItemsInput {
  role: UserRoleEnum | null;
  isPlatformAdmin: boolean;
}

export function getNavItems({ role, isPlatformAdmin }: UseNavItemsInput): NavItem[] {
  if (isPlatformAdmin) {
    return [
      { to: '/admin/organizations', label: 'Organizaciones', icon: Building2 },
      { to: '/admin/metrics', label: 'Métricas globales', icon: BarChart3 },
    ];
  }

  switch (role) {
    case 'owner':
    case 'admin':
      return [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, badge: undefined },
        { to: '/locations', label: 'Sedes', icon: MapPin },
        { to: '/staff', label: 'Personal', icon: Users },
        { to: '/equipment', label: 'Equipos', icon: Thermometer },
        { to: '/readings', label: 'Lecturas', icon: ClipboardList },
        { to: '/incidents', label: 'Incidentes', icon: AlertTriangle, badge: 'incidents' },
        { to: '/reports', label: 'Reportes', icon: FileText },
        { to: '/settings', label: 'Configuración', icon: Settings },
      ];

    case 'manager':
      return [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/staff', label: 'Personal', icon: Users },
        { to: '/equipment', label: 'Equipos', icon: Thermometer },
        { to: '/readings', label: 'Lecturas', icon: ClipboardList },
        { to: '/incidents', label: 'Incidentes', icon: AlertTriangle, badge: 'incidents' },
        { to: '/reports', label: 'Reportes', icon: FileText },
      ];

    case 'staff':
      return [
        { to: '/readings', label: 'Lecturas', icon: ClipboardList },
      ];

    default:
      return [];
  }
}

export function useNavItems(input: UseNavItemsInput): NavItem[] {
  return getNavItems(input);
}
