import { z } from 'zod';

export const createReadingSchema = z
  .object({
    equipmentId: z.string().min(1, 'Selecciona un equipo'),
    value: z.number({ message: 'Ingresa la temperatura' }),
    recordedByStaff: z.string().nullable().optional(),
    takenBy: z
      .string()
      .max(100, 'El nombre no puede superar los 100 caracteres')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => data.value >= -100 && data.value <= 100,
    {
      message: 'La temperatura debe estar entre -100 y 100 °C',
      path: ['value'],
    }
  );

export type CreateReadingFormData = z.infer<typeof createReadingSchema>;