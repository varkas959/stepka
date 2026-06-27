// ─── Interview Intelligence Pipeline — client ────────────────────────────────
import { supabase } from './supabaseClient';

// Submit a raw interview experience (from any source) for AI extraction.
// Server creates the submission + versioned extraction + draft questions and
// returns the structured result. No moderation yet (Phase 1: prove extraction).
export async function extractInterview({ rawText, sourceType = 'text', sourceMeta = {} }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Sign in required');
  const resp = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ type: 'pipeline', rawText, sourceType, sourceMeta }),
  });
  if (!resp.ok) {
    const e = await resp.json().catch(() => ({}));
    throw new Error(e.error || 'Extraction failed');
  }
  return resp.json();
}
