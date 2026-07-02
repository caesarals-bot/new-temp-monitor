import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { ReportFilters, ReadingTypeFilter } from '../types';

export interface ReportFiltersBarProps {
  filters: ReportFilters;
  equipmentList: { id: string; name: string }[];
  onChange: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void;
  onReset: () => void;
}

export function ReportFiltersBar({
  filters,
  equipmentList,
  onChange,
  onReset,
}: ReportFiltersBarProps) {
  const locations = useOrganizationStore((s) => s.locations);

  const fromValue = filters.from.slice(0, 10);
  const toValue = filters.to.slice(0, 10);

  return (
    <div className="flex flex-wrap items-end gap-3" data-testid="report-filters">
      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-from">Desde</Label>
        <Input
          id="filter-from"
          type="date"
          value={fromValue}
          onChange={(e) => {
            const date = e.target.value;
            if (date) onChange('from', `${date}T00:00:00.000Z`);
          }}
          className="w-[160px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-to">Hasta</Label>
        <Input
          id="filter-to"
          type="date"
          value={toValue}
          onChange={(e) => {
            const date = e.target.value;
            if (date) onChange('to', `${date}T23:59:59.999Z`);
          }}
          className="w-[160px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-location">Sede</Label>
        <Select
          value={filters.locationId ?? 'all'}
          onValueChange={(value) => onChange('locationId', value === 'all' ? undefined : value)}
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

      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-equipment">Equipo</Label>
        <Select
          value={filters.equipmentId ?? 'all'}
          onValueChange={(value) => onChange('equipmentId', value === 'all' ? undefined : value)}
        >
          <SelectTrigger id="filter-equipment" className="w-[200px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {equipmentList.map((eq) => (
              <SelectItem key={eq.id} value={eq.id}>
                {eq.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-type">Tipo</Label>
        <Select
          value={filters.readingType}
          onValueChange={(value) => onChange('readingType', value as ReadingTypeFilter)}
        >
          <SelectTrigger id="filter-type" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="iot">IoT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 pb-1 text-sm text-[--color-text-secondary]">
        <Checkbox
          checked={filters.onlyWithIncidents}
          onCheckedChange={(checked) => onChange('onlyWithIncidents', checked === true)}
        />
        Solo con incidentes
      </label>

      <Button type="button" variant="outline" size="sm" onClick={onReset}>
        Limpiar
      </Button>
    </div>
  );
}
