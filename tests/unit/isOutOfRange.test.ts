import { describe, it, expect } from 'vitest';
import { isOutOfRange, outOfRangeDirection } from '@/features/readings/lib/isOutOfRange';

describe('isOutOfRange', () => {
  it('returns false when value is within range', () => {
    expect(isOutOfRange(3.5, 0, 6)).toBe(false);
  });

  it('returns false when value equals min', () => {
    expect(isOutOfRange(0, 0, 6)).toBe(false);
  });

  it('returns false when value equals max', () => {
    expect(isOutOfRange(6, 0, 6)).toBe(false);
  });

  it('returns true when value is below min', () => {
    expect(isOutOfRange(-1, 0, 6)).toBe(true);
  });

  it('returns true when value is above max', () => {
    expect(isOutOfRange(10, 0, 6)).toBe(true);
  });

  it('handles negative ranges (freezer)', () => {
    expect(isOutOfRange(-18, -22, -15)).toBe(false);
    expect(isOutOfRange(-10, -22, -15)).toBe(true);
    expect(isOutOfRange(-25, -22, -15)).toBe(true);
  });

  it('returns false for null value', () => {
    expect(isOutOfRange(null, 0, 6)).toBe(false);
  });

  it('returns false for undefined value', () => {
    expect(isOutOfRange(undefined, 0, 6)).toBe(false);
  });

  it('returns false for NaN value', () => {
    expect(isOutOfRange(NaN, 0, 6)).toBe(false);
  });
});

describe('outOfRangeDirection', () => {
  it('returns null when in range', () => {
    expect(outOfRangeDirection(3.5, 0, 6)).toBeNull();
  });

  it('returns "low" when below min', () => {
    expect(outOfRangeDirection(-1, 0, 6)).toBe('low');
  });

  it('returns "high" when above max', () => {
    expect(outOfRangeDirection(10, 0, 6)).toBe('high');
  });

  it('returns null for null/undefined/NaN', () => {
    expect(outOfRangeDirection(null, 0, 6)).toBeNull();
    expect(outOfRangeDirection(undefined, 0, 6)).toBeNull();
    expect(outOfRangeDirection(NaN, 0, 6)).toBeNull();
  });

  it('returns null when value equals min', () => {
    expect(outOfRangeDirection(0, 0, 6)).toBeNull();
  });

  it('returns null when value equals max', () => {
    expect(outOfRangeDirection(6, 0, 6)).toBeNull();
  });
});