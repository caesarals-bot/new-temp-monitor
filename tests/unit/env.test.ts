import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

describe('env validation', () => {
  const envSchema = z.object({
    VITE_SUPABASE_URL: z.string().url('URL de Supabase inválida'),
    VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Anon key es requerida'),
  });

  beforeEach(() => {
    vi.resetModules();
  });

  it('throws error when URL is missing', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: 'valid-key',
    });
    expect(result.success).toBe(false);
  });

  it('throws error when anon key is missing', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: '',
    });
    expect(result.success).toBe(false);
  });

  it('throws error when URL is invalid', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'not-a-url',
      VITE_SUPABASE_ANON_KEY: 'valid-key',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('URL de Supabase inválida');
    }
  });

  it('passes with valid env values', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'valid-anon-key',
    });
    expect(result.success).toBe(true);
  });
});
