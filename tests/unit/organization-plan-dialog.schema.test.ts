import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema duplicado del OrganizationPlanDialog para test de lógica pura sin
// renderHook (el entorno de tests de componentes está roto en este repo).
// Mantener en sync con src/features/platform-admin/components/OrganizationPlanDialog.tsx.
const PLAN_VALUES = ['basic', 'pro', 'enterprise'] as const;

const planSchema = z.object({
  planType: z.enum(PLAN_VALUES),
  maxLocations: z.coerce
    .number({ message: 'Máximo de sedes debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 sede')
    .max(50, 'Máximo 50 sedes'),
  confirmation: z.literal('confirmar', {
    message: 'Debes escribir "confirmar" para proceder',
  }),
});

type PlanFormValues = z.infer<typeof planSchema>;

const valid: PlanFormValues = { planType: 'pro', maxLocations: 5, confirmation: 'confirmar' };

describe('organization plan dialog · schema', () => {
  it('accepts a valid plan change', () => {
    expect(planSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid plan type', () => {
    const result = planSchema.safeParse({ ...valid, planType: 'gold' });
    expect(result.success).toBe(false);
  });

  it('rejects maxLocations below 1', () => {
    const result = planSchema.safeParse({ ...valid, maxLocations: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects maxLocations above 50', () => {
    const result = planSchema.safeParse({ ...valid, maxLocations: 51 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer maxLocations', () => {
    const result = planSchema.safeParse({ ...valid, maxLocations: 2.5 });
    expect(result.success).toBe(false);
  });

  it('coerces a numeric string maxLocations', () => {
    const result = planSchema.safeParse({ ...valid, maxLocations: '7' });
    expect(result.success).toBe(true);
  });

  it('rejects missing confirmation', () => {
    const result = planSchema.safeParse({ ...valid, confirmation: '' });
    expect(result.success).toBe(false);
  });

  it('rejects wrong confirmation text', () => {
    const result = planSchema.safeParse({ ...valid, confirmation: 'aprobado' });
    expect(result.success).toBe(false);
  });
});
