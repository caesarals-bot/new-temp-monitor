import { describe, it, expect } from 'vitest';
import { reportFiltersSchema } from '@/features/reports/schemas/report.schema';

describe('reportFiltersSchema', () => {
  it('passes with valid all-optional defaults', () => {
    const result = reportFiltersSchema.safeParse({
      from: '2026-06-01T00:00:00Z',
      to: '2026-07-01T00:00:00Z',
      readingType: 'all',
      onlyWithIncidents: false,
    });
    expect(result.success).toBe(true);
  });

  it('passes with locationId and equipmentId', () => {
    const result = reportFiltersSchema.safeParse({
      from: '2026-06-01T00:00:00Z',
      to: '2026-07-01T00:00:00Z',
      locationId: 'loc-1',
      equipmentId: 'eq-1',
      readingType: 'manual',
      onlyWithIncidents: true,
    });
    expect(result.success).toBe(true);
  });

  it('fails when from is invalid date', () => {
    const result = reportFiltersSchema.safeParse({
      from: 'not-a-date',
      to: '2026-07-01T00:00:00Z',
      readingType: 'all',
      onlyWithIncidents: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'from')).toBe(true);
    }
  });

  it('fails when to is invalid date', () => {
    const result = reportFiltersSchema.safeParse({
      from: '2026-06-01T00:00:00Z',
      to: 'garbage',
      readingType: 'all',
      onlyWithIncidents: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'to')).toBe(true);
    }
  });

  it('fails when from > to', () => {
    const result = reportFiltersSchema.safeParse({
      from: '2026-07-01T00:00:00Z',
      to: '2026-06-01T00:00:00Z',
      readingType: 'all',
      onlyWithIncidents: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'from')).toBe(true);
    }
  });

  it('accepts from === to (single day)', () => {
    const result = reportFiltersSchema.safeParse({
      from: '2026-07-01T00:00:00Z',
      to: '2026-07-01T00:00:00Z',
      readingType: 'all',
      onlyWithIncidents: false,
    });
    expect(result.success).toBe(true);
  });

  it('fails when range exceeds 1 year', () => {
    const result = reportFiltersSchema.safeParse({
      from: '2025-01-01T00:00:00Z',
      to: '2026-06-01T00:00:00Z',
      readingType: 'all',
      onlyWithIncidents: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'to')).toBe(true);
    }
  });

  it('fails with unknown readingType', () => {
    const result = reportFiltersSchema.safeParse({
      from: '2026-06-01T00:00:00Z',
      to: '2026-07-01T00:00:00Z',
      readingType: 'unknown',
      onlyWithIncidents: false,
    });
    expect(result.success).toBe(false);
  });

  it('fails when missing required fields', () => {
    const result = reportFiltersSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
