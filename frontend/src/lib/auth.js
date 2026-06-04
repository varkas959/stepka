// Real Supabase auth. Replaces the prior local stub.
import { supabase } from './supabaseClient';

const SUPPORTED = new Set(['google', 'linkedin_oidc']);

// Map UI provider names to Supabase provider keys
const PROVIDER_MAP = {
  google: 'google',
  linkedin: 'linkedin_oidc',
  linkedin_oidc: 'linkedin_oidc',
};

export async function signInWithProvider(uiProvider) {
  const provider = PROVIDER_MAP[uiProvider];
  if (!SUPPORTED.has(provider)) {
    throw new Error(`Unsupported provider: ${uiProvider}`);
  }
  const redirectTo = `${window.location.origin}/auth/callback`;
  const options = { redirectTo };
  if (provider === 'linkedin_oidc') options.scopes = 'openid profile email';

  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options });
  if (error) throw error;
  return data;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('getSession error', error);
    return null;
  }
  if (!data.session) return null;
  const u = data.session.user;
  const fullName = u.user_metadata?.full_name || u.user_metadata?.name || u.email || 'User';
  const initials = (fullName.match(/\b\w/g) || ['U']).slice(0, 2).join('').toUpperCase();
  return {
    user: {
      id: u.id,
      provider: u.app_metadata?.provider || 'oauth',
      name: fullName,
      email: u.email,
      avatarInitials: initials,
      avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture,
    },
    accessToken: data.session.access_token,
    signedInAt: new Date().toISOString(),
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, _session) => {
    // Re-derive the simplified session shape
    getSession().then(callback);
  });
  return () => data.subscription?.unsubscribe();
}
