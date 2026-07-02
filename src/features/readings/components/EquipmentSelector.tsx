import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import type { Equipment } from '@/shared/types/supabase';
import { cn } from '@/shared/lib/utils';

export interface EquipmentSelectorProps {
  equipmentList: Equipment[];
  value: string;
  onChange: (equipmentId: string) => void;
  disabled?: boolean;
  error?: string | null;
  className?: string;
}

function formatRange(min: number, max: number): string {
  return `${min}°C a ${max}°C`;
}

export function EquipmentSelector({
  equipmentList,
  value,
  onChange,
  disabled = false,
  error = null,
  className,
}: EquipmentSelectorProps) {
  const errorId = error ? 'equipment-selector-error' : undefined;
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="equipment-selector">Equipo</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || equipmentList.length === 0}
      >
        <SelectTrigger
          id="equipment-selector"
          className={cn(error && 'border-[--color-danger]')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
        >
          <SelectValue placeholder="Selecciona un equipo" />
        </SelectTrigger>
        <SelectContent>
          {equipmentList.map((eq) => (
            <SelectItem key={eq.id} value={eq.id}>
              {eq.name} ({formatRange(eq.min_temp, eq.max_temp)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={errorId} className="text-xs text-[--color-danger]">
          {error}
        </p>
      )}
    </div>
  );
}