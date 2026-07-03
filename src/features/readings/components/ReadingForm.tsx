import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReadingSchema, type CreateReadingFormData } from '../schemas/reading.schema';
import { EquipmentSelector } from './EquipmentSelector';
import { TemperatureInput } from './TemperatureInput';
import { StaffSelector, type StaffSelectionMode } from './StaffSelector';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import type { Equipment, Staff } from '@/shared/types/supabase';
import { isOutOfRange } from '../lib/isOutOfRange';

export interface ReadingFormProps {
  equipmentList: Equipment[];
  staffList: Staff[];
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (data: CreateReadingFormData) => void | Promise<void>;
  onCancel: () => void;
  initialStaffMode?: StaffSelectionMode;
}

type FormShape = CreateReadingFormData & {
  staffMode: StaffSelectionMode;
  staffId: string | null;
  externalName: string;
};

export function ReadingForm({
  equipmentList,
  staffList,
  isSubmitting,
  serverError,
  onSubmit,
  onCancel,
  initialStaffMode = 'profile',
}: ReadingFormProps) {
  const form = useForm<FormShape>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createReadingSchema) as any,
    defaultValues: {
      equipmentId: '',
      value: '' as unknown as number,
      recordedByStaff: null,
      takenBy: null,
      staffMode: initialStaffMode,
      staffId: null,
      externalName: '',
    },
    mode: 'onTouched',
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = form;

  const equipmentId = watch('equipmentId');
  const value = watch('value');
  const staffMode = watch('staffMode');
  const staffId = watch('staffId');
  const externalName = watch('externalName');

  const selectedEquipment = equipmentList.find((e) => e.id === equipmentId) ?? null;
  const showOutOfRangeWarning =
    selectedEquipment !== null &&
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    isOutOfRange(value, selectedEquipment.min_temp, selectedEquipment.max_temp);

  useEffect(() => {
    if (staffMode === 'profile') {
      setValue('recordedByStaff', null);
      setValue('takenBy', null);
    } else if (staffMode === 'staff') {
      setValue('recordedByStaff', staffId);
      setValue('takenBy', null);
    } else {
      setValue('recordedByStaff', null);
      setValue('takenBy', externalName.trim() ? externalName.trim() : null);
    }
  }, [staffMode, staffId, externalName, setValue]);

  const handleFormSubmit = handleSubmit(async (data) => {
    const payload: CreateReadingFormData = {
      equipmentId: data.equipmentId,
      value: data.value,
      recordedByStaff: data.recordedByStaff ?? null,
      takenBy: data.takenBy ?? null,
    };
    await onSubmit(payload);
    reset({
      equipmentId: '',
      value: '' as unknown as number,
      recordedByStaff: null,
      takenBy: null,
      staffMode: initialStaffMode,
      staffId: null,
      externalName: '',
    });
  });

  const equipmentError = errors.equipmentId?.message ?? null;
  const valueError = errors.value?.message ?? null;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Controller
        control={control}
        name="equipmentId"
        render={({ field }) => (
          <EquipmentSelector
            equipmentList={equipmentList}
            value={field.value}
            onChange={field.onChange}
            disabled={isSubmitting}
            error={equipmentError}
          />
        )}
      />

      <Controller
        control={control}
        name="value"
        render={({ field }) => (
          <TemperatureInput
            value={typeof field.value !== 'number' ? '' : field.value}
            onChange={(v) => field.onChange(v)}
            minTemp={selectedEquipment?.min_temp}
            maxTemp={selectedEquipment?.max_temp}
            disabled={isSubmitting}
            error={valueError}
          />
        )}
      />

      {showOutOfRangeWarning && selectedEquipment && (
        <Alert>
          <AlertDescription>
            La temperatura está fuera del rango aceptable del equipo ({selectedEquipment.min_temp}°C
            a {selectedEquipment.max_temp}°C). La lectura se registrará igualmente.
          </AlertDescription>
        </Alert>
      )}

      <Controller
        control={control}
        name="staffMode"
        render={({ field }) => (
          <StaffSelector
            mode={field.value}
            onModeChange={field.onChange}
            staffList={staffList}
            selectedStaffId={staffId}
            onStaffChange={(id) => setValue('staffId', id)}
            externalName={externalName}
            onExternalNameChange={(name) => setValue('externalName', name)}
            disabled={isSubmitting}
          />
        )}
      />

      <input type="hidden" {...register('recordedByStaff')} />
      <input type="hidden" {...register('takenBy')} />

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar lectura'}
        </Button>
      </div>
    </form>
  );
}
