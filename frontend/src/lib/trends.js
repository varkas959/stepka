// ─── Knowledge Intelligence — client read ────────────────────────────────────
import { supabase } from './supabaseClient';

// Latest trend signal per kind, computed by the nightly pg_cron job.
// Returns { trending_skill: [...], trending_tech: [...], hot_topic: [...],
//           most_asked: [...], company_activity: [...] } (or {} if none yet).
export async function loadTrends() {
  try {
    const { data, error } = await supabase
      .from('trend_signals')
      .select('kind, value, period, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return {};
    const out = {};
    for (const r of data) { if (!out[r.kind]) out[r.kind] = r.value || []; }
    return out;
  } catch {
    return {};
  }
}
