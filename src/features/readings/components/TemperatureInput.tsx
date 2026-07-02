import type { ChangeEvent } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { outOfRangeDirection } from '../lib/isOutOfRange';

export interface TemperatureInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  minTemp?: number;
  maxTemp?: number;
  disabled?: boolean;
  error?: string | null;
  className?: string;
}

export function TemperatureInput({
  value,
  onChange,
  minTemp,
  maxTemp,
  disabled = false,
  error = null,
  className,
}: TemperatureInputProps) {
  const hasRange = minTemp !== undefined && maxTemp !== undefined;
  const direction = hasRange
    ? outOfRangeDirection(typeof value === 'number' ? value : null, minTemp!, maxTemp!)
    : null;

  const warning =
    direction === 'low'
      ? `Temperatura bajo el mínimo (${minTemp}°C)`
      : direction === 'high'
        ? `Temperatura sobre el máximo (${maxTemp}°C)`
        : null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const errorId = error ? 'temperature-input-error' : undefined;
  const warningId = warning ? 'temperature-input-warning' : undefined;
  const describedBy = [errorId, warningId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="temperature-input">Temperatura (°C)</Label>
      <Input
        id="temperature-input"
        type="number"
        step="0.1"
        inputMode="decimal"
        placeholder="3.5"
        value={value === '' ? '' : value}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={cn(
          direction === 'low' && 'border-[--color-danger] focus-visible:ring-[--color-danger]',
          direction === 'high' && 'border-[--color-danger] focus-visible:ring-[--color-danger]'
        )}
      />
      {error && (
        <p id={errorId} className="text-xs text-[--color-danger]">
          {error}
        </p>
      )}
      {warning && !error && (
        <p id={warningId} className="text-xs text-[--color-danger]" role="alert">
          {warning}
        </p>
      )}
    </div>
  );
}