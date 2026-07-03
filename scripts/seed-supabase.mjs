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
console.log(`URL de Supabase: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\x1b[32m✔ Cliente administrativo de Supabase inicializado.\x1b[0m');
console.log('Listo para continuar con la lógica de población de datos.');
