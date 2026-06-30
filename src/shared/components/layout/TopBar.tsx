import { LogOut, Menu, User } from 'lucide-react';
import { LocationSelector } from '@/shared/components/layout/LocationSelector';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface TopBarProps {
  onMenuClick?: () => void;
  className?: string;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase();
  return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
}

export function TopBar({ onMenuClick, className }: TopBarProps) {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  const displayName = profile?.full_name ?? profile?.email ?? 'Invitado';
  const initials = getInitials(profile?.full_name ?? profile?.email);
  const isPlatformAdmin = profile?.is_platform_admin ?? false;

  return (
    <header
      className={
        'sticky top-0 z-30 flex h-14 w-full items-center gap-3 border-b border-[--color-border] bg-white px-4 md:px-6 ' +
        (className ?? '')
      }
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Abrir menú de navegación"
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {!isPlatformAdmin && (
        <div className="hidden md:block">
          <LocationSelector />
        </div>
      )}

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-9 items-center gap-2 px-2"
            aria-label="Menú de usuario"
          >
            <Avatar className="h-7 w-7 bg-[--color-eucalyptus-bg]">
              <AvatarFallback className="bg-[--color-eucalyptus-bg] text-xs font-semibold text-[--color-eucalyptus]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-[--color-text-primary] md:inline">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              {profile?.email && (
                <p className="text-xs leading-none text-[--color-text-muted]">{profile.email}</p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="text-[--color-text-muted]">
            <User className="mr-2 h-4 w-4" />
            <span>Mi perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="text-[--color-danger]">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
