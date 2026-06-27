// ─── Canonical question store (Phase 0) ──────────────────────────────────────
// One read path for the whole app. Reads PUBLISHED questions from Supabase; until
// the seed migration has run (or if Supabase is unreachable) it falls back to the
// static seed bank, so the app never breaks during the cut-over.

import { supabase } from './supabaseClient';
import { QUESTIONS } from './mockData';

function mapRow(r) {
  return {
    id: r.id,
    company: r.company,
    role: r.role,
    topic: r.topic,
    topicPath: r.topic_path,
    difficulty: r.difficulty,
    round: r.round,
    body: r.body,
    tech: r.tech || [],
    upvotes: r.upvotes ?? 0,
    asked: r.asked ?? 1,
    verifyCount: r.verify_count ?? 1,
    experience: r.experience || undefined,
    source: r.source || undefined,
    answer: r.answer || undefined,
    evaluation_criteria: r.evaluation_criteria || undefined,
    daysAgo: r.created_at
      ? Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000)
      : (r.days_ago ?? 0),
    isUserSubmitted: !r.seeded,
  };
}

export async function loadAllQuestions() {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (error || !data || data.length === 0) return QUESTIONS;       // nothing in DB → static seed

    // Once the seed has been migrated (seeded rows exist), Supabase is the single
    // source of truth. Until then, merge any user-submitted rows over the static seed
    // so deploying this before running the migration never hides the bank.
    const migrated = data.some(r => r.seeded);
    if (migrated) return data.map(mapRow);

    const seedIds = new Set(QUESTIONS.map(q => q.id));
    const extra = data.map(mapRow).filter(r => !seedIds.has(r.id));
    return [...extra, ...QUESTIONS];
  } catch {
    return QUESTIONS;
  }
}
