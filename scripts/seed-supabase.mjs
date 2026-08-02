import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually to load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
      if (key && !key.startsWith('#')) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('\x1b[31mError: VITE_SUPABASE_URL is missing in .env.local\x1b[0m');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('\x1b[31mError: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local\x1b[0m');
  console.log('\n\x1b[33mPara obtener esta clave, ve a tu panel de Supabase:');
  console.log('Project Settings -> API -> service_role (secret) key.');
  console.log('Agrégala a tu archivo .env.local como:\n');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu_clave_secreta_aqui\x1b[0m\n');
  process.exit(1);
}

// --- GUARD DE AMBIENTE ---
// El seed usa la service role key (acceso total a la BD). Por seguridad, solo
// se ejecuta contra entornos de desarrollo/staging salvo que se confirme con
// SEED_ENV=prod. Evita resetear contraseñas o datos de un proyecto productivo.
const SEED_ENV = process.env.SEED_ENV || 'dev';
const isDevLike = /localhost|supabase\.co\/project\/(dev|staging)|dev\.|staging\./i.test(supabaseUrl);
if (!isDevLike && SEED_ENV !== 'prod') {
  console.error(
    '\x1b[31m✖ ABORTADO: la URL del proyecto no parece un entorno de desarrollo/staging.\x1b[0m'
  );
  console.error('  URL detectada: ' + supabaseUrl);
  console.error(
    '  Si REALMENTE querés ejecutar el seed contra este proyecto, seteá SEED_ENV=prod explícitamente.\n'
  );
  process.exit(1);
}

// --- RESET DE CONTRASEÑAS ---
// Por defecto NO se resetean contraseñas de usuarios existentes. Para forzar
// el reset (solo entornos de dev), usar SEED_RESET_PASSWORDS=true.
const SEED_RESET_PASSWORDS = process.env.SEED_RESET_PASSWORDS === 'true';


console.log('\x1b[32m✔ Variables de entorno cargadas con éxito.\x1b[0m');
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
console.log('\x1b[32m✔ Cliente administrativo de Supabase inicializado.\x1b[0m');

// --- DATOS DEL SEED ---

const organizations = [
  {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Empresa Demo',
    business_type: 'restaurant',
    status: 'active',
    plan_type: 'pro',
    max_locations: 2,
    created_at: '2026-06-30T00:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-00000000a001',
    name: 'Restaurante Demo Norte',
    business_type: 'restaurant',
    status: 'active',
    plan_type: 'pro',
    max_locations: 5,
    created_at: '2026-05-15T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-00000000a002',
    name: 'Farmacia Vital',
    business_type: 'pharmacy',
    status: 'active',
    plan_type: 'enterprise',
    max_locations: 20,
    created_at: '2026-04-02T08:30:00Z'
  },
  {
    id: '00000000-0000-0000-0000-00000000a003',
    name: 'Carnicería Don Pedro',
    business_type: 'butcher_shop',
    status: 'paused',
    plan_type: 'basic',
    max_locations: 1,
    created_at: '2026-06-20T14:15:00Z'
  }
];

const usersToCreate = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'dev@tempmonitor.local',
    fullName: 'Dev User',
    orgId: '00000000-0000-0000-0000-000000000010',
    role: 'owner',
    isPlatformAdmin: false
  },
  {
    id: '00000000-0000-0000-0000-00000000c001',
    email: 'owner@restonorte.cl',
    fullName: 'Juan Pérez',
    orgId: '00000000-0000-0000-0000-00000000a001',
    role: 'owner',
    isPlatformAdmin: false
  },
  {
    id: '00000000-0000-0000-0000-00000000c002',
    email: 'admin@restonorte.cl',
    fullName: 'María González',
    orgId: '00000000-0000-0000-0000-00000000a001',
    role: 'admin',
    isPlatformAdmin: false
  },
  {
    id: '00000000-0000-0000-0000-00000000c003',
    email: 'owner@farmavital.cl',
    fullName: 'Carlos Soto',
    orgId: '00000000-0000-0000-0000-00000000a002',
    role: 'owner',
    isPlatformAdmin: false
  },
  {
    id: '00000000-0000-0000-0000-00000000c004',
    email: 'admin@farmavital.cl',
    fullName: 'Ana Ramírez',
    orgId: '00000000-0000-0000-0000-00000000a002',
    role: 'admin',
    isPlatformAdmin: false
  },
  {
    id: '00000000-0000-0000-0000-00000000c005',
    email: 'manager@farmavital.cl',
    fullName: 'Luis Vega',
    orgId: '00000000-0000-0000-0000-00000000a002',
    role: 'manager',
    isPlatformAdmin: false
  },
  {
    id: '00000000-0000-0000-0000-00000000c006',
    email: 'owner@donpedro.cl',
    fullName: 'Pedro Muñoz',
    orgId: '00000000-0000-0000-0000-00000000a003',
    role: 'owner',
    isPlatformAdmin: false
  },
  {
    id: '00000000-0000-0000-0000-00000000d001',
    email: 'admin@tempmonitor.dev',
    fullName: 'Admin Global',
    orgId: null,
    role: 'staff',
    isPlatformAdmin: true
  }
];

const locations = [
  // Empresa Demo
  { id: '00000000-0000-0000-0000-000000000101', organization_id: '00000000-0000-0000-0000-000000000010', name: 'Casa Central', address: 'Av. Demo 123, Santiago' },
  { id: '00000000-0000-0000-0000-000000000102', organization_id: '00000000-0000-0000-0000-000000000010', name: 'Sucursal Norte', address: 'Av. Norte 456, Santiago' },
  // Restaurante Demo Norte
  { id: '00000000-0000-0000-0000-00000000b001', organization_id: '00000000-0000-0000-0000-00000000a001', name: 'Casa Central', address: 'Av. Norte 123' },
  { id: '00000000-0000-0000-0000-00000000b002', organization_id: '00000000-0000-0000-0000-00000000a001', name: 'Sucursal Providencia', address: 'Av. Pte. 456' },
  // Farmacia Vital
  { id: '00000000-0000-0000-0000-00000000b003', organization_id: '00000000-0000-0000-0000-00000000a002', name: 'Sede Las Condes', address: 'Av. Apoquindo 789' },
  { id: '00000000-0000-0000-0000-00000000b004', organization_id: '00000000-0000-0000-0000-00000000a002', name: 'Sede Maipú', address: 'Av. Pajaritos 234' },
  { id: '00000000-0000-0000-0000-00000000b005', organization_id: '00000000-0000-0000-0000-00000000a002', name: 'Sede Viña', address: 'Av. Libertad 567' },
  // Carnicería Don Pedro
  { id: '00000000-0000-0000-0000-00000000b006', organization_id: '00000000-0000-0000-0000-00000000a003', name: 'Local Centro', address: 'Calle Central 89' }
];

const locationAssignments = [
  // Empresa Demo
  { user_id: '00000000-0000-0000-0000-000000000001', location_id: '00000000-0000-0000-0000-000000000101', role: 'manager' },
  { user_id: '00000000-0000-0000-0000-000000000001', location_id: '00000000-0000-0000-0000-000000000102', role: 'manager' },
  // Restaurante Demo Norte
  { user_id: '00000000-0000-0000-0000-00000000c001', location_id: '00000000-0000-0000-0000-00000000b001', role: 'manager' },
  { user_id: '00000000-0000-0000-0000-00000000c001', location_id: '00000000-0000-0000-0000-00000000b002', role: 'manager' },
  { user_id: '00000000-0000-0000-0000-00000000c002', location_id: '00000000-0000-0000-0000-00000000b001', role: 'staff' },
  // Farmacia Vital
  { user_id: '00000000-0000-0000-0000-00000000c003', location_id: '00000000-0000-0000-0000-00000000b003', role: 'manager' },
  { user_id: '00000000-0000-0000-0000-00000000c003', location_id: '00000000-0000-0000-0000-00000000b004', role: 'manager' },
  { user_id: '00000000-0000-0000-0000-00000000c004', location_id: '00000000-0000-0000-0000-00000000b003', role: 'manager' },
  { user_id: '00000000-0000-0000-0000-00000000c005', location_id: '00000000-0000-0000-0000-00000000b003', role: 'staff' },
  // Carnicería Don Pedro
  { user_id: '00000000-0000-0000-0000-00000000c006', location_id: '00000000-0000-0000-0000-00000000b006', role: 'manager' }
];

const staff = [
  // Empresa Demo
  { id: '00000000-0000-0000-0000-000000000201', location_id: '00000000-0000-0000-0000-000000000101', name: 'María López', role: 'Cocinera', active: true },
  { id: '00000000-0000-0000-0000-000000000202', location_id: '00000000-0000-0000-0000-000000000101', name: 'Pedro Ramírez', role: 'Auxiliar de cocina', active: true },
  { id: '00000000-0000-0000-0000-000000000203', location_id: '00000000-0000-0000-0000-000000000102', name: 'Ana Torres', role: 'Cocinera', active: true },
  { id: '00000000-0000-0000-0000-000000000204', location_id: '00000000-0000-0000-0000-000000000102', name: 'Luis Vega', role: 'Auxiliar de cocina', active: true },
  // Restaurante Demo Norte
  { id: '00000000-0000-0000-0000-00000000e101', location_id: '00000000-0000-0000-0000-00000000b001', name: 'Jorge Valdivia', role: 'Cocinero', active: true },
  { id: '00000000-0000-0000-0000-00000000e102', location_id: '00000000-0000-0000-0000-00000000b001', name: 'Alexis Sánchez', role: 'Ayudante de cocina', active: true },
  // Farmacia Vital
  { id: '00000000-0000-0000-0000-00000000e201', location_id: '00000000-0000-0000-0000-00000000b003', name: 'Claudio Bravo', role: 'Químico Farmacéutico', active: true }
];

const equipment = [
  // Empresa Demo
  { id: '00000000-0000-0000-0000-000000000301', location_id: '00000000-0000-0000-0000-000000000101', name: 'Refrigerador Lácteos', physical_location: 'Cocina - pared norte', code: 'EQ-CC-001', min_temp: 0.0, max_temp: 6.0 },
  { id: '00000000-0000-0000-0000-000000000302', location_id: '00000000-0000-0000-0000-000000000101', name: 'Congelador Carnes', physical_location: 'Bodega', code: 'EQ-CC-002', min_temp: -22.0, max_temp: -15.0 },
  { id: '00000000-0000-0000-0000-000000000303', location_id: '00000000-0000-0000-0000-000000000101', name: 'Vitrina Refrigerada', physical_location: 'Mostrador', code: 'EQ-CC-003', min_temp: 2.0, max_temp: 8.0 },
  { id: '00000000-0000-0000-0000-000000000304', location_id: '00000000-0000-0000-0000-000000000102', name: 'Refrigerador Bebidas', physical_location: 'Sala ventas', code: 'EQ-SN-001', min_temp: 0.0, max_temp: 8.0 },
  { id: '00000000-0000-0000-0000-000000000305', location_id: '00000000-0000-0000-0000-000000000102', name: 'Congelador Helados', physical_location: 'Bodega trasera', code: 'EQ-SN-002', min_temp: -20.0, max_temp: -12.0 },
  // Restaurante Demo Norte
  { id: '00000000-0000-0000-0000-00000000d101', location_id: '00000000-0000-0000-0000-00000000b001', name: 'Cámara de Frío', physical_location: 'Cocina principal', code: 'EQ-RDN-001', min_temp: 0.0, max_temp: 4.0 },
  { id: '00000000-0000-0000-0000-00000000d102', location_id: '00000000-0000-0000-0000-00000000b001', name: 'Freezer Postres', physical_location: 'Área repostería', code: 'EQ-RDN-002', min_temp: -18.0, max_temp: -12.0 },
  { id: '00000000-0000-0000-0000-00000000d103', location_id: '00000000-0000-0000-0000-00000000b002', name: 'Conservadora Helados', physical_location: 'Bodega Sucursal', code: 'EQ-RDN-003', min_temp: -18.0, max_temp: -10.0 },
  // Farmacia Vital
  { id: '00000000-0000-0000-0000-00000000d201', location_id: '00000000-0000-0000-0000-00000000b003', name: 'Refrigerador Vacunas A', physical_location: 'Sector Inmunizaciones', code: 'EQ-FV-001', min_temp: 2.0, max_temp: 8.0 },
  { id: '00000000-0000-0000-0000-00000000d202', location_id: '00000000-0000-0000-0000-00000000b003', name: 'Refrigerador Vacunas B', physical_location: 'Sector Inmunizaciones', code: 'EQ-FV-002', min_temp: 2.0, max_temp: 8.0 },
  { id: '00000000-0000-0000-0000-00000000d203', location_id: '00000000-0000-0000-0000-00000000b004', name: 'Refrigerador Medicamentos', physical_location: 'Mesón despacho', code: 'EQ-FV-003', min_temp: 2.0, max_temp: 8.0 },
  // Carnicería Don Pedro
  { id: '00000000-0000-0000-0000-00000000d301', location_id: '00000000-0000-0000-0000-00000000b006', name: 'Cámara Carnes Vacuno', physical_location: 'Sector desposte', code: 'EQ-CDP-001', min_temp: -2.0, max_temp: 2.0 }
];

// --- GENERADOR DE SEMANA DE DATOS DEMO (determinista) ---
// Reemplaza las lecturas/incidentes estáticos por una semana completa por
// equipo. RNG sembrado (mulberry32) para que re-ejecutar el seed produzca
// exactamente los mismos valores e ids (upsert = reemplazo idéntico).

// RNG determinista: mulberry32 (dominio público, sin dependencias).
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Gaussiana aproximada (Box-Muller) para temperaturas alrededor del rango.
function gaussian(rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Fecha ISO con hora local; determinista (basada en día y slot).
function readingDate(dayOffset, slotIndex) {
  // Slot cada 2h desde las 06:00 (12 slots: 06,08,...,04 del día siguiente).
  const hour = 6 + slotIndex * 2;
  const d = new Date(Date.UTC(2026, 6, 24 + dayOffset, hour, 0, 0));
  return d.toISOString();
}

// IDs de las 18 lecturas originales del seed v1 (preservadas como "espejo"
// de la semana para no dejar datos huérfanos y conservar los incidentes
// originales con sus reading_id). Mapeadas por equipo → slots del día 0.
const LEGACY_READING_IDS = {
  '00000000-0000-0000-0000-000000000301': [
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000408'
  ],
  '00000000-0000-0000-0000-000000000302': ['00000000-0000-0000-0000-000000000403'],
  '00000000-0000-0000-0000-000000000303': ['00000000-0000-0000-0000-000000000404'],
  '00000000-0000-0000-0000-000000000304': [
    '00000000-0000-0000-0000-000000000405',
    '00000000-0000-0000-0000-000000000406'
  ],
  '00000000-0000-0000-0000-000000000305': ['00000000-0000-0000-0000-000000000407'],
  '00000000-0000-0000-0000-00000000d101': [
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000502'
  ],
  '00000000-0000-0000-0000-00000000d102': ['00000000-0000-0000-0000-000000000503'],
  '00000000-0000-0000-0000-00000000d201': [
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000602'
  ],
  '00000000-0000-0000-0000-00000000d203': ['00000000-0000-0000-0000-000000000603'],
  '00000000-0000-0000-0000-00000000d301': [
    '00000000-0000-0000-0000-000000000701',
    '00000000-0000-0000-0000-000000000702'
  ]
};

// ID determinista de lectura: usa el legacy id si el equipo lo tiene para el
// slot (día 0, slots 0..n), si no genera `7d...` (suffix 8 + slot 2 chars).
function readingId(equipmentId, dayOffset, slotIndex) {
  if (dayOffset === 0) {
    const legacy = LEGACY_READING_IDS[equipmentId];
    if (legacy && slotIndex < legacy.length) return legacy[slotIndex];
  }
  const suffix = equipmentId.replace(/-/g, '').slice(-8);
  // Índice global del slot en la semana (0..83): siempre 2 dígitos.
  const n = dayOffset * READINGS_PER_DAY + slotIndex;
  return `00000000-0000-0000-0000-7d${suffix}${String(n).padStart(2, '0')}`;
}

const READINGS_PER_DAY = 12; // cada 2h: 06:00 → 04:00
const DEMO_DAYS = 7; // semana cerrada 2026-07-24 → 2026-07-30

// Profiles/org → id real del profile (mapeo email → id real del auth user).
const profileByOrgId = (orgId) =>
  usersToCreate
    .filter((u) => u.orgId === orgId)
    .map((u) => ({ id: u.id, email: u.email }));

// Staff de una sede (los mocks usan ids fijos que coinciden con staff).
const staffByLocationId = (locationId) =>
  staff.filter((s) => s.location_id === locationId);

// Equipos IoT de la farmacia (para probar filtro reading_type='iot').
const IOT_EQUIPMENT_IDS = new Set([
  '00000000-0000-0000-0000-00000000d201',
  '00000000-0000-0000-0000-00000000d203'
]);

// Acciones correctivas realistas (≥20 chars, patrón HACCP).
const ACTION_TEMPLATES = [
  'Se reubicó mercadería al equipo de respaldo y se ajustó el termostato.',
  'Se detectó puerta mal cerrada; se corrigió y se monitoreó la recuperación.',
  'Se llamó a servicio técnico y se trasladó el producto a cámara alterna.',
  'Se descongeló el equipo, se limpiaron las rejillas y se normalizó el ciclo.',
  'Se calibró el sensor y se verificó la temperatura durante 30 minutos.',
  'Se aisló el lote afectado para inspección y se ajustó el setpoint.'
];

function generateReadings() {
  const list = [];
  const rng = mulberry32(20260724);

  for (const eq of equipment) {
    const orgId = locations.find((l) => l.id === eq.location_id)?.organization_id;
    const orgProfiles = profileByOrgId(orgId);
    const eqStaff = staffByLocationId(eq.location_id);
    const isIot = IOT_EQUIPMENT_IDS.has(eq.id);
    const midpoint = (Number(eq.min_temp) + Number(eq.max_temp)) / 2;
    const halfSpan = (Number(eq.max_temp) - Number(eq.min_temp)) / 2;
    // Desvíos por equipo: 1-3 lecturas fuera de rango en la semana.
    const outOfRangeCount = 1 + Math.floor(rng() * 3); // 1..3
    const outOfRangeSlots = new Set();
    while (outOfRangeSlots.size < outOfRangeCount) {
      outOfRangeSlots.add(Math.floor(rng() * (DEMO_DAYS * READINGS_PER_DAY)));
    }

    for (let day = 0; day < DEMO_DAYS; day++) {
      for (let slot = 0; slot < READINGS_PER_DAY; slot++) {
        const slotIndex = day * READINGS_PER_DAY + slot;
        let value;

        if (outOfRangeSlots.has(slotIndex)) {
          // Desvío realista: alto (70%) o bajo (30%), 1.2x-2x el rango.
          const isHigh = rng() < 0.7;
          value = isHigh
            ? Number(eq.max_temp) + (0.5 + rng() * halfSpan * 0.6)
            : Number(eq.min_temp) - (0.5 + rng() * halfSpan * 0.6);
        } else {
          // Normal: gaussiana alrededor del punto medio, truncada al rango.
          let v = midpoint + gaussian(rng) * 1.2;
          v = Math.max(Number(eq.min_temp), Math.min(Number(eq.max_temp), v));
          value = v;
        }

        // Redondear a 1 decimal (consistente con DECIMAL del schema).
        value = Math.round(value * 10) / 10;

        const profile = orgProfiles[slot % Math.max(1, orgProfiles.length)];
        const staffMember = eqStaff[slot % Math.max(1, eqStaff.length)];

        list.push({
          id: readingId(eq.id, day, slot),
          equipment_id: eq.id,
          value,
          reading_type: isIot ? 'iot' : 'manual',
          snapshot_min_temp: eq.min_temp,
          snapshot_max_temp: eq.max_temp,
          recorded_by_profile: profile?.id ?? null,
          recorded_by_staff: staffMember?.id ?? null,
          taken_by: isIot ? null : (staffMember?.name ?? null),
          recorded_at: readingDate(day, slot)
        });
      }
    }
  }
  return list;
}

function generateIncidents(readings) {
  const list = [];
  const rng = mulberry32(20260731);

  // Límite de incidentes por organización (1-3 según el plan) y mantener
  // los 6 originales (sus reading_id legacy ya están en la semana).
  const orgIncidentBudget = new Map();
  const getBudget = (orgId) => {
    if (!orgIncidentBudget.has(orgId)) {
      // Determinista: 2-3 incidentes por org (farmacia puede tener 3).
      orgIncidentBudget.set(orgId, 2 + Math.floor(rng() * 2));
    }
    return orgIncidentBudget.get(orgId);
  };

  let n = 0;

  // Índice de lecturas fuera de rango ordenadas por fecha (recientes primero).
  const outOfRange = [];
  for (const r of readings) {
    const eq = equipment.find((e) => e.id === r.equipment_id);
    if (!eq) continue;
    if (r.value > Number(eq.max_temp) || r.value < Number(eq.min_temp)) {
      outOfRange.push({ r, eq });
    }
  }
  outOfRange.sort((a, b) => new Date(b.r.recorded_at) - new Date(a.r.recorded_at));

  for (const { r, eq } of outOfRange) {
    const orgId = locations.find((l) => l.id === eq.location_id)?.organization_id;
    if (orgId && getBudget(orgId) <= 0) continue; // presupuesto por org agotado

    const direction = r.value > Number(eq.max_temp) ? 'alta' : 'baja';
    // ID determinista: mismo equipo → mismo incidente (upsert estable).
    // Grupo 4to del UUID = 12 chars: `7d` + suffix(8) + n(2).
    const suffix = r.equipment_id.replace(/-/g, '').slice(-8);
    const id = `00000000-0000-0000-0000-7d${suffix}${String(n).padStart(2, '0')}`;
    n++;

    // Últimas 48h de la semana → abierto (aún sin resolver); antes → resuelto.
    const createdAt = new Date(r.recorded_at);
    const last48h = Date.UTC(2026, 6, 30, 6, 0, 0); // 2026-07-30T06:00Z
    const isOpen = createdAt.getTime() >= last48h;
    const eqName = eq.name;
    const template = ACTION_TEMPLATES[Math.floor(rng() * ACTION_TEMPLATES.length)];

    const incident = {
      id,
      reading_id: r.id,
      status: isOpen ? 'open' : 'resolved',
      description: `Temperatura ${direction} detectada en ${eqName} (${r.value}°C)`,
      action_taken: isOpen ? null : template,
      resolved_by: null,
      resolved_at: null,
      created_at: r.recorded_at
    };

    if (!isOpen) {
      // Resolver 1-2h después, por el profile que registró la lectura.
      const resolvedAt = new Date(createdAt.getTime() + (60 + rng() * 60) * 60 * 1000);
      incident.resolved_by = r.recorded_by_profile;
      incident.resolved_at = resolvedAt.toISOString();
    }

    list.push(incident);

    if (orgId) {
      // Consumir presupuesto solo cuando se genera un incidente de esa org.
      orgIncidentBudget.set(orgId, getBudget(orgId) - 1);
    }
  }
  return list;
}

const readings = generateReadings();
const incidents = generateIncidents(readings);

async function seed() {
  console.log('\n\x1b[34m--- Iniciando Carga de Datos (Seed) ---\x1b[0m');

  try {
    // 1. Cargar Organizaciones
    console.log('\nCargando organizaciones...');
    for (const org of organizations) {
      const { error } = await supabase.from('organizations').upsert(org);
      if (error) throw new Error(`Error en org ${org.name}: ${error.message}`);
      console.log(`  ✔ Organización upserted: ${org.name}`);
    }

    // 2. Cargar Usuarios en Auth y obtener sus IDs reales
    console.log('\nCargando cuentas en Supabase Auth y perfiles públicos...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const emailToUserId = new Map();

    for (const u of usersToCreate) {
      const existing = users.find(x => x.email.toLowerCase() === u.email.toLowerCase());
      let actualId = null;

      if (existing) {
        console.log(`  Usuario ya registrado en auth: ${u.email}`);
        actualId = existing.id;
        
        // Actualizar metadatos para asegurar consistencia
        const updateParams = { user_metadata: { full_name: u.fullName } };
        if (SEED_RESET_PASSWORDS) {
          updateParams.password = 'Password123!';
        }

        const { error: updateError } = await supabase.auth.admin.updateUserById(actualId, updateParams);
        if (updateError) {
          console.warn(`  ⚠️ No se pudo actualizar ${u.email}: ${updateError.message}`);
        } else {
          const resetNote = SEED_RESET_PASSWORDS ? ' (contraseña reseteada)' : '';
          console.log(`  ✔ Metadatos actualizados para ${u.email}${resetNote}`);
        }
      } else {
        // Crear usuario nuevo forzando ID si es posible o autogenerado
        const createParams = {
          email: u.email,
          password: 'Password123!',
          email_confirm: true,
          user_metadata: { full_name: u.fullName }
        };
        
        if (u.id) {
          createParams.id = u.id;
        }

        const { data: { user }, error: createError } = await supabase.auth.admin.createUser(createParams);
        if (createError) throw new Error(`Error creando auth user ${u.email}: ${createError.message}`);
        actualId = user.id;
        console.log(`  ✔ Usuario creado en auth: ${u.email} (ID: ${actualId})`);
      }

      emailToUserId.set(u.email, actualId);

      // Cargar en profiles públicos
      const profileData = {
        id: actualId,
        email: u.email,
        full_name: u.fullName,
        organization_id: u.orgId,
        role: u.role,
        is_platform_admin: u.isPlatformAdmin
      };

      const { error: profileError } = await supabase.from('profiles').upsert(profileData);
      if (profileError) throw new Error(`Error en profile ${u.email}: ${profileError.message}`);
      console.log(`    ✔ Perfil público cargado para: ${u.fullName}`);
    }

    // 3. Cargar Sedes (Locations)
    // IMPORTANTE: el trigger `check_location_limit` se dispara en INSERT y
    // bloquea el upsert de una sede existente cuando la org ya está en el
    // límite (el BEFORE INSERT corre antes de resolver el conflicto). Para
    // re-ejecutar el seed de forma idempotente sin tocar BD, las sedes
    // existentes se actualizan con UPDATE (que no dispara el trigger) y solo
    // las nuevas usan INSERT.
    console.log('\nCargando sedes (locations)...');
    for (const loc of locations) {
      const { data: existing } = await supabase
        .from('locations')
        .select('id')
        .eq('id', loc.id)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase.from('locations').update(loc).eq('id', loc.id);
      } else {
        result = await supabase.from('locations').insert(loc);
      }

      const { error } = result;
      if (error) throw new Error(`Error en sede ${loc.name}: ${error.message}`);
      console.log(`  ✔ Sede cargada: ${loc.name}`);
    }

    // 4. Asignaciones de Sedes
    console.log('\nAsignando personal a sedes...');
    for (const la of locationAssignments) {
      // Reemplazar id de usuario con el id real obtenido
      const userEmail = usersToCreate.find(u => u.id === la.user_id)?.email;
      const actualId = emailToUserId.get(userEmail);
      if (!actualId) continue;

      const assignment = {
        user_id: actualId,
        location_id: la.location_id,
        role: la.role
      };

      // Upsert basado en la restricción UNIQUE(user_id, location_id)
      const { error } = await supabase.from('location_assignments').upsert(assignment, {
        onConflict: 'user_id,location_id'
      });
      if (error) throw new Error(`Error asignación user ${userEmail} a sede ${la.location_id}: ${error.message}`);
      console.log(`  ✔ Asignado ${userEmail} a sede ${la.location_id}`);
    }

    // 5. Cargar Colaboradores Operativos (Staff)
    console.log('\nCargando colaboradores (staff)...');
    for (const st of staff) {
      const { error } = await supabase.from('staff').upsert(st);
      if (error) throw new Error(`Error en staff ${st.name}: ${error.message}`);
      console.log(`  ✔ Colaborador cargado: ${st.name}`);
    }

    // 6. Cargar Equipos (Equipment)
    console.log('\nCargando equipos frigoríficos...');
    for (const eq of equipment) {
      const { error } = await supabase.from('equipment').upsert(eq);
      if (error) throw new Error(`Error en equipo ${eq.name}: ${error.message}`);
      console.log(`  ✔ Equipo cargado: ${eq.name}`);
    }

    // 7. Cargar Lecturas de Temperatura
    console.log('\nCargando historial de lecturas de temperatura...');
    let readingsCount = 0;
    for (const rd of readings) {
      // Mapear el ID real del perfil que registró la lectura
      const profile = usersToCreate.find(u => u.id === rd.recorded_by_profile);
      const actualProfileId = profile ? emailToUserId.get(profile.email) : null;

      const readingData = {
        id: rd.id,
        equipment_id: rd.equipment_id,
        value: rd.value,
        reading_type: rd.reading_type,
        snapshot_min_temp: rd.snapshot_min_temp,
        snapshot_max_temp: rd.snapshot_max_temp,
        recorded_by_profile: actualProfileId,
        recorded_by_staff: rd.recorded_by_staff,
        taken_by: rd.taken_by || null,
        recorded_at: rd.recorded_at
      };

      const { error } = await supabase.from('temperature_readings').upsert(readingData);
      if (error) throw new Error(`Error en lectura ${rd.id}: ${error.message}`);
      readingsCount++;
    }
    console.log(`  ✔ ${readingsCount} lecturas cargadas (${readings.length} generadas)`);

    // 8. Cargar Incidentes
    console.log('\nCargando incidentes y justificaciones HACCP...');
    let incidentsCount = 0;
    let openCount = 0;
    for (const inc of incidents) {
      const profile = usersToCreate.find(u => u.id === inc.resolved_by);
      const actualResolvedById = profile ? emailToUserId.get(profile.email) : null;

      const incidentData = {
        id: inc.id,
        reading_id: inc.reading_id,
        status: inc.status,
        description: inc.description,
        action_taken: inc.action_taken,
        resolved_by: actualResolvedById,
        resolved_at: inc.resolved_at,
        created_at: inc.created_at
      };

      const { error } = await supabase.from('incidents').upsert(incidentData);
      if (error) throw new Error(`Error en incidente ${inc.id}: ${error.message}`);
      incidentsCount++;
      if (inc.status === 'open') openCount++;
    }
    console.log(
      `  ✔ ${incidentsCount} incidentes cargados (${openCount} abiertos, ${incidentsCount - openCount} resueltos)`
    );

    console.log('\n\x1b[32m✔ ✔ ¡BASE DE DATOS POPULADA Y SEED COMPLETADO EXITOSAMENTE! ✔ ✔\x1b[0m\n');
    console.log('Cuentas de prueba (contraseña de usuarios nuevos: \x1b[36mPassword123!\x1b[0m):');
    console.log('  - Dev User:                \x1b[33mdev@tempmonitor.local\x1b[0m');
    console.log('  - Dueño Resto Demo:        \x1b[33mowner@restonorte.cl\x1b[0m');
    console.log('  - Admin Resto Demo:        \x1b[33madmin@restonorte.cl\x1b[0m');
    console.log('  - Dueño Farmacia:          \x1b[33mowner@farmavital.cl\x1b[0m');
    console.log('  - Admin Farmacia:          \x1b[33madmin@farmavital.cl\x1b[0m');
    console.log('  - Manager Farmacia:        \x1b[33mmanager@farmavital.cl\x1b[0m');
    console.log('  - Dueño Carnicería:        \x1b[33mowner@donpedro.cl\x1b[0m');
    console.log('  - Admin Global (Platform): \x1b[33madmin@tempmonitor.dev\x1b[0m\n');
    if (SEED_RESET_PASSWORDS) {
      console.log('\x1b[33m⚠️ SEED_RESET_PASSWORDS=true: se resetearon contraseñas de usuarios existentes a Password123!\x1b[0m\n');
    }

  } catch (err) {
    console.error('\n\x1b[31m✖ ERROR CRÍTICO EJECUTANDO EL SEED:\x1b[0m');
    console.error(err.message);
    process.exit(1);
  }
}

seed();
