/**
 * Tipos del feature `reports`.
 *
 * `ReportFilters` define los filtros del panel. `ReportData` es el shape
 * que consume la UI y el `pdfExport` (separación service ↔ presentation).
 */
import type {
  Equipment,
  Location,
  Organization,
  TemperatureReading,
} from '@/shared/types/supabase';
import type { IncidentWithReading } from '@/features/incidents/types';

export type ReadingTypeFilter = 'all' | 'manual' | 'iot';

export interface ReportFilters {
  from: string;
  to: string;
  locationId?: string;
  equipmentId?: string;
  readingType: ReadingTypeFilter;
  onlyWithIncidents: boolean;
}

export interface ComplianceByEquipment {
  equipmentId: string;
  equipmentName: string;
  totalReadings: number;
  inRangeReadings: number;
  percent: number;
}

export interface ComplianceSummary {
  totalReadings: number;
  inRangeReadings: number;
  percent: number;
  byEquipment: ComplianceByEquipment[];
}

export interface IncidentSummary {
  total: number;
  resolved: number;
  open: number;
}

export interface ReportData {
  organization: Pick<Organization, 'id' | 'name' | 'business_type'>;
  filters: ReportFilters;
  generatedAt: string;
  rangeLabel: string;
  location: Pick<Location, 'id' | 'name'> | null;
  equipmentList: Pick<Equipment, 'id' | 'name' | 'min_temp' | 'max_temp'>[];
  selectedEquipment: Pick<Equipment, 'id' | 'name' | 'min_temp' | 'max_temp'> | null;
  readings: TemperatureReading[];
  incidents: IncidentWithReading[];
  compliance: ComplianceSummary;
  incidentSummary: IncidentSummary;
}
