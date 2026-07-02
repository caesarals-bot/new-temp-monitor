import { describe, it, expect } from 'vitest';
import { resolveIncidentSchema } from '@/features/incidents/schemas/incident.schema';

describe('resolveIncidentSchema', () => {
  it('passes with a valid action_taken of 20+ chars', () => {
    const result = resolveIncidentSchema.safeParse({
      actionTaken: 'Se reubicaron los productos al equipo de respaldo',
    });
    expect(result.success).toBe(true);
  });

  it('accepts exactly 20 characters', () => {
    const result = resolveIncidentSchema.safeParse({
      actionTaken: 'x'.repeat(20),
    });
    expect(result.success).toBe(true);
  });

  it('fails with empty string', () => {
    const result = resolveIncidentSchema.safeParse({ actionTaken: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'La acción correctiva debe tener al menos 20 caracteres'
      );
    }
  });

  it('fails with less than 20 characters', () => {
    const result = resolveIncidentSchema.safeParse({
      actionTaken: 'muy corta',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'La acción correctiva debe tener al menos 20 caracteres'
      );
    }
  });

  it('trims whitespace before validating length', () => {
    const result = resolveIncidentSchema.safeParse({
      actionTaken: '   corto   ',
    });
    expect(result.success).toBe(false);
  });

  it('fails with more than 1000 characters', () => {
    const result = resolveIncidentSchema.safeParse({
      actionTaken: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'La acción correctiva no puede superar los 1000 caracteres'
      );
    }
  });

  it('fails when actionTaken is missing', () => {
    const result = resolveIncidentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});