/**
 * Bypass de autenticación para desarrollo.
 *
 * SOLO se activa cuando `VITE_DEV_BYPASS_AUTH === 'true'` en .env.local.
 * NO usar en producción. Si el flag no está seteado, devuelve sesión/profile
 * nulos y el flujo real de Supabase Auth toma el control.
 *
 * Datos mockeados:
 * - Usuario: dev@tempmonitor.local (role: owner)
 * - Organización: "Empresa Demo" (plan: pro)
 * - 2 sedes: "Casa Central", "Sucursal Norte"
 */

import type { Session, User } from '@supabase/supabase-js';
import type { Organization, Location, Profile, Incident, Staff, Equipment, TemperatureReading } from '@/shared/types/supabase';

export const isDevBypassEnabled = (): boolean => {
  return import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
};

export const isDevPlatformAdminBypassEnabled = (): boolean => {
  return import.meta.env.VITE_DEV_BYPASS_PLATFORM_ADMIN === 'true';
};

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEV_ORG_ID = '00000000-0000-0000-0000-000000000010';
const DEV_LOC_1_ID = '00000000-0000-0000-0000-000000000101';
const DEV_LOC_2_ID = '00000000-0000-0000-0000-000000000102';

export function getDevMockUser(): User {
  return {
    id: DEV_USER_ID,
    email: 'dev@tempmonitor.local',
    app_metadata: {},
    user_metadata: { full_name: 'Dev User' },
    aud: 'authenticated',
    created_at: '2026-06-30T00:00:00Z',
  } as User;
}

export function getDevMockSession(): Session {
  const user = getDevMockUser();
  return {
    access_token: 'dev-bypass-token',
    refresh_token: 'dev-bypass-refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user,
  } as Session;
}

export function getDevMockProfile(): Profile {
  return {
    id: DEV_USER_ID,
    email: 'dev@tempmonitor.local',
    full_name: 'Dev User',
    organization_id: isDevPlatformAdminBypassEnabled() ? null : DEV_ORG_ID,
    role: 'owner',
    is_platform_admin: isDevPlatformAdminBypassEnabled(),
    created_at: '2026-06-30T00:00:00Z',
  };
}

export function getDevMockOrganization(): Organization {
  return {
    id: DEV_ORG_ID,
    name: 'Empresa Demo',
    business_type: 'restaurant',
    status: 'active',
    plan_type: 'pro',
    max_locations: 2,
    created_by: DEV_USER_ID,
    created_at: '2026-06-30T00:00:00Z',
  };
}

export function getDevMockLocations(): Location[] {
  return [
    {
      id: DEV_LOC_1_ID,
      organization_id: DEV_ORG_ID,
      name: 'Casa Central',
      address: 'Av. Demo 123, Santiago',
      created_at: '2026-06-30T00:00:00Z',
    },
    {
      id: DEV_LOC_2_ID,
      organization_id: DEV_ORG_ID,
      name: 'Sucursal Norte',
      address: 'Av. Norte 456, Santiago',
      created_at: '2026-06-30T00:00:00Z',
    },
  ];
}

export function getDevMockActiveLocationId(): string {
  return DEV_LOC_1_ID;
}

const DEV_STAFF_LOC1_A = '00000000-0000-0000-0000-000000000201';
const DEV_STAFF_LOC1_B = '00000000-0000-0000-0000-000000000202';
const DEV_STAFF_LOC2_A = '00000000-0000-0000-0000-000000000203';
const DEV_STAFF_LOC2_B = '00000000-0000-0000-0000-000000000204';

function buildStaff(
  id: string,
  locationId: string,
  name: string,
  role: string,
  active: boolean
): Staff {
  return {
    id,
    location_id: locationId,
    name,
    role,
    active,
    created_at: '2026-06-30T00:00:00Z',
    updated_at: '2026-06-30T00:00:00Z',
  };
}

export function getDevMockStaff(): Staff[] {
  return [
    buildStaff(DEV_STAFF_LOC1_A, DEV_LOC_1_ID, 'María López', 'Cocinera', true),
    buildStaff(DEV_STAFF_LOC1_B, DEV_LOC_1_ID, 'Pedro Ramírez', 'Auxiliar de cocina', true),
    buildStaff(DEV_STAFF_LOC2_A, DEV_LOC_2_ID, 'Ana Torres', 'Cocinera', true),
    buildStaff(DEV_STAFF_LOC2_B, DEV_LOC_2_ID, 'Luis Vega', 'Auxiliar de cocina', true),
  ];
}

const DEV_EQ_LOC1_A = '00000000-0000-0000-0000-000000000301';
const DEV_EQ_LOC1_B = '00000000-0000-0000-0000-000000000302';
const DEV_EQ_LOC1_C = '00000000-0000-0000-0000-000000000303';
const DEV_EQ_LOC2_A = '00000000-0000-0000-0000-000000000304';
const DEV_EQ_LOC2_B = '00000000-0000-0000-0000-000000000305';

function buildEquipment(
  id: string,
  locationId: string,
  name: string,
  physicalLocation: string,
  code: string,
  minTemp: number,
  maxTemp: number
): Equipment {
  return {
    id,
    location_id: locationId,
    name,
    physical_location: physicalLocation,
    code,
    min_temp: minTemp,
    max_temp: maxTemp,
    is_iot_enabled: false,
    iot_device_id: null,
    created_at: '2026-06-30T00:00:00Z',
  };
}

export function getDevMockEquipment(): Equipment[] {
  return [
    buildEquipment(DEV_EQ_LOC1_A, DEV_LOC_1_ID, 'Refrigerador Lácteos', 'Cocina - pared norte', 'EQ-CC-001', 0, 6),
    buildEquipment(DEV_EQ_LOC1_B, DEV_LOC_1_ID, 'Congelador Carnes', 'Bodega', 'EQ-CC-002', -22, -15),
    buildEquipment(DEV_EQ_LOC1_C, DEV_LOC_1_ID, 'Vitrina Refrigerada', 'Mostrador', 'EQ-CC-003', 2, 8),
    buildEquipment(DEV_EQ_LOC2_A, DEV_LOC_2_ID, 'Refrigerador Bebidas', 'Sala ventas', 'EQ-SN-001', 0, 8),
    buildEquipment(DEV_EQ_LOC2_B, DEV_LOC_2_ID, 'Congelador Helados', 'Bodega trasera', 'EQ-SN-002', -20, -12),
  ];
}

const DEV_READING_ID = '00000000-0000-0000-0000-000000000200';

export function getDevMockIncidents(count: number = 3): Incident[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
    status: 'open' as const,
    description: `Incidente mock #${i + 1}`,
    action_taken: null,
    resolved_by: null,
    resolved_at: null,
    reading_id: DEV_READING_ID,
    created_at: '2026-06-30T12:00:00Z',
  }));
}

const TODAY = new Date('2026-07-01T08:00:00Z');
const YESTERDAY = new Date('2026-06-30T16:00:00Z');
const TWO_DAYS_AGO = new Date('2026-06-29T10:00:00Z');

function buildReading(
  id: string,
  equipmentId: string,
  value: number,
  recordedAt: Date,
  recordedByStaff: string | null,
  takenBy: string | null
): TemperatureReading {
  return {
    id,
    equipment_id: equipmentId,
    value,
    reading_type: 'manual',
    sensor_battery: null,
    sensor_signal: null,
    snapshot_min_temp: null,
    snapshot_max_temp: null,
    recorded_by_profile: DEV_USER_ID,
    recorded_by_staff: recordedByStaff,
    taken_by: takenBy,
    recorded_at: recordedAt.toISOString(),
  };
}

export function getDevMockReadings(): TemperatureReading[] {
  return [
    buildReading('00000000-0000-0000-0000-000000000401', DEV_EQ_LOC1_A, 3.5, TODAY, DEV_STAFF_LOC1_A, null),
    buildReading('00000000-0000-0000-0000-000000000402', DEV_EQ_LOC1_A, 8.2, YESTERDAY, DEV_STAFF_LOC1_B, null),
    buildReading('00000000-0000-0000-0000-000000000403', DEV_EQ_LOC1_B, -18.0, TODAY, DEV_STAFF_LOC1_A, null),
    buildReading('00000000-0000-0000-0000-000000000404', DEV_EQ_LOC1_C, 5.0, TODAY, null, 'Inspector de turno'),
    buildReading('00000000-0000-0000-0000-000000000405', DEV_EQ_LOC2_A, 4.0, YESTERDAY, DEV_STAFF_LOC2_A, null),
    buildReading('00000000-0000-0000-0000-000000000406', DEV_EQ_LOC2_A, 9.5, YESTERDAY, DEV_STAFF_LOC2_B, null),
    buildReading('00000000-0000-0000-0000-000000000407', DEV_EQ_LOC2_B, -15.0, TODAY, DEV_STAFF_LOC2_A, null),
    buildReading('00000000-0000-0000-0000-000000000408', DEV_EQ_LOC1_C, 2.5, TWO_DAYS_AGO, DEV_STAFF_LOC1_B, null),
  ];
}
