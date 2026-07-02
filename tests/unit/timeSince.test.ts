import { describe, it, expect } from 'vitest';
import { formatTimeSince, isStaleReading, STALE_THRESHOLD_MS } from '@/features/readings/lib/timeSince';

const NOW = new Date('2026-07-01T12:00:00Z');

describe('timeSince · formatTimeSince', () => {
  it('returns "—" for null or undefined', () => {
    expect(formatTimeSince(null, NOW)).toBe('—');
    expect(formatTimeSince(undefined, NOW)).toBe('—');
  });

  it('returns "—" for invalid date string', () => {
    expect(formatTimeSince('not-a-date', NOW)).toBe('—');
  });

  it('returns "ahora" for future timestamps (defensive)', () => {
    const future = new Date(NOW.getTime() + 60_000);
    expect(formatTimeSince(future, NOW)).toBe('ahora');
  });

  it('returns "ahora" for diff < 60s', () => {
    const just = new Date(NOW.getTime() - 30_000);
    expect(formatTimeSince(just, NOW)).toBe('ahora');
  });

  it('returns "ahora" for diff exactly at 59s', () => {
    const edge = new Date(NOW.getTime() - 59_000);
    expect(formatTimeSince(edge, NOW)).toBe('ahora');
  });

  it('returns "Hace N min" for 1-59 min', () => {
    const minutes = new Date(NOW.getTime() - 5 * 60_000);
    expect(formatTimeSince(minutes, NOW)).toBe('Hace 5 min');
  });

  it('returns "Hace N min" at 59 min', () => {
    const minutes = new Date(NOW.getTime() - 59 * 60_000);
    expect(formatTimeSince(minutes, NOW)).toBe('Hace 59 min');
  });

  it('returns "Hace N h" for 1-23 hours', () => {
    const hours = new Date(NOW.getTime() - 3 * 3_600_000);
    expect(formatTimeSince(hours, NOW)).toBe('Hace 3 h');
  });

  it('returns "Hace N h" at 23 hours', () => {
    const hours = new Date(NOW.getTime() - 23 * 3_600_000);
    expect(formatTimeSince(hours, NOW)).toBe('Hace 23 h');
  });

  it('returns "Hace N día(s)" for 1-6 days', () => {
    const one = new Date(NOW.getTime() - 86_400_000);
    expect(formatTimeSince(one, NOW)).toBe('Hace 1 día');

    const three = new Date(NOW.getTime() - 3 * 86_400_000);
    expect(formatTimeSince(three, NOW)).toBe('Hace 3 días');

    const six = new Date(NOW.getTime() - 6 * 86_400_000);
    expect(formatTimeSince(six, NOW)).toBe('Hace 6 días');
  });

  it('returns "Hace N sem" for 7-29 days', () => {
    const week = new Date(NOW.getTime() - 7 * 86_400_000);
    expect(formatTimeSince(week, NOW)).toBe('Hace 1 sem');

    const threeWeeks = new Date(NOW.getTime() - 21 * 86_400_000);
    expect(formatTimeSince(threeWeeks, NOW)).toBe('Hace 3 sem');
  });

  it('returns "Hace N mes(es)" for ≥ 30 days', () => {
    const month = new Date(NOW.getTime() - 30 * 86_400_000);
    expect(formatTimeSince(month, NOW)).toBe('Hace 1 mes');

    const threeMonths = new Date(NOW.getTime() - 90 * 86_400_000);
    expect(formatTimeSince(threeMonths, NOW)).toBe('Hace 3 meses');
  });

  it('accepts ISO string input', () => {
    expect(formatTimeSince('2026-07-01T11:55:00Z', NOW)).toBe('Hace 5 min');
  });
});

describe('timeSince · isStaleReading', () => {
  it('exports the HACCP threshold constant (2 hours in ms)', () => {
    expect(STALE_THRESHOLD_MS).toBe(2 * 60 * 60 * 1000);
  });

  it('returns true for null or undefined', () => {
    expect(isStaleReading(null, NOW)).toBe(true);
    expect(isStaleReading(undefined, NOW)).toBe(true);
  });

  it('returns true for invalid date', () => {
    expect(isStaleReading('not-a-date', NOW)).toBe(true);
  });

  it('returns false when reading is fresh (< 2h)', () => {
    const fresh = new Date(NOW.getTime() - 60_000);
    expect(isStaleReading(fresh, NOW)).toBe(false);
  });

  it('returns true when reading is exactly at threshold', () => {
    const edge = new Date(NOW.getTime() - STALE_THRESHOLD_MS);
    expect(isStaleReading(edge, NOW)).toBe(true);
  });

  it('returns true when reading is older than threshold', () => {
    const old = new Date(NOW.getTime() - 3 * 3_600_000);
    expect(isStaleReading(old, NOW)).toBe(true);
  });

  it('accepts ISO string input', () => {
    expect(isStaleReading('2026-07-01T09:00:00Z', NOW)).toBe(true);
    expect(isStaleReading('2026-07-01T11:30:00Z', NOW)).toBe(false);
  });
});