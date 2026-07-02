import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { useIncidentStore } from '@/features/incidents/store/incident.store';
import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { listStaffByLocation } from '@/features/staff/services/staff.service';
import { isOutOfRange } from '../lib/isOutOfRange';
import {
  buildIncidentDescription,
  createIncidentFromReading,
} from '@/features/incidents/services/incidents.service';
import { createReading } from '../services/readings.service';
import type { CreateReadingFormData } from '../schemas/reading.schema';
import type { Equipment, Staff } from '@/shared/types/supabase';

type Status = 'idle' | 'submitting' | 'success' | 'error';

function mapError(message: string | null | undefined): string | null {
  if (!message) return null;
  return message;
}

export interface UseReadingFormReturn {
  activeLocationId: string | null;
  activeLocationName: string | null;
  equipmentList: Equipment[];
  staffList: Staff[];
  isLoadingEquipment: boolean;
  isLoadingStaff: boolean;
  equipmentError: string | null;
  staffError: string | null;

  status: Status;
  serverError: string | null;
  lastReadingValue: number | null;
  lastReadingEquipmentName: string | null;

  submit: (data: CreateReadingFormData) => Promise<void>;
  resetStatus: () => void;
}

export function useReadingForm(): UseReadingFormReturn {
  const profile = useAuthStore((s) => s.profile);
  const activeLocationId = useOrganizationStore((s) => s.activeLocationId);
  const locations = useOrganizationStore((s) => s.locations);

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [lastReadingValue, setLastReadingValue] = useState<number | null>(null);
  const [lastReadingEquipmentName, setLastReadingEquipmentName] = useState<string | null>(null);

  const activeLocation = locations.find((l) => l.id === activeLocationId) ?? null;
  const activeLocationName = activeLocation?.name ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!activeLocationId) {
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch trigger, not a side-effect
    setIsLoadingEquipment(true);
    setEquipmentError(null);
    void listEquipmentByLocation(activeLocationId).then(({ data, error }) => {
      if (cancelled) return;
      setIsLoadingEquipment(false);
      if (error) {
        setEquipmentError(mapError(error.message));
        setEquipmentList([]);
        return;
      }
      setEquipmentList(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [activeLocationId]);

  useEffect(() => {
    let cancelled = false;
    if (!activeLocationId) {
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch trigger, not a side-effect
    setIsLoadingStaff(true);
    setStaffError(null);
    void listStaffByLocation(activeLocationId).then(({ data, error }) => {
      if (cancelled) return;
      setIsLoadingStaff(false);
      if (error) {
        setStaffError(mapError(error.message));
        setStaffList([]);
        return;
      }
      const active = (data ?? []).filter((s) => s.active);
      setStaffList(active);
    });
    return () => {
      cancelled = true;
    };
  }, [activeLocationId]);

  const submit = useCallback(
    async (data: CreateReadingFormData) => {
      if (!activeLocationId) return;
      setStatus('submitting');
      setServerError(null);

      const selectedEquipment =
        equipmentList.find((e) => e.id === data.equipmentId) ?? null;
      const equipmentName = selectedEquipment?.name ?? null;

      if (!selectedEquipment) {
        setStatus('error');
        setServerError('Equipo no encontrado');
        return;
      }

      const { data: created, error } = await createReading({
        equipmentId: data.equipmentId,
        value: data.value,
        recordedByProfile: profile?.id ?? null,
        recordedByStaff: data.recordedByStaff ?? null,
        takenBy: data.takenBy ?? null,
        snapshotMin: selectedEquipment.min_temp,
        snapshotMax: selectedEquipment.max_temp,
      });

      if (error || !created) {
        setStatus('error');
        setServerError(mapError(error?.message));
        return;
      }

      if (isOutOfRange(data.value, selectedEquipment.min_temp, selectedEquipment.max_temp)) {
        const description = buildIncidentDescription({
          value: data.value,
          minTemp: selectedEquipment.min_temp,
          maxTemp: selectedEquipment.max_temp,
        });
        await createIncidentFromReading({
          readingId: created.id,
          description,
        });
        const orgId = useOrganizationStore.getState().organization?.id;
        if (orgId) {
          await useIncidentStore.getState().fetchOpenIncidents(orgId);
        }
      }

      setLastReadingValue(data.value);
      setLastReadingEquipmentName(equipmentName);
      setStatus('success');
    },
    [activeLocationId, equipmentList, profile?.id]
  );

  const resetStatus = useCallback(() => {
    setStatus('idle');
    setServerError(null);
    setLastReadingValue(null);
    setLastReadingEquipmentName(null);
  }, []);

  return {
    activeLocationId,
    activeLocationName,
    equipmentList,
    staffList,
    isLoadingEquipment,
    isLoadingStaff,
    equipmentError,
    staffError,

    status,
    serverError,
    lastReadingValue,
    lastReadingEquipmentName,

    submit,
    resetStatus,
  };
}