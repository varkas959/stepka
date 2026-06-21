import { checkOrigin, checkRateLimit, sanitize, redactPII, detectInjection } from './_security.js';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error: 'Server not configured.' });

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Sign in required.' });
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid session.' });

  const q = req.body || {};
  const rawBody = sanitize(q.body, 4000);
  if (rawBody.length < 30) return res.status(400).json({ error: 'Question body too short.' });

  // Reject instruction-like content; redact PII server-side (unbypassable)
  if (detectInjection(rawBody).suspected) return res.status(422).json({ error: 'Question contains instruction-like text. Please rephrase.' });
  const body = redactPII(rawBody).clean;

  const row = {
    id: sanitize(q.id, 60) || `user-${Date.now()}`,
    company: sanitize(q.company, 60),
    role: sanitize(q.role, 80),
    topic: sanitize(q.topic, 60),
    topic_path: sanitize(q.topicPath, 120),
    difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
    round: sanitize(q.round, 60),
    body,
    tech: Array.isArray(q.tech) ? q.tech.map(t => sanitize(t, 40)).slice(0, 10) : [],
    upvotes: 0, asked: 1, verify_count: 1, days_ago: 0,
    user_id: user.id,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await admin.from('questions').insert(row).select().single();
  if (error) { console.error('[submit-question] insert failed:', error.message); return res.status(500).json({ error: 'Could not save question.' }); }

  return res.status(200).json(data);
}
