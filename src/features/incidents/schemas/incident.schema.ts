/**
 * Schema Zod para resolución de incidentes (HACCP / ISP).
 *
 * Regla de negocio: el campo `action_taken` debe tener mínimo 20 caracteres.
 * Esto garantiza que la acción correctiva documentada tenga suficiente
 * detalle para auditoría sanitaria.
 */
import { z } from 'zod';

export const resolveIncidentSchema = z.object({
  actionTaken: z
    .string({ message: 'Describe la acción correctiva' })
    .trim()
    .min(20, 'La acción correctiva debe tener al menos 20 caracteres')
    .max(1000, 'La acción correctiva no puede superar los 1000 caracteres'),
});

export type ResolveIncidentFormData = z.infer<typeof resolveIncidentSchema>;