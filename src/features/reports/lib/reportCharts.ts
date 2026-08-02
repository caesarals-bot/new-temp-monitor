/**
 * Agregaciones puras para los gráficos de variación de temperatura del reporte.
 *
 * Funciones sin dependencias de UI ni Supabase: reciben las lecturas y
 * devuelven series listas para Recharts. Se testean 100% para evitar drift en
 * la agregación por día y por equipo.
 */
import type { TemperatureReading } from '@/shared/types/supabase';

export interface EquipmentSeriesPoint {
  /** Timestamp ISO de la lectura. */
  ts: string;
  /** Etiqueta corta (día/hora) para el eje X. */
  label: string;
  value: number;
}

export interface DailyBandPoint {
  /** Fecha en formato YYYY-MM-DD. */
  date: string;
  /** Etiqueta corta para el eje X (ej: "24/07"). */
  label: string;
  avg: number;
  min: number;
  max: number;
  count: number;
}

export interface EquipmentRangeRef {
  id: string;
  name: string;
  min_temp: number;
  max_temp: number;
}

/**
 * Serie de temperatura por equipo (una línea por equipo). Útil para comparar
 * variaciones entre equipos en un mismo período.
 *
 * @param readings lecturas del período (todas las de la sede/org).
 * @param equipmentList equipos con su rango de referencia.
 * @param equipmentId si se pasa, solo esa serie; si no, todas.
 */
export function buildEquipmentSeries(
  readings: TemperatureReading[],
  equipmentList: EquipmentRangeRef[],
  equipmentId?: string | null
): { equipmentId: string; name: string; points: EquipmentSeriesPoint[] }[] {
  const filtered = equipmentId ? equipmentList.filter((e) => e.id === equipmentId) : equipmentList;
  const byId = new Map(filtered.map((e) => [e.id, e]));

  const seriesMap = new Map<string, EquipmentSeriesPoint[]>();
  for (const r of readings) {
    const eq = byId.get(r.equipment_id);
    if (!eq) continue;
    const points = seriesMap.get(r.equipment_id) ?? [];
    points.push({
      ts: r.recorded_at,
      label: new Date(r.recorded_at).toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: Number(r.value),
    });
    seriesMap.set(r.equipment_id, points);
  }

  return filtered.map((eq) => ({
    equipmentId: eq.id,
    name: eq.name,
    points: (seriesMap.get(eq.id) ?? []).sort((a, b) => a.ts.localeCompare(b.ts)),
  }));
}

/**
 * Banda diaria (promedio / mínimo / máximo) de temperatura. Da la tendencia
 * general del período sin el ruido de cada lectura.
 */
export function buildDailyBand(readings: TemperatureReading[]): DailyBandPoint[] {
  const byDay = new Map<string, { values: number[]; count: number }>();
  for (const r of readings) {
    if (!r.recorded_at) continue;
    const d = new Date(r.recorded_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const entry = byDay.get(key) ?? { values: [], count: 0 };
    entry.values.push(Number(r.value));
    entry.count++;
    byDay.set(key, entry);
  }

  const points: DailyBandPoint[] = Array.from(byDay.entries())
    .map(([date, entry]) => {
      const values = entry.values;
      const sum = values.reduce((acc, v) => acc + v, 0);
      return {
        date,
        label: `${date.slice(8, 10)}/${date.slice(5, 7)}`,
        avg: Math.round((sum / values.length) * 10) / 10,
        min: Math.min(...values),
        max: Math.max(...values),
        count: entry.count,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return points;
}
