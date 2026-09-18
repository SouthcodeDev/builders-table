import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase handles exactly one thing: invite rows created live during the demo.
 * Returns null when env vars are absent — every caller must degrade to the
 * local fallback, never block.
 */
export function supabaseInvites(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}
