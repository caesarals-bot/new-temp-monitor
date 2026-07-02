import { describe, it, expect } from 'vitest';
import {
  createStaffSchema,
  updateStaffSchema,
} from '@/features/staff/schemas/staff.schema';

describe('createStaffSchema', () => {
  it('passes with valid data', () => {
    const result = createStaffSchema.safeParse({
      name: 'María López',
      role: 'Cocinera',
    });
    expect(result.success).toBe(true);
  });

  it('fails with short name', () => {
    const result = createStaffSchema.safeParse({ name: 'M', role: 'Cocinera' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Nombre debe tener al menos 2 caracteres');
    }
  });

  it('fails with short role', () => {
    const result = createStaffSchema.safeParse({ name: 'María', role: 'A' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Puesto debe tener al menos 2 caracteres');
    }
  });

  it('fails with empty name', () => {
    const result = createStaffSchema.safeParse({ name: '', role: 'Cocinera' });
    expect(result.success).toBe(false);
  });
});

describe('updateStaffSchema', () => {
  it('passes when only name is provided', () => {
    const result = updateStaffSchema.safeParse({ name: 'María L.' });
    expect(result.success).toBe(true);
  });

  it('passes when only role is provided', () => {
    const result = updateStaffSchema.safeParse({ role: 'Chef' });
    expect(result.success).toBe(true);
  });

  it('passes when both fields are provided', () => {
    const result = updateStaffSchema.safeParse({
      name: 'María L.',
      role: 'Chef',
    });
    expect(result.success).toBe(true);
  });

  it('fails when no fields are provided', () => {
    const result = updateStaffSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Debes modificar al menos un campo');
    }
  });

  it('fails with short name', () => {
    const result = updateStaffSchema.safeParse({ name: 'M' });
    expect(result.success).toBe(false);
  });

  it('fails with short role', () => {
    const result = updateStaffSchema.safeParse({ role: 'A' });
    expect(result.success).toBe(false);
  });
});
