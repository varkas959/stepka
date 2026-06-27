// ─── Phase 0: seed the static question bank into Supabase ────────────────────
// One-time migration. Reads the build export (seo-data.json — the same 338
// questions the SEO pages use) and upserts them into the canonical `questions`
// table as published, seeded rows. Idempotent: re-running upserts by id.
//
// Prerequisites:
//   1. Run supabase/migrations.sql  (creates questions table)
//   2. Run supabase/pipeline.sql    (adds the pipeline columns)
//   3. npm run build  (so scripts/seo-data.json is fresh)
//
// Usage (PowerShell):
//   $env:REACT_APP_SUPABASE_URL="https://xxx.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="service-role-key"
//   node scripts/migrate-questions-to-supabase.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = process.env.REACT_APP_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error('Missing REACT_APP_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const { QUESTIONS } = JSON.parse(fs.readFileSync(path.join(__dirname, 'seo-data.json'), 'utf-8'));
const admin = createClient(URL, KEY, { auth: { persistSession: false } });

const rows = QUESTIONS.map(q => ({
  id: q.id,
  company: q.company,
  role: q.role,
  topic: q.topic,
  topic_path: q.topicPath,
  difficulty: q.difficulty,
  round: q.round,
  body: q.body,
  tech: q.tech || [],
  upvotes: q.upvotes ?? 0,
  asked: q.asked ?? 1,
  verify_count: q.verifyCount ?? 1,
  days_ago: q.daysAgo ?? 0,
  experience: q.experience ?? null,
  source: q.source ?? 'Community Report',
  answer: q.answer ?? null,
  evaluation_criteria: q.evaluation_criteria ?? null,
  status: 'published',
  seeded: true,
  // Derive a stable created_at from daysAgo so newest-first ordering matches the seed.
  created_at: new Date(Date.now() - (q.daysAgo ?? 0) * 86400000).toISOString(),
  published_at: new Date(Date.now() - (q.daysAgo ?? 0) * 86400000).toISOString(),
}));

const CHUNK = 200;
let done = 0;
for (let i = 0; i < rows.length; i += CHUNK) {
  const batch = rows.slice(i, i + CHUNK);
  const { error } = await admin.from('questions').upsert(batch, { onConflict: 'id' });
  if (error) { console.error('Upsert failed:', error.message); process.exit(1); }
  done += batch.length;
  console.log(`upserted ${done}/${rows.length}`);
}
console.log(`✓ Migrated ${rows.length} questions into Supabase (status=published, seeded=true).`);
