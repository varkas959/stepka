const fs  = require('fs');
const path = require('path');
const vm  = require('vm');

// Extract the static seed (companies/topics/roles taxonomy + fallback questions).
const src = fs.readFileSync(path.join(__dirname, '../src/lib/mockData.js'), 'utf-8');
const code = src.replace(/export\s+const\s+/g, 'var ').replace(/export\s+default\s+/g, 'var _default_ = ');
const ctx = { exports: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);

// Phase 0: source questions from Supabase (canonical store) at build time once the
// seed has been migrated. Falls back to the static seed if creds are missing or the
// migration hasn't run — so the build never breaks.
async function fetchSupabaseQuestions() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await sb.from('questions').select('*').eq('status', 'published').limit(5000);
    if (error || !data || !data.length || !data.some(r => r.seeded)) return null; // not migrated yet
    return data.map(r => ({
      id: r.id, company: r.company, role: r.role, topic: r.topic, topicPath: r.topic_path,
      difficulty: r.difficulty, round: r.round, experience: r.experience || undefined,
      source: r.source || undefined, body: r.body, answer: r.answer || undefined,
      evaluation_criteria: r.evaluation_criteria || undefined,
      verifyCount: r.verify_count ?? 1, upvotes: r.upvotes ?? 0, asked: r.asked ?? 1,
      daysAgo: r.created_at ? Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000) : (r.days_ago ?? 0),
      tech: r.tech || [],
    }));
  } catch (e) {
    console.warn('[seo] Supabase fetch failed, using static seed:', e.message);
    return null;
  }
}

(async () => {
  const supaQ = await fetchSupabaseQuestions();
  const QUESTIONS = supaQ || ctx.QUESTIONS;
  if (!QUESTIONS) {
    console.error('[seo] Failed to obtain QUESTIONS — check mockData.js / Supabase');
    process.exit(1);
  }
  const out = {
    COMPANIES:  ctx.COMPANIES,
    QUESTIONS,
    TECH_STACK: ctx.TECH_STACK,
    TOPIC_TREE: ctx.TOPIC_TREE,
    ROLES:      ctx.ROLES,
  };
  fs.writeFileSync(path.join(__dirname, 'seo-data.json'), JSON.stringify(out, null, 2));
  console.log(`[seo] Exported ${QUESTIONS.length} questions to seo-data.json (source: ${supaQ ? 'Supabase' : 'static seed'})`);
})();
