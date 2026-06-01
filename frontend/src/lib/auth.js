// Supabase auth shim. Wraps localStorage so we can swap to real Supabase later
// by replacing this file with @supabase/supabase-js calls.
//
// Real Supabase usage will look like:
//   import { createClient } from '@supabase/supabase-js';
//   const supabase = createClient(URL, ANON_KEY);
//   supabase.auth.signInWithOAuth({ provider: 'google' })
//
// For now, simulate session locally so the UI works end-to-end.

const STORAGE_KEY = 'asktaaza_session_v1';

const FAKE_USERS = {
  google: {
    id: 'usr_g_001',
    provider: 'google',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    avatarInitials: 'AM',
  },
  linkedin: {
    id: 'usr_l_001',
    provider: 'linkedin',
    name: 'Priya Sharma',
    email: 'priya.sharma@asktaaza.com',
    avatarInitials: 'PS',
  },
};

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function signInWithProvider(provider) {
  return new Promise((resolve) => {
    // simulate OAuth roundtrip latency
    setTimeout(() => {
      const user = FAKE_USERS[provider] || FAKE_USERS.google;
      const session = { user, signedInAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      resolve(session);
    }, 900);
  });
}

export function signOut() {
  localStorage.removeItem(STORAGE_KEY);
}
