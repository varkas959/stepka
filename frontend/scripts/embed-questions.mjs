// ─── Phase 2: backfill embeddings for published questions ────────────────────
// Embeds every published question that has no embedding yet, so the dedup
// nearest-neighbour search has a corpus to match against.
//
// Prerequisites: pipeline-embeddings.sql run; questions seeded.
// Usage (PowerShell):
//   $env:REACT_APP_SUPABASE_URL="https://xxx.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="service-role-key"
//   $env:OPENAI_API_KEY="sk-..."
//   node scripts/embed-questions.mjs

import { createClient } from '@supabase/supabase-js';

const URL = process.env.REACT_APP_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI = process.env.OPENAI_API_KEY;
if (!URL || !KEY || !OPENAI) { console.error('Missing REACT_APP_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / OPENAI_API_KEY'); process.exit(1); }

const admin = createClient(URL, KEY, { auth: { persistSession: false } });

async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: texts.map(t => String(t).slice(0, 8000)) }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.error?.message || 'embed failed');
  return j.data.sort((a, b) => a.index - b.index).map(d => `[${d.embedding.join(',')}]`);
}

const { data, error } = await admin
  .from('questions').select('id, body')
  .eq('status', 'published').is('embedding', null).limit(5000);
if (error) { console.error(error.message); process.exit(1); }
console.log(`to embed: ${data.length}`);

const BATCH = 96;
let done = 0;
for (let i = 0; i < data.length; i += BATCH) {
  const chunk = data.slice(i, i + BATCH);
  const vecs = await embedBatch(chunk.map(r => r.body));
  await Promise.all(chunk.map((r, j) => admin.from('questions').update({ embedding: vecs[j] }).eq('id', r.id)));
  done += chunk.length;
  console.log(`embedded ${done}/${data.length}`);
}
console.log(`✓ Embedded ${done} questions.`);
