import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { IncidentFilters, IncidentStatus } from '../types';

export interface IncidentFiltersProps {
  filters: IncidentFilters;
  onChange: <K extends keyof IncidentFilters>(key: K, value: IncidentFilters[K]) => void;
  onClear: () => void;
}

const STATUS_ALL = 'all';

export function IncidentFiltersBar({ filters, onChange, onClear }: IncidentFiltersProps) {
  const locations = useOrganizationStore((s) => s.locations);

  const statusValue = filters.status ?? STATUS_ALL;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[--color-text-secondary]" htmlFor="filter-status">
          Estado
        </label>
        <Select
          value={statusValue}
          onValueChange={(value) =>
            onChange(
              'status',
              value === STATUS_ALL ? undefined : (value as IncidentStatus)
            )
          }
        >
          <SelectTrigger id="filter-status" className="w-[160px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_ALL}>Todos</SelectItem>
            <SelectItem value="open">Abiertos</SelectItem>
            <SelectItem value="resolved">Resueltos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="text-xs font-medium text-[--color-text-secondary]"
          htmlFor="filter-location"
        >
          Sede
        </label>
        <Select
          value={filters.locationId ?? 'all'}
          onValueChange={(value) =>
            onChange('locationId', value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger id="filter-location" className="w-[200px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={onClear}>
        Limpiar filtros
      </Button>
    </div>
  );
}