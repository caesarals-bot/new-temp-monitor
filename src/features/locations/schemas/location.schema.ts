import { z } from 'zod';
import { locationSchema } from '@/features/auth/schemas/onboarding.schema';

export const createLocationSchema = locationSchema;

export type CreateLocationFormData = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = z
  .object({
    name: locationSchema.shape.name.optional(),
    address: z
      .string()
      .max(200, 'La dirección no puede superar los 200 caracteres')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.address !== undefined,
    {
      message: 'Debes modificar al menos un campo',
      path: ['name'],
    }
  );

export type UpdateLocationFormData = z.infer<typeof updateLocationSchema>;
