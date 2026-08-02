/**
 * Métricas puras del dashboard derivadas de las lecturas de los últimos 7 días.
 *
 * Son funciones puras, sin dependencias de Supabase ni stores: reciben las
 * lecturas (y opcionalmente los equipos) y devuelven la métrica lista para la
 * UI. Se testean 100% para evitar drift en el cálculo de tendencia,
 * cumplimiento y promedios.
 *
 * Patrón consistente con `isOutOfRange`/`timeSince`: `now` inyectable para
 * tests deterministas.
 */
import { isOutOfRange } from './isOutOfRange';
import type { TemperatureReading } from '@/shared/types/supabase';

export interface TrendPoint {
  /** Fecha en formato YYYY-MM-DD (zona local). */
  date: string;
  count: number;
}

export interface EquipmentAverage {
  equipmentId: string;
  average: number | null;
  min: number;
  max: number;
}

export interface DashboardMetrics {
  /** Total de lecturas por día (7 buckets, rellenando días sin lecturas). */
  trend: TrendPoint[];
  /** Porcentaje de lecturas dentro de rango (0-100), null si no hay lecturas. */
  compliancePercent: number | null;
  /** Promedio de temperatura por equipo, con su rango como referencia. */
  averagesByEquipment: EquipmentAverage[];
  /** Mín/Máx del día para el equipo con más lecturas hoy (null si no hay). */
  minMaxToday: { min: number; max: number } | null;
  /** Conteo de incidentes (abiertos/resueltos) en el período. */
  incidentCounts: { open: number; resolved: number };
}

function toLocalDayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Genera los 7 buckets de fecha (hoy y los 6 anteriores) en zona local. */
export function buildTrendBuckets(now: Date = new Date()): string[] {
  const buckets: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push(toLocalDayKey(d.toISOString()));
  }
  return buckets;
}

export function computeTrend(readings: TemperatureReading[], now: Date = new Date()): TrendPoint[] {
  const buckets = buildTrendBuckets(now);
  const counts = new Map<string, number>(buckets.map((b) => [b, 0]));
  for (const r of readings) {
    if (!r.recorded_at) continue;
    const key = toLocalDayKey(r.recorded_at);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return buckets.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

export function computeCompliancePercent(
  readings: TemperatureReading[],
  fallbackRanges: Map<string, { min: number; max: number }> = new Map()
): number | null {
  if (readings.length === 0) return null;

  let inRange = 0;
  for (const r of readings) {
    // Auditoría HACCP: usar snapshot si existe; si no, el rango actual del
    // equipo (fallback para lecturas pre-TASK-010).
    let min: number | null | undefined = r.snapshot_min_temp;
    let max: number | null | undefined = r.snapshot_max_temp;
    if (min === null || max === null) {
      const fb = fallbackRanges.get(r.equipment_id);
      min = fb?.min;
      max = fb?.max;
    }
    if (min !== null && max !== null && min !== undefined && max !== undefined) {
      if (!isOutOfRange(r.value, min, max)) inRange++;
    } else {
      // Sin rango conocido: se cuenta como cumplida (no penalizar).
      inRange++;
    }
  }
  return Math.round((inRange / readings.length) * 1000) / 10;
}

export function computeAveragesByEquipment(
  readings: TemperatureReading[],
  ranges: Map<string, { min: number; max: number }> = new Map()
): EquipmentAverage[] {
  const byEquipment = new Map<string, number[]>();
  for (const r of readings) {
    if (!r.equipment_id) continue;
    const arr = byEquipment.get(r.equipment_id) ?? [];
    arr.push(Number(r.value));
    byEquipment.set(r.equipment_id, arr);
  }

  const list: EquipmentAverage[] = [];
  for (const [equipmentId, values] of byEquipment) {
    const sum = values.reduce((acc, v) => acc + v, 0);
    const range = ranges.get(equipmentId);
    list.push({
      equipmentId,
      average: Math.round((sum / values.length) * 10) / 10,
      min: range?.min ?? 0,
      max: range?.max ?? 0,
    });
  }
  // Ordenar por promedio ascendente (equipos más fríos primero) y estables.
  list.sort((a, b) => (a.average ?? 0) - (b.average ?? 0));
  return list;
}

export function computeMinMaxToday(
  readings: TemperatureReading[],
  now: Date = new Date()
): { min: number; max: number } | null {
  const todayKey = toLocalDayKey(now.toISOString());
  const today = readings.filter((r) => r.recorded_at && toLocalDayKey(r.recorded_at) === todayKey);
  if (today.length === 0) return null;
  const values = today.map((r) => Number(r.value));
  return { min: Math.min(...values), max: Math.max(...values) };
}
