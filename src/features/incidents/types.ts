/**
 * Tipos del feature `incidents`.
 *
 * - `IncidentWithReading` extiende Incident con la lectura y el equipo/leído
 *   por JOINs en queries que muestran la lista (ADR-007: 2 queries si filtramos
 *   por location/equipment).
 * - `IncidentFilters` define los filtros soportados por `listIncidents`.
 * - `CreateIncidentInput` es el input del service `createIncidentFromReading`,
 *   consumido por `useReadingForm` al detectar out-of-range (feature-first:
 *   readings NO importa componentes de incidents; el service de incidents es
 *   público y se invoca directamente).
 */
import type { Equipment, Incident, TemperatureReading } from '@/shared/types/supabase';

export type IncidentStatus = 'open' | 'resolved';

export interface IncidentWithReading extends Incident {
  reading: Pick<TemperatureReading, 'id' | 'value' | 'recorded_at'> & {
    equipment: Pick<Equipment, 'id' | 'name' | 'min_temp' | 'max_temp'> & {
      location_id: string;
    };
  };
}

export interface IncidentFilters {
  status?: IncidentStatus;
  locationId?: string;
  equipmentId?: string;
  from?: string;
  to?: string;
}

export interface CreateIncidentInput {
  readingId: string;
  description: string;
}