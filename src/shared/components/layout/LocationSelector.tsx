import { ChevronDown, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';

export function LocationSelector() {
  const locations = useOrganizationStore((s) => s.locations);
  const activeLocationId = useOrganizationStore((s) => s.activeLocationId);
  const setActiveLocation = useOrganizationStore((s) => s.setActiveLocation);

  const activeLocation = locations.find((l) => l.id === activeLocationId);
  const singleLocation = locations.length <= 1;

  const handleChange = (value: string) => {
    setActiveLocation(value);
  };

  return (
    <Select
      value={activeLocationId ?? undefined}
      onValueChange={handleChange}
      disabled={singleLocation}
    >
      <SelectTrigger
        aria-label="Sede activa"
        className="h-9 w-full min-w-[180px] max-w-[260px] border-[--color-border] bg-white text-[--color-text-primary]"
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className="h-4 w-4 shrink-0 text-[--color-eucalyptus]" />
          <SelectValue placeholder="Selecciona sede">
            {activeLocation?.name ?? 'Selecciona sede'}
          </SelectValue>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            {location.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
