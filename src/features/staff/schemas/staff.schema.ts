import { z } from 'zod';
import { staffMemberSchema } from '@/features/auth/schemas/onboarding.schema';

export const createStaffSchema = staffMemberSchema;

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z
  .object({
    name: staffMemberSchema.shape.name.optional(),
    role: staffMemberSchema.shape.role.optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.role !== undefined,
    {
      message: 'Debes modificar al menos un campo',
      path: ['name'],
    }
  );

export type UpdateStaffFormData = z.infer<typeof updateStaffSchema>;
