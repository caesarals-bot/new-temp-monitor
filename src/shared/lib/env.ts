import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('URL de Supabase inválida'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Anon key es requerida'),
});

const _env = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

const result = envSchema.safeParse(_env);

if (!result.success) {
  const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
  throw new Error(`Error de validación de entorno: ${errors}`);
}

export const env = result.data;
