import { createClient } from '@supabase/supabase-js';

// Only PUBLIC settings are read here (from the ".env" file, see .env.example).
// The "service_role" key must never be used in frontend code.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

let client = null;

export function getSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Copy .env.example to .env and fill it in.');
  }

  // Safety net: refuse to start if someone pasted a service_role key by mistake.
  // Supabase keys are JWTs; the middle part contains the role name.
  try {
    const payload = JSON.parse(atob(anonKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.role === 'service_role') {
      throw new Error('service_role key detected in frontend config. Remove it immediately.');
    }
  } catch (err) {
    if (err.message.includes('service_role')) throw err;
    // Non-JWT keys (newer "publishable" key format) are fine; nothing to check.
  }

  if (!client) client = createClient(url, anonKey);
  return client;
}
