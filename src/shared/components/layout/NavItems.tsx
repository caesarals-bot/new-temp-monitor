import { NavLink, useLocation } from 'react-router';
import { useNavItems, type NavItem } from '@/shared/hooks/useNavItems';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useIncidentStore, selectOpenIncidentCount } from '@/features/incidents/store/incident.store';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

export function NavItems() {
  const profile = useAuthStore((s) => s.profile);
  const isPlatformAdmin = profile?.is_platform_admin ?? false;
  const role = profile?.role ?? null;

  const navItems = useNavItems({ role, isPlatformAdmin });
  const openIncidentCount = useIncidentStore(selectOpenIncidentCount);
  const location = useLocation();

  const isActive = (item: NavItem): boolean => {
    if (item.to === '/') return location.pathname === '/';
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  };

  return (
    <nav aria-label="Navegación principal" className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        const showBadge = item.badge === 'incidents' && openIncidentCount > 0;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-[--color-eucalyptus-bg] text-[--color-text-primary]'
                : 'text-[--color-text-secondary] hover:bg-[--color-surface] hover:text-[--color-text-primary]'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate">{item.label}</span>
            {showBadge && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                {openIncidentCount}
              </Badge>
            )}
          </NavLink>
        );
      })}
      {navItems.length === 0 && (
        <p className="px-3 py-2 text-sm text-[--color-text-muted]">
          Sin navegación disponible
        </p>
      )}
    </nav>
  );
}
