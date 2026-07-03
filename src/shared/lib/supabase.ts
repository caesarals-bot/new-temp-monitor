import { createClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Cliente singleton de Supabase.
 *
 * Uso en servicios (no en componentes directamente):
 * ```
 * import { supabase } from '@/shared/lib/supabase';
 * ```
 *
 * Para regenerar tipos después de cambiar el schema:
 * 1. Ejecuta `supabase gen types typescript` en la raíz del proyecto
 * 2. Copia el output a `src/shared/types/supabase.ts`
 */
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
export type { PostgrestError };
