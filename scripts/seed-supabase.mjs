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

const readings = [
  // Empresa Demo
  { id: '00000000-0000-0000-0000-000000000401', equipment_id: '00000000-0000-0000-0000-000000000301', value: 3.5, recorded_by_profile: '00000000-0000-0000-0000-000000000001', recorded_by_staff: '00000000-0000-0000-0000-000000000201', recorded_at: '2026-07-01T08:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000402', equipment_id: '00000000-0000-0000-0000-000000000301', value: 8.2, recorded_by_profile: '00000000-0000-0000-0000-000000000001', recorded_by_staff: '00000000-0000-0000-0000-000000000202', recorded_at: '2026-06-30T16:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000403', equipment_id: '00000000-0000-0000-0000-000000000302', value: -18.0, recorded_by_profile: '00000000-0000-0000-0000-000000000001', recorded_by_staff: '00000000-0000-0000-0000-000000000201', recorded_at: '2026-07-01T08:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000404', equipment_id: '00000000-0000-0000-0000-000000000303', value: 1.5, recorded_by_profile: '00000000-0000-0000-0000-000000000001', taken_by: 'Inspector de turno', recorded_at: '2026-07-01T08:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000405', equipment_id: '00000000-0000-0000-0000-000000000304', value: 4.0, recorded_by_profile: '00000000-0000-0000-0000-000000000001', recorded_by_staff: '00000000-0000-0000-0000-000000000203', recorded_at: '2026-06-30T16:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000406', equipment_id: '00000000-0000-0000-0000-000000000304', value: 9.5, recorded_by_profile: '00000000-0000-0000-0000-000000000001', recorded_by_staff: '00000000-0000-0000-0000-000000000204', recorded_at: '2026-06-30T16:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000407', equipment_id: '00000000-0000-0000-0000-000000000305', value: -15.0, recorded_by_profile: '00000000-0000-0000-0000-000000000001', recorded_by_staff: '00000000-0000-0000-0000-000000000203', recorded_at: '2026-07-01T08:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000408', equipment_id: '00000000-0000-0000-0000-000000000303', value: 2.5, recorded_by_profile: '00000000-0000-0000-0000-000000000001', recorded_by_staff: '00000000-0000-0000-0000-000000000202', recorded_at: '2026-06-29T10:00:00Z' },
  
  // Restaurante Demo Norte
  { id: '00000000-0000-0000-0000-000000000501', equipment_id: '00000000-0000-0000-0000-00000000d101', value: 2.2, recorded_by_profile: '00000000-0000-0000-0000-00000000c001', recorded_by_staff: '00000000-0000-0000-0000-00000000e101', recorded_at: '2026-07-01T09:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000502', equipment_id: '00000000-0000-0000-0000-00000000d101', value: 6.8, recorded_by_profile: '00000000-0000-0000-0000-00000000c001', recorded_by_staff: '00000000-0000-0000-0000-00000000e102', recorded_at: '2026-06-30T10:30:00Z' },
  { id: '00000000-0000-0000-0000-000000000503', equipment_id: '00000000-0000-0000-0000-00000000d102', value: -14.2, recorded_by_profile: '00000000-0000-0000-0000-00000000c001', recorded_by_staff: '00000000-0000-0000-0000-00000000e101', recorded_at: '2026-07-01T09:00:00Z' },
  
  // Farmacia Vital
  { id: '00000000-0000-0000-0000-000000000601', equipment_id: '00000000-0000-0000-0000-00000000d201', value: 4.5, recorded_by_profile: '00000000-0000-0000-0000-00000000c003', recorded_by_staff: '00000000-0000-0000-0000-00000000e201', recorded_at: '2026-07-01T10:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000602', equipment_id: '00000000-0000-0000-0000-00000000d201', value: 1.2, recorded_by_profile: '00000000-0000-0000-0000-00000000c003', recorded_by_staff: '00000000-0000-0000-0000-00000000e201', recorded_at: '2026-06-30T14:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000603', equipment_id: '00000000-0000-0000-0000-00000000d203', value: 5.1, recorded_by_profile: '00000000-0000-0000-0000-00000000c003', recorded_by_staff: null, recorded_at: '2026-07-01T11:00:00Z' },
  
  // Carnicería Don Pedro
  { id: '00000000-0000-0000-0000-000000000701', equipment_id: '00000000-0000-0000-0000-00000000d301', value: -0.5, recorded_by_profile: '00000000-0000-0000-0000-00000000c006', recorded_by_staff: null, recorded_at: '2026-07-01T12:00:00Z' },
  { id: '00000000-0000-0000-0000-000000000702', equipment_id: '00000000-0000-0000-0000-00000000d301', value: 3.8, recorded_by_profile: '00000000-0000-0000-0000-00000000c006', recorded_at: '2026-06-30T09:00:00Z' }
];

const incidents = [
  // Empresa Demo
  {
    id: '00000000-0000-0000-0000-000000000801',
    reading_id: '00000000-0000-0000-0000-000000000402',
    status: 'open',
    description: 'Temperatura alta detectada en Refrigerador Lácteos (8.2°C)',
    action_taken: null,
    resolved_by: null,
    resolved_at: null,
    created_at: '2026-06-30T16:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000802',
    reading_id: '00000000-0000-0000-0000-000000000404',
    status: 'resolved',
    description: 'Temperatura baja detectada en Vitrina Refrigerada (1.5°C)',
    action_taken: 'Se reguló el flujo de aire y se ajustó el termostato manualmente.',
    resolved_by: '00000000-0000-0000-0000-000000000001',
    resolved_at: '2026-07-01T08:15:00Z',
    created_at: '2026-07-01T08:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000803',
    reading_id: '00000000-0000-0000-0000-000000000406',
    status: 'resolved',
    description: 'Temperatura alta detectada en Refrigerador Bebidas (9.5°C)',
    action_taken: 'Se detectó puerta mal cerrada. Se procedió a cerrar y ventilar.',
    resolved_by: '00000000-0000-0000-0000-000000000001',
    resolved_at: '2026-06-30T17:00:00Z',
    created_at: '2026-06-30T16:00:00Z'
  },
  // Restaurante Demo Norte
  {
    id: '00000000-0000-0000-0000-000000000804',
    reading_id: '00000000-0000-0000-0000-000000000502',
    status: 'open',
    description: 'Temperatura alta detectada en Cámara de Frío (6.8°C)',
    action_taken: null,
    resolved_by: null,
    resolved_at: null,
    created_at: '2026-06-30T10:30:00Z'
  },
  // Farmacia Vital
  {
    id: '00000000-0000-0000-0000-000000000805',
    reading_id: '00000000-0000-0000-0000-000000000602',
    status: 'resolved',
    description: 'Temperatura baja crítica detectada en Refrigerador Vacunas A (1.2°C)',
    action_taken: 'Se trasladaron vacunas a refrigerador de respaldo B y se llamó a servicio técnico.',
    resolved_by: '00000000-0000-0000-0000-00000000c003',
    resolved_at: '2026-06-30T15:00:00Z',
    created_at: '2026-06-30T14:00:00Z'
  },
  // Carnicería Don Pedro
  {
    id: '00000000-0000-0000-0000-000000000806',
    reading_id: '00000000-0000-0000-0000-000000000702',
    status: 'open',
    description: 'Temperatura alta detectada en Cámara Carnes Vacuno (3.8°C)',
    action_taken: null,
    resolved_by: null,
    resolved_at: null,
    created_at: '2026-06-30T09:00:00Z'
  }
];

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
        
        // Reset password & update metadata para asegurar consistencia
        const { error: updateError } = await supabase.auth.admin.updateUserById(actualId, {
          password: 'Password123!',
          user_metadata: { full_name: u.fullName }
        });
        if (updateError) {
          console.warn(`  ⚠️ No se pudo resetear contraseña para ${u.email}: ${updateError.message}`);
        } else {
          console.log(`  ✔ Contraseña y metadatos actualizados para ${u.email}`);
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
    console.log('\nCargando sedes (locations)...');
    for (const loc of locations) {
      const { error } = await supabase.from('locations').upsert(loc);
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
    for (const rd of readings) {
      // Mapear el ID real del perfil que registró la lectura
      const profile = usersToCreate.find(u => u.id === rd.recorded_by_profile);
      const actualProfileId = profile ? emailToUserId.get(profile.email) : null;

      const readingData = {
        id: rd.id,
        equipment_id: rd.equipment_id,
        value: rd.value,
        reading_type: 'manual',
        recorded_by_profile: actualProfileId,
        recorded_by_staff: rd.recorded_by_staff,
        taken_by: rd.taken_by || null,
        recorded_at: rd.recorded_at
      };

      const { error } = await supabase.from('temperature_readings').upsert(readingData);
      if (error) throw new Error(`Error en lectura ${rd.id}: ${error.message}`);
      console.log(`  ✔ Lectura cargada (${rd.value}°C) para equipo ${rd.equipment_id}`);
    }

    // 8. Cargar Incidentes
    console.log('\nCargando incidentes y justificaciones HACCP...');
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
      console.log(`  ✔ Incidente cargado: [${inc.status.toUpperCase()}] ${inc.description}`);
    }

    console.log('\n\x1b[32m✔ ✔ ¡BASE DE DATOS POPULADA Y SEED COMPLETADO EXITOSAMENTE! ✔ ✔\x1b[0m\n');
    console.log('Credenciales de prueba creadas (todas usan contraseña: \x1b[36mPassword123!\x1b[0m):');
    console.log('  - Dueño Resto Demo: \x1b[33mowner@restonorte.cl\x1b[0m');
    console.log('  - Admin Resto Demo: \x1b[33madmin@restonorte.cl\x1b[0m');
    console.log('  - Dueño Farmacia: \x1b[33mowner@farmavital.cl\x1b[0m');
    console.log('  - Admin Global (Platform): \x1b[33madmin@tempmonitor.dev\x1b[0m\n');

  } catch (err) {
    console.error('\n\x1b[31m✖ ERROR CRÍTICO EJECUTANDO EL SEED:\x1b[0m');
    console.error(err.message);
    process.exit(1);
  }
}

seed();
