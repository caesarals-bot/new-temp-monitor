import { describe, it, expect } from 'vitest';
import {
  createLocationSchema,
  updateLocationSchema,
} from '@/features/locations/schemas/location.schema';

describe('createLocationSchema', () => {
  it('passes with valid data', () => {
    const result = createLocationSchema.safeParse({
      name: 'Sucursal Norte',
      address: 'Av. Norte 456',
    });
    expect(result.success).toBe(true);
  });

  it('passes without optional address', () => {
    const result = createLocationSchema.safeParse({ name: 'Sucursal Norte' });
    expect(result.success).toBe(true);
  });

  it('passes with empty address treated as missing', () => {
    const result = createLocationSchema.safeParse({ name: 'Sucursal Norte', address: '' });
    expect(result.success).toBe(true);
  });

  it('fails with short name', () => {
    const result = createLocationSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Nombre debe tener al menos 2 caracteres');
    }
  });

  it('fails with empty name', () => {
    const result = createLocationSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});

describe('updateLocationSchema', () => {
  it('passes when only name is provided', () => {
    const result = updateLocationSchema.safeParse({ name: 'Renombrada' });
    expect(result.success).toBe(true);
  });

  it('passes when only address is provided', () => {
    const result = updateLocationSchema.safeParse({ address: 'Av. Nueva 789' });
    expect(result.success).toBe(true);
  });

  it('passes when address is explicitly null (clear field)', () => {
    const result = updateLocationSchema.safeParse({ address: null });
    expect(result.success).toBe(true);
  });

  it('passes when both fields are provided', () => {
    const result = updateLocationSchema.safeParse({
      name: 'Renombrada',
      address: 'Av. Nueva 789',
    });
    expect(result.success).toBe(true);
  });

  it('fails when no fields are provided', () => {
    const result = updateLocationSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Debes modificar al menos un campo');
    }
  });

  it('fails with short name', () => {
    const result = updateLocationSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('fails with too long address', () => {
    const result = updateLocationSchema.safeParse({ address: 'x'.repeat(201) });
    expect(result.success).toBe(false);
  });
});
