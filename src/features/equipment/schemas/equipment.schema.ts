import { z } from 'zod';
import { equipmentSchema } from '@/features/auth/schemas/onboarding.schema';

export const createEquipmentSchema = equipmentSchema;

export type CreateEquipmentFormData = z.infer<typeof createEquipmentSchema>;

export const updateEquipmentSchema = z
  .object({
    name: equipmentSchema.shape.name.optional(),
    physicalLocation: z
      .string()
      .max(200, 'La ubicación no puede superar los 200 caracteres')
      .nullable()
      .optional(),
    code: z
      .string()
      .max(50, 'El código no puede superar los 50 caracteres')
      .nullable()
      .optional(),
    minTemp: equipmentSchema.shape.minTemp.optional(),
    maxTemp: equipmentSchema.shape.maxTemp.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.physicalLocation !== undefined ||
      data.code !== undefined ||
      data.minTemp !== undefined ||
      data.maxTemp !== undefined,
    {
      message: 'Debes modificar al menos un campo',
      path: ['name'],
    }
  )
  .refine(
    (data) =>
      data.minTemp === undefined ||
      data.maxTemp === undefined ||
      data.minTemp < data.maxTemp,
    {
      message: 'Temperatura mínima debe ser menor que la máxima',
      path: ['minTemp'],
    }
  );

export type UpdateEquipmentFormData = z.infer<typeof updateEquipmentSchema>;

