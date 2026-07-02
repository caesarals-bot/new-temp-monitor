import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import type { ListOrganizationsParams } from '../types';

export interface OrganizationFiltersProps {
  filters: ListOrganizationsParams;
  onChange: <K extends keyof ListOrganizationsParams>(
    key: K,
    value: ListOrganizationsParams[K]
  ) => void;
  onClear: () => void;
}

const STATUS_ALL = 'all';
const PLAN_ALL = 'all';
const BIZ_ALL = 'all';

const STATUS_OPTIONS = ['active', 'paused', 'suspended'] as const;
const PLAN_OPTIONS = ['basic', 'pro', 'enterprise'] as const;
const BIZ_OPTIONS = ['restaurant', 'pharmacy', 'butcher_shop', 'supermarket', 'general'] as const;

export function OrganizationFiltersBar({ filters, onChange, onClear }: OrganizationFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-org-status"
          className="text-xs font-medium text-[--color-text-secondary]"
        >
          Estado
        </label>
        <Select
          value={filters.status ?? STATUS_ALL}
          onValueChange={(value) =>
            onChange(
              'status',
              value === STATUS_ALL ? undefined : (value as 'active' | 'paused' | 'suspended')
            )
          }
        >
          <SelectTrigger id="filter-org-status" className="w-[160px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_ALL}>Todos</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'active' ? 'Activa' : s === 'paused' ? 'Pausada' : 'Suspendida'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-org-plan"
          className="text-xs font-medium text-[--color-text-secondary]"
        >
          Plan
        </label>
        <Select
          value={filters.planType ?? PLAN_ALL}
          onValueChange={(value) =>
            onChange(
              'planType',
              value === PLAN_ALL ? undefined : (value as 'basic' | 'pro' | 'enterprise')
            )
          }
        >
          <SelectTrigger id="filter-org-plan" className="w-[140px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PLAN_ALL}>Todos</SelectItem>
            {PLAN_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-org-biz"
          className="text-xs font-medium text-[--color-text-secondary]"
        >
          Rubro
        </label>
        <Select
          value={filters.businessType ?? BIZ_ALL}
          onValueChange={(value) => onChange('businessType', value === BIZ_ALL ? undefined : value)}
        >
          <SelectTrigger id="filter-org-biz" className="w-[180px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BIZ_ALL}>Todos</SelectItem>
            {BIZ_OPTIONS.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={onClear}>
        Limpiar
      </Button>
    </div>
  );
}
