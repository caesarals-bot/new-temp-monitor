/**
 * Schema Zod para los filtros del reporte.
 *
 * Reglas:
 * - `from` y `to` son fechas ISO válidas.
 * - `from <= to`.
 * - Rango máximo: 366 días (un año + 1) para evitar reportes absurdos.
 * - `readingType` ∈ 'all' | 'manual' | 'iot'.
 */
import { z } from 'zod';

export const reportFiltersSchema = z
  .object({
    from: z.string().min(1, 'Fecha inicial requerida'),
    to: z.string().min(1, 'Fecha final requerida'),
    locationId: z.string().nullable().optional(),
    equipmentId: z.string().nullable().optional(),
    readingType: z.enum(['all', 'manual', 'iot']),
    onlyWithIncidents: z.boolean(),
  })
  .refine((data) => !Number.isNaN(Date.parse(data.from)), {
    message: 'Fecha inicial inválida',
    path: ['from'],
  })
  .refine((data) => !Number.isNaN(Date.parse(data.to)), {
    message: 'Fecha final inválida',
    path: ['to'],
  })
  .refine((data) => Date.parse(data.from) <= Date.parse(data.to), {
    message: 'La fecha inicial debe ser anterior o igual a la final',
    path: ['from'],
  })
  .refine(
    (data) => {
      const diffDays = (Date.parse(data.to) - Date.parse(data.from)) / (1000 * 60 * 60 * 24);
      return diffDays <= 366;
    },
    {
      message: 'El rango máximo es 1 año',
      path: ['to'],
    }
  );

export type ReportFiltersFormData = z.infer<typeof reportFiltersSchema>;
