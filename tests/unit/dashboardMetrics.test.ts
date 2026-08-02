import { describe, it, expect } from 'vitest';
import {
  buildTrendBuckets,
  computeTrend,
  computeCompliancePercent,
  computeAveragesByEquipment,
  computeMinMaxToday,
} from '@/features/readings/lib/dashboardMetrics';
import type { TemperatureReading } from '@/shared/types/supabase';

const NOW = new Date('2026-07-08T12:00:00Z'); // miércoles

function reading(
  equipmentId: string,
  value: number,
  recordedAt: string,
  snapshot?: { min: number; max: number }
): TemperatureReading {
  return {
    id: `r-${equipmentId}-${recordedAt}-${value}`,
    equipment_id: equipmentId,
    value,
    recorded_at: recordedAt,
    snapshot_min_temp: snapshot?.min ?? null,
    snapshot_max_temp: snapshot?.max ?? null,
  } as TemperatureReading;
}

describe('dashboardMetrics · buildTrendBuckets', () => {
  it('genera 7 buckets terminando en el día de `now`', () => {
    const buckets = buildTrendBuckets(NOW);
    expect(buckets).toHaveLength(7);
    expect(buckets[6]).toBe('2026-07-08');
    expect(buckets[0]).toBe('2026-07-02');
  });
});

describe('dashboardMetrics · computeTrend', () => {
  it('cuenta lecturas por día y rellena días sin lecturas con 0', () => {
    const readings = [
      reading('eq-1', 4, '2026-07-08T08:00:00Z'),
      reading('eq-1', 5, '2026-07-08T10:00:00Z'),
      reading('eq-2', 3, '2026-07-06T09:00:00Z'),
    ];
    const trend = computeTrend(readings, NOW);
    expect(trend).toHaveLength(7);
    expect(trend.find((t) => t.date === '2026-07-08')?.count).toBe(2);
    expect(trend.find((t) => t.date === '2026-07-06')?.count).toBe(1);
    expect(trend.find((t) => t.date === '2026-07-07')?.count).toBe(0);
    expect(trend.find((t) => t.date === '2026-07-02')?.count).toBe(0);
  });

  it('ignora lecturas fuera de la ventana de 7 días', () => {
    const readings = [reading('eq-1', 4, '2026-06-01T08:00:00Z')];
    const trend = computeTrend(readings, NOW);
    expect(trend.every((t) => t.count === 0)).toBe(true);
  });
});

describe('dashboardMetrics · computeCompliancePercent', () => {
  it('devuelve null sin lecturas', () => {
    expect(computeCompliancePercent([], new Map())).toBeNull();
  });

  it('calcula el % usando snapshot HACCP', () => {
    const readings = [
      reading('eq-1', 4, '2026-07-08T08:00:00Z', { min: 0, max: 6 }), // ok
      reading('eq-1', 9, '2026-07-08T10:00:00Z', { min: 0, max: 6 }), // fuera
      reading('eq-1', 5, '2026-07-08T12:00:00Z', { min: 0, max: 6 }), // ok
    ];
    expect(computeCompliancePercent(readings, new Map())).toBe(66.7);
  });

  it('usa el fallback de rango actual si no hay snapshot', () => {
    const ranges = new Map([['eq-1', { min: 0, max: 6 }]]);
    const readings = [
      reading('eq-1', 4, '2026-07-08T08:00:00Z'), // sin snapshot
      reading('eq-1', 10, '2026-07-08T10:00:00Z'),
    ];
    expect(computeCompliancePercent(readings, ranges)).toBe(50);
  });
});

describe('dashboardMetrics · computeAveragesByEquipment', () => {
  it('promedia por equipo y ordena ascendente', () => {
    const ranges = new Map([
      ['eq-1', { min: 0, max: 6 }],
      ['eq-2', { min: -2, max: 2 }],
    ]);
    const readings = [
      reading('eq-1', 4, '2026-07-08T08:00:00Z'),
      reading('eq-1', 6, '2026-07-08T10:00:00Z'),
      reading('eq-2', -1, '2026-07-08T09:00:00Z'),
    ];
    const averages = computeAveragesByEquipment(readings, ranges);
    expect(averages).toHaveLength(2);
    expect(averages[0]).toMatchObject({ equipmentId: 'eq-2', average: -1, min: -2, max: 2 });
    expect(averages[1]).toMatchObject({ equipmentId: 'eq-1', average: 5, min: 0, max: 6 });
  });

  it('devuelve lista vacía sin lecturas', () => {
    expect(computeAveragesByEquipment([], new Map())).toEqual([]);
  });
});

describe('dashboardMetrics · computeMinMaxToday', () => {
  it('calcula min/max de las lecturas del día de `now`', () => {
    const readings = [
      reading('eq-1', 4, '2026-07-08T08:00:00Z'),
      reading('eq-1', 9, '2026-07-08T10:00:00Z'),
      reading('eq-2', 2, '2026-07-07T09:00:00Z'), // ayer, se ignora
    ];
    expect(computeMinMaxToday(readings, NOW)).toEqual({ min: 4, max: 9 });
  });

  it('devuelve null si no hay lecturas hoy', () => {
    const readings = [reading('eq-1', 4, '2026-07-07T08:00:00Z')];
    expect(computeMinMaxToday(readings, NOW)).toBeNull();
  });
});
