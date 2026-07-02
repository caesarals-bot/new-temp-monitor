import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import type { Staff } from '@/shared/types/supabase';

export type StaffSelectionMode = 'profile' | 'staff' | 'external';

export interface StaffSelectorProps {
  mode: StaffSelectionMode;
  onModeChange: (mode: StaffSelectionMode) => void;
  staffList: Staff[];
  selectedStaffId: string | null;
  onStaffChange: (staffId: string | null) => void;
  externalName: string;
  onExternalNameChange: (name: string) => void;
  disabled?: boolean;
  className?: string;
}

export function StaffSelector({
  mode,
  onModeChange,
  staffList,
  selectedStaffId,
  onStaffChange,
  externalName,
  onExternalNameChange,
  disabled = false,
  className,
}: StaffSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Label>Persona que registra</Label>
      <RadioGroup
        value={mode}
        onValueChange={(v) => onModeChange(v as StaffSelectionMode)}
        disabled={disabled}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="profile" id="staff-mode-profile" />
          <Label htmlFor="staff-mode-profile" className="cursor-pointer font-normal">
            Mi usuario logueado
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="staff" id="staff-mode-staff" />
          <Label htmlFor="staff-mode-staff" className="cursor-pointer font-normal">
            Persona de la lista
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="external" id="staff-mode-external" />
          <Label htmlFor="staff-mode-external" className="cursor-pointer font-normal">
            Persona externa
          </Label>
        </div>
      </RadioGroup>

      {mode === 'staff' && (
        <div className="space-y-2 pl-6">
          <Input
            id="staff-selector"
            list="staff-list-options"
            placeholder="Escribe o selecciona"
            value={selectedStaffId ?? ''}
            onChange={(e) => onStaffChange(e.target.value || null)}
            disabled={disabled}
          />
          <datalist id="staff-list-options">
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.role}
              </option>
            ))}
          </datalist>
          <p className="text-xs text-[--color-text-muted]">
            {staffList.length} persona(s) en esta sede
          </p>
        </div>
      )}

      {mode === 'external' && (
        <div className="space-y-2 pl-6">
          <Input
            id="staff-external-name"
            placeholder="Nombre de quien tomó la lectura"
            value={externalName}
            onChange={(e) => onExternalNameChange(e.target.value)}
            disabled={disabled}
            maxLength={100}
          />
          <p className="text-xs text-[--color-text-muted]">
            Se registrará en texto libre (máx. 100 caracteres)
          </p>
        </div>
      )}
    </div>
  );
}