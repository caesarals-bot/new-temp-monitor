import { z } from 'zod';
import type { BusinessTypeEnum, PlanTypeEnum } from '@/shared/types/supabase';

export const accountSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  fullName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const organizationSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  businessType: z.enum(
    ['restaurant', 'pharmacy', 'butcher_shop', 'supermarket', 'general'] as [BusinessTypeEnum, ...BusinessTypeEnum[]]
  ),
  planType: z.enum(['basic', 'pro', 'enterprise'] as [PlanTypeEnum, ...PlanTypeEnum[]]),
});

export const locationSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  address: z.string().optional(),
});

export const staffMemberSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  role: z.string().min(2, 'Puesto debe tener al menos 2 caracteres'),
});

export const equipmentSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  physicalLocation: z.string().optional(),
  minTemp: z.number().min(-100, 'Temperatura mínima muy baja'),
  maxTemp: z.number().max(100, 'Temperatura máxima muy alta'),
}).refine((data) => data.minTemp < data.maxTemp, {
  message: 'Temperatura mínima debe ser menor que la máxima',
  path: ['minTemp'],
});

export type AccountFormData = z.infer<typeof accountSchema>;
export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type StaffMemberFormData = z.infer<typeof staffMemberSchema>;
export type EquipmentFormData = z.infer<typeof equipmentSchema>;