import { describe, it, expect } from 'vitest';
import { buildEquipmentSeries, buildDailyBand } from '@/features/reports/lib/reportCharts';
import type { TemperatureReading } from '@/shared/types/supabase';

function reading(equipmentId: string, value: number, recordedAt: string): TemperatureReading {
  return {
    id: `r-${equipmentId}-${recordedAt}-${value}`,
    equipment_id: equipmentId,
    value,
    recorded_at: recordedAt,
    snapshot_min_temp: null,
    snapshot_max_temp: null,
  } as TemperatureReading;
}

const EQUIPMENT = [
  { id: 'eq-1', name: 'Refrigerador A', min_temp: 0, max_temp: 6 },
  { id: 'eq-2', name: 'Congelador B', min_temp: -18, max_temp: -12 },
];

describe('reportCharts · buildEquipmentSeries', () => {
  it('agrupa lecturas por equipo y ordena por fecha', () => {
    const readings = [
      reading('eq-1', 4, '2026-07-24T08:00:00Z'),
      reading('eq-1', 5, '2026-07-24T10:00:00Z'),
      reading('eq-2', -15, '2026-07-24T09:00:00Z'),
    ];
    const series = buildEquipmentSeries(readings, EQUIPMENT);
    expect(series).toHaveLength(2);
    const eq1 = series.find((s) => s.equipmentId === 'eq-1')!;
    expect(eq1.points.map((p) => p.value)).toEqual([4, 5]);
    expect(eq1.points[0].ts).toBe('2026-07-24T08:00:00Z');
  });

  it('filtra por equipo seleccionado', () => {
    const readings = [
      reading('eq-1', 4, '2026-07-24T08:00:00Z'),
      reading('eq-2', -15, '2026-07-24T09:00:00Z'),
    ];
    const series = buildEquipmentSeries(readings, EQUIPMENT, 'eq-2');
    expect(series).toHaveLength(1);
    expect(series[0].equipmentId).toBe('eq-2');
  });

  it('ignora equipos sin lecturas (serie vacía) y lecturas de equipos fuera de lista', () => {
    const readings = [reading('eq-unknown', 3, '2026-07-24T08:00:00Z')];
    const series = buildEquipmentSeries(readings, EQUIPMENT);
    expect(series).toHaveLength(2);
    expect(series.every((s) => s.points.length === 0)).toBe(true);
  });
});

describe('reportCharts · buildDailyBand', () => {
  it('agrupa por día y calcula avg/min/max', () => {
    const readings = [
      reading('eq-1', 2, '2026-07-24T08:00:00Z'),
      reading('eq-1', 6, '2026-07-24T10:00:00Z'),
      reading('eq-1', 4, '2026-07-25T08:00:00Z'),
    ];
    const band = buildDailyBand(readings, new Date('2026-07-26T00:00:00Z'));
    expect(band).toHaveLength(2);
    expect(band[0]).toMatchObject({ date: '2026-07-24', avg: 4, min: 2, max: 6, count: 2 });
    expect(band[1]).toMatchObject({ date: '2026-07-25', avg: 4, min: 4, max: 4, count: 1 });
  });

  it('ordena por fecha ascendente', () => {
    const readings = [
      reading('eq-1', 4, '2026-07-26T08:00:00Z'),
      reading('eq-1', 4, '2026-07-24T08:00:00Z'),
    ];
    const band = buildDailyBand(readings);
    expect(band.map((b) => b.date)).toEqual(['2026-07-24', '2026-07-26']);
  });

  it('devuelve lista vacía sin lecturas', () => {
    expect(buildDailyBand([])).toEqual([]);
  });
});
