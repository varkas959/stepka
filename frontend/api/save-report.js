import { checkOrigin, checkRateLimit, sanitize } from './_security.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function makeSlug() {
  return Math.random().toString(36).slice(2, 10);
}

function prepWeeksFromReadiness(r) {
  if (r >= 80) return 1;
  if (r >= 65) return 2;
  if (r >= 50) return 3;
  return 5;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const { company, role, readiness, heatmap, gaps, summary, userId } = req.body || {};

  if (!company || !role || typeof readiness !== 'number') {
    return res.status(400).json({ error: 'company, role, and readiness are required' });
  }

  const prepWeeks = prepWeeksFromReadiness(readiness);

  // Retry up to 5 times to avoid slug collisions
  for (let i = 0; i < 5; i++) {
    const slug = makeSlug();
    const { data, error } = await supabase
      .from('readiness_reports')
      .insert({
        slug,
        user_id: userId || null,
        company: sanitize(String(company), 100),
        role: sanitize(String(role), 100),
        readiness: Math.max(0, Math.min(100, Math.round(readiness))),
        heatmap: Array.isArray(heatmap) ? heatmap : [],
        gaps: gaps && typeof gaps === 'object' ? gaps : {},
        summary: summary ? sanitize(String(summary), 500) : null,
        prep_weeks: prepWeeks,
      })
      .select('id, slug')
      .single();

    if (!error) return res.status(200).json({ id: data.id, slug: data.slug });
    if (!error.message?.includes('duplicate') && !error.message?.includes('unique')) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(500).json({ error: 'Failed to generate unique slug' });
}
