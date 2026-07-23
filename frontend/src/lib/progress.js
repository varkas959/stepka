// Supabase-backed progress persistence.
// Schema lives in /app/memory/supabase_migration.sql (user must run once).
import { supabase } from './supabaseClient';

const DEFAULTS = {
  streak: 0,
  longestStreak: 0,
  streakFreezes: 1,
  level: 1,
  xp: 0,
  xpToNext: 500,
  dueToday: 0,
  goalToday: 10,
  reviewedToday: 0,
  activePlan: null,
  readiness: 0,
  lastReviewDate: null,
  javaLearn: { lastConceptId: null, completedConceptIds: [] },
};

const camelFromRow = (row) => ({
  streak: row.streak,
  longestStreak: row.longest_streak,
  streakFreezes: row.streak_freezes,
  level: row.level,
  xp: row.xp,
  xpToNext: row.xp_to_next,
  dueToday: row.due_today,
  goalToday: row.goal_today,
  reviewedToday: row.reviewed_today,
  activePlan: row.active_plan,
  readiness: row.readiness,
  lastReviewDate: row.last_review_date,
  javaLearn: row.java_learn || { lastConceptId: null, completedConceptIds: [] },
});

const rowFromCamel = (s, userId) => ({
  user_id: userId,
  streak: s.streak,
  longest_streak: s.longestStreak,
  streak_freezes: s.streakFreezes,
  level: s.level,
  xp: s.xp,
  xp_to_next: s.xpToNext,
  due_today: s.dueToday,
  goal_today: s.goalToday,
  reviewed_today: s.reviewedToday,
  active_plan: s.activePlan,
  readiness: s.readiness,
  last_review_date: s.lastReviewDate,
  java_learn: s.javaLearn,
  updated_at: new Date().toISOString(),
});

// Detect rows that were seeded with old fake defaults and reset them.
// Old fake values: level=12, xp=3240, streak=7, activePlan=amazon
function isFakeSeeded(p) {
  if (p.level >= 10 && p.xp >= 1000) return true;          // old default: level 12, xp 3240
  if (p.streak >= 5 && p.xp === 0) return true;             // fake streak with no real activity
  if (p.activePlan?.company === 'amazon' && p.xp <= 100) return true; // seeded plan with no real XP
  return false;
}

export async function loadProgress(userId) {
  if (!userId) return DEFAULTS;
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[progress] load failed:', error.message);
    return DEFAULTS;
  }
  if (!data) {
    const row = rowFromCamel(DEFAULTS, userId);
    const { error: insErr } = await supabase.from('user_progress').insert(row);
    if (insErr) console.error('[progress] seed failed:', insErr.message);
    return DEFAULTS;
  }
  const loaded = camelFromRow(data);
  if (isFakeSeeded(loaded)) {
    // Overwrite the bad row in Supabase so it never comes back
    const row = rowFromCamel(DEFAULTS, userId);
    supabase.from('user_progress').upsert(row, { onConflict: 'user_id' });
    return DEFAULTS;
  }
  return loaded;
}

export async function saveProgress(userId, state) {
  if (!userId) return;
  const row = rowFromCamel(state, userId);
  const { error } = await supabase.from('user_progress').upsert(row, { onConflict: 'user_id' });
  if (error) console.error('[progress] save failed:', error.message);
}

// SRS scheduler — simple intervals keyed by rating
const RATING_INTERVALS_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14 };

export async function recordReview(userId, cardId, rating) {
  if (!userId) return;
  const days = RATING_INTERVALS_DAYS[rating] ?? 1;
  const nextDue = new Date(Date.now() + days * 86400 * 1000).toISOString();
  const { error } = await supabase.from('srs_reviews').insert({
    user_id: userId,
    card_id: cardId,
    rating,
    next_due_at: nextDue,
  });
  if (error) console.error('[srs] insert failed:', error.message);
  return { nextDue };
}

export async function getDueCount(userId) {
  if (!userId) return null;
  // count reviews where next_due_at <= now
  const { count, error } = await supabase
    .from('srs_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_due_at', new Date().toISOString());
  if (error) {
    console.error('[srs] count failed:', error.message);
    return null;
  }
  return count;
}

export { DEFAULTS as PROGRESS_DEFAULTS };
