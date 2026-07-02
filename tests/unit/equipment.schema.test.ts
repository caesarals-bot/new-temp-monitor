import { describe, it, expect } from 'vitest';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
} from '@/features/equipment/schemas/equipment.schema';

describe('createEquipmentSchema', () => {
  it('passes with valid data and physicalLocation', () => {
    const result = createEquipmentSchema.safeParse({
      name: 'Refrigerador Lácteos',
      physicalLocation: 'Cocina',
      minTemp: 0,
      maxTemp: 6,
    });
    expect(result.success).toBe(true);
  });

  it('passes without optional physicalLocation', () => {
    const result = createEquipmentSchema.safeParse({
      name: 'Refrigerador Lácteos',
      minTemp: 0,
      maxTemp: 6,
    });
    expect(result.success).toBe(true);
  });

  it('fails with short name', () => {
    const result = createEquipmentSchema.safeParse({
      name: 'R',
      minTemp: 0,
      maxTemp: 6,
    });
    expect(result.success).toBe(false);
  });

  it('fails when minTemp is not less than maxTemp', () => {
    const result = createEquipmentSchema.safeParse({
      name: 'Refrigerador',
      minTemp: 10,
      maxTemp: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Temperatura mínima debe ser menor que la máxima');
    }
  });

  it('fails when minTemp equals maxTemp', () => {
    const result = createEquipmentSchema.safeParse({
      name: 'Refrigerador',
      minTemp: 5,
      maxTemp: 5,
    });
    expect(result.success).toBe(false);
  });

  it('fails with very low minTemp', () => {
    const result = createEquipmentSchema.safeParse({
      name: 'Congelador',
      minTemp: -200,
      maxTemp: -10,
    });
    expect(result.success).toBe(false);
  });

  it('fails with very high maxTemp', () => {
    const result = createEquipmentSchema.safeParse({
      name: 'Horno',
      minTemp: 0,
      maxTemp: 200,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateEquipmentSchema', () => {
  it('passes when only name is provided', () => {
    const result = updateEquipmentSchema.safeParse({ name: 'Renombrado' });
    expect(result.success).toBe(true);
  });

  it('passes when only minTemp/maxTemp are provided', () => {
    const result = updateEquipmentSchema.safeParse({ minTemp: 2, maxTemp: 8 });
    expect(result.success).toBe(true);
  });

  it('passes when physicalLocation is explicitly null (clear field)', () => {
    const result = updateEquipmentSchema.safeParse({ physicalLocation: null });
    expect(result.success).toBe(true);
  });

  it('passes when code is provided', () => {
    const result = updateEquipmentSchema.safeParse({ code: 'EQ-002' });
    expect(result.success).toBe(true);
  });

  it('fails when no fields are provided', () => {
    const result = updateEquipmentSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Debes modificar al menos un campo');
    }
  });

  it('fails when minTemp is not less than maxTemp (both provided)', () => {
    const result = updateEquipmentSchema.safeParse({ minTemp: 10, maxTemp: 0 });
    expect(result.success).toBe(false);
  });

  it('fails with very long code', () => {
    const result = updateEquipmentSchema.safeParse({ code: 'x'.repeat(51) });
    expect(result.success).toBe(false);
  });
});
