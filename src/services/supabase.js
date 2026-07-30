// src/services/supabase.js
// Supabase Client Config

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local or GitHub Secrets.'
  )
}

// WICHTIG: flowType 'implicit' (nicht 'pkce'). Einladungs-Links, die über das
// Supabase-Dashboard (Authentication -> Users -> Invite/Add user) verschickt
// werden, kommen immer im Format "#access_token=...&refresh_token=..." zurück.
// Mit flowType 'pkce' erwartet der Client stattdessen "?code=..." und
// ignoriert den Hash komplett - dadurch blieb man auf der Login-Seite hängen,
// obwohl der Link einen gültigen Token enthielt.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'implicit',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})