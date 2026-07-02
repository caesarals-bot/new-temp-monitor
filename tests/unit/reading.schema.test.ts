import { describe, it, expect } from 'vitest';
import {
  createReadingSchema,
  type CreateReadingFormData,
} from '@/features/readings/schemas/reading.schema';

describe('createReadingSchema', () => {
  it('passes with valid data', () => {
    const result = createReadingSchema.safeParse({
      equipmentId: 'eq-1',
      value: 3.5,
    });
    expect(result.success).toBe(true);
  });

  it('passes with all optional fields', () => {
    const result = createReadingSchema.safeParse({
      equipmentId: 'eq-1',
      value: 3.5,
      recordedByStaff: 's-1',
      takenBy: 'Inspector de turno',
    });
    expect(result.success).toBe(true);
  });

  it('passes with negative value (freezer)', () => {
    const result = createReadingSchema.safeParse({
      equipmentId: 'eq-1',
      value: -18.5,
    });
    expect(result.success).toBe(true);
  });

  it('passes with explicit null recordedByStaff', () => {
    const result = createReadingSchema.safeParse({
      equipmentId: 'eq-1',
      value: 3.5,
      recordedByStaff: null,
      takenBy: null,
    });
    expect(result.success).toBe(true);
  });

  it('fails with empty equipmentId', () => {
    const result = createReadingSchema.safeParse({
      equipmentId: '',
      value: 3.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Selecciona un equipo');
    }
  });

  it('fails with value below -100', () => {
    const result = createReadingSchema.safeParse({
      equipmentId: 'eq-1',
      value: -150,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('La temperatura debe estar entre -100 y 100 °C');
    }
  });

  it('fails with value above 100', () => {
    const result = createReadingSchema.safeParse({
      equipmentId: 'eq-1',
      value: 150,
    });
    expect(result.success).toBe(false);
  });

  it('fails when takenBy exceeds 100 chars', () => {
    const result = createReadingSchema.safeParse({
      equipmentId: 'eq-1',
      value: 3.5,
      takenBy: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('accepts takenBy of exactly 100 chars', () => {
    const result = createReadingSchema.safeParse({
      equipmentId: 'eq-1',
      value: 3.5,
      takenBy: 'x'.repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it('infers the form data type', () => {
    const data: CreateReadingFormData = {
      equipmentId: 'eq-1',
      value: 3.5,
      recordedByStaff: 's-1',
      takenBy: null,
    };
    expect(data.value).toBe(3.5);
  });
});