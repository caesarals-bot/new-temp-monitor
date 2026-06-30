import { describe, it, expect } from 'vitest';
import {
  accountSchema,
  organizationSchema,
  locationSchema,
  staffMemberSchema,
  equipmentSchema,
} from '../../src/features/auth/schemas/onboarding.schema';

describe('accountSchema', () => {
  it('passes with valid data', () => {
    const result = accountSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      fullName: 'Juan Perez',
    });
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const result = accountSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123',
      confirmPassword: 'Password123',
      fullName: 'Juan Perez',
    });
    expect(result.success).toBe(false);
  });

  it('fails with short password', () => {
    const result = accountSchema.safeParse({
      email: 'test@example.com',
      password: 'Pass1',
      confirmPassword: 'Pass1',
      fullName: 'Juan Perez',
    });
    expect(result.success).toBe(false);
  });

  it('fails with password missing uppercase', () => {
    const result = accountSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      fullName: 'Juan Perez',
    });
    expect(result.success).toBe(false);
  });

  it('fails with password missing number', () => {
    const result = accountSchema.safeParse({
      email: 'test@example.com',
      password: 'PasswordABC',
      confirmPassword: 'PasswordABC',
      fullName: 'Juan Perez',
    });
    expect(result.success).toBe(false);
  });

  it('fails when passwords do not match', () => {
    const result = accountSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password456',
      fullName: 'Juan Perez',
    });
    expect(result.success).toBe(false);
  });

  it('fails with short fullName', () => {
    const result = accountSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      fullName: 'J',
    });
    expect(result.success).toBe(false);
  });
});

describe('organizationSchema', () => {
  it('passes with valid data', () => {
    const result = organizationSchema.safeParse({
      name: 'Mi Empresa',
      businessType: 'restaurant',
      planType: 'basic',
    });
    expect(result.success).toBe(true);
  });

  it('passes with valid data', () => {
    const result = organizationSchema.safeParse({
      name: 'Mi Empresa',
      businessType: 'pharmacy',
      planType: 'basic',
    });
    expect(result.success).toBe(true);
  });

  it('fails with invalid business type', () => {
    const result = organizationSchema.safeParse({
      name: 'Mi Empresa',
      businessType: 'invalid_type',
    });
    expect(result.success).toBe(false);
  });

  it('fails with short name', () => {
    const result = organizationSchema.safeParse({
      name: 'A',
      businessType: 'restaurant',
    });
    expect(result.success).toBe(false);
  });
});

describe('locationSchema', () => {
  it('passes with valid data', () => {
    const result = locationSchema.safeParse({
      name: 'Casa Central',
      address: 'Av. Principal 123',
    });
    expect(result.success).toBe(true);
  });

  it('passes without optional address', () => {
    const result = locationSchema.safeParse({
      name: 'Casa Central',
    });
    expect(result.success).toBe(true);
  });

  it('fails with short name', () => {
    const result = locationSchema.safeParse({
      name: 'A',
    });
    expect(result.success).toBe(false);
  });
});

describe('staffMemberSchema', () => {
  it('passes with valid data', () => {
    const result = staffMemberSchema.safeParse({
      name: 'Maria Lopez',
      role: 'Cocinero',
    });
    expect(result.success).toBe(true);
  });

  it('fails with short name', () => {
    const result = staffMemberSchema.safeParse({
      name: 'M',
      role: 'Cocinero',
    });
    expect(result.success).toBe(false);
  });

  it('fails with short role', () => {
    const result = staffMemberSchema.safeParse({
      name: 'Maria Lopez',
      role: 'A',
    });
    expect(result.success).toBe(false);
  });
});

describe('equipmentSchema', () => {
  it('passes with valid data', () => {
    const result = equipmentSchema.safeParse({
      name: 'Nevera Lácteos 1',
      physicalLocation: 'Cocina principal',
      minTemp: -10,
      maxTemp: 8,
    });
    expect(result.success).toBe(true);
  });

  it('passes without optional physicalLocation', () => {
    const result = equipmentSchema.safeParse({
      name: 'Nevera Lácteos 1',
      minTemp: -10,
      maxTemp: 8,
    });
    expect(result.success).toBe(true);
  });

  it('fails when minTemp is not less than maxTemp', () => {
    const result = equipmentSchema.safeParse({
      name: 'Nevera Lácteos 1',
      minTemp: 10,
      maxTemp: -10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Temperatura mínima debe ser menor que la máxima');
    }
  });

  it('fails when minTemp equals maxTemp', () => {
    const result = equipmentSchema.safeParse({
      name: 'Nevera Lácteos 1',
      minTemp: 5,
      maxTemp: 5,
    });
    expect(result.success).toBe(false);
  });

  it('fails with very low minTemp', () => {
    const result = equipmentSchema.safeParse({
      name: 'Nevera Lácteos 1',
      minTemp: -200,
      maxTemp: 8,
    });
    expect(result.success).toBe(false);
  });

  it('fails with very high maxTemp', () => {
    const result = equipmentSchema.safeParse({
      name: 'Nevera Lácteos 1',
      minTemp: -10,
      maxTemp: 200,
    });
    expect(result.success).toBe(false);
  });
});