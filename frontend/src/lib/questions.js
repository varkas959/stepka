// Supabase-backed user-submitted questions
import { supabase } from './supabaseClient';

export async function loadUserQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[questions] load failed:', error.message);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    company: row.company,
    role: row.role,
    topic: row.topic,
    topicPath: row.topic_path,
    difficulty: row.difficulty,
    round: row.round,
    body: row.body,
    tech: row.tech || [],
    upvotes: row.upvotes ?? 0,
    asked: row.asked ?? 1,
    verifyCount: row.verify_count ?? 1,
    daysAgo: row.created_at
      ? Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86400000)
      : (row.days_ago ?? 0),
    isUserSubmitted: true,
  }));
}

export async function saveUserQuestion(q, userId) {
  // Writes go through the server (service role) so PII redaction + moderation
  // cannot be bypassed by hitting Supabase directly.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { console.warn('[questions] no session — cannot save'); return null; }
  try {
    const resp = await fetch('/api/submit-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        id: q.id, company: q.company, role: q.role, topic: q.topic,
        topicPath: q.topicPath, difficulty: q.difficulty, round: q.round,
        body: q.body, tech: q.tech || [],
      }),
    });
    if (!resp.ok) { const e = await resp.json().catch(() => ({})); console.error('[questions] save failed:', e.error); return null; }
    return await resp.json();
  } catch (e) {
    console.error('[questions] save failed:', e.message);
    return null;
  }
}
