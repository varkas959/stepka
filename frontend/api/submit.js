import { checkOrigin, checkRateLimit, sanitize, redactPII, detectInjection } from './_security.js';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const redact  = t => redactPII(sanitize(t, 4000)).clean;

async function verifyToken(req, res) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) { res.status(401).json({ error: 'Sign in required.' }); return null; }
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) { res.status(401).json({ error: 'Invalid session.' }); return null; }
  return user;
}

async function handleExperience(req, res, user) {
  const { experience, newQuestions = [], linkRows = [] } = req.body || {};
  if (!experience?.company || !experience?.role) return res.status(400).json({ error: 'company and role required' });

  const rounds = (Array.isArray(experience.rounds) ? experience.rounds : []).slice(0, 12).map(r => ({
    type: sanitize(r.type, 60), name: sanitize(r.type, 60),
    difficulty: Math.max(1, Math.min(5, Math.round(Number(r.difficulty) || 3))),
    topics: (Array.isArray(r.topics) ? r.topics : []).slice(0, 15).map(t => redact(t)).filter(Boolean),
    questions: (Array.isArray(r.questions) ? r.questions : []).slice(0, 25).map(q => redact(q)).filter(Boolean),
    notes: redact(r.notes),
  }));

  const slug = `${slugify(experience.company)}-${slugify(experience.role)}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: exp, error } = await admin.from('interview_experiences').insert({
    slug, user_id: user.id,
    company: sanitize(experience.company, 100),
    role: sanitize(experience.role, 100),
    experience_years: sanitize(experience.experienceYears, 40) || null,
    interview_date: experience.interviewDate || null,
    outcome: ['Selected', 'Rejected', 'Waiting'].includes(experience.outcome) ? experience.outcome : null,
    num_rounds: rounds.length || 1, rounds,
    difficulty: experience.difficulty ? Math.max(1, Math.min(5, Math.round(Number(experience.difficulty)))) : null,
    notes: redact(experience.notes) || null,
    contributor_name: experience.showName ? sanitize(experience.contributorName, 80) || null : null,
    show_name: !!experience.showName,
  }).select('id, slug').single();

  if (error) { console.error('[submit/experience] insert failed:', error.message); return res.status(500).json({ error: 'Could not save experience.' }); }

  const newIds = new Set();
  const safeNewQuestions = newQuestions.slice(0, 50).map(q => {
    newIds.add(q.id);
    return {
      id: sanitize(q.id, 60), company: sanitize(q.company, 60), role: sanitize(q.role, 80),
      topic: sanitize(q.topic, 60) || 'domain', topic_path: sanitize(q.topic_path, 120),
      difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
      round: sanitize(q.round, 60) || 'Technical', body: redact(q.body), tech: [],
      upvotes: 0, asked: 1, verify_count: 1, days_ago: 0,
      user_id: user.id, created_at: new Date().toISOString(),
    };
  }).filter(q => q.body.length >= 10);

  if (safeNewQuestions.length) {
    const { error: qErr } = await admin.from('questions').insert(safeNewQuestions);
    if (qErr) console.warn('[submit/experience] new questions failed:', qErr.message);
  }

  const safeLinks = linkRows.slice(0, 100).map(r => ({
    experience_id: exp.id, body: redact(r.body),
    round: sanitize(r.round, 60) || null,
    linked_question_id: r.linked_question_id ? sanitize(r.linked_question_id, 60) : null,
    company: sanitize(r.company, 100), role: sanitize(r.role, 100),
  })).filter(r => r.body.length >= 10);

  if (safeLinks.length) {
    const { error: lErr } = await admin.from('experience_questions').insert(safeLinks);
    if (lErr) console.warn('[submit/experience] links failed:', lErr.message);
  }

  const createdCount = safeNewQuestions.length;
  const matchedCount = safeLinks.filter(r => r.linked_question_id && !newIds.has(r.linked_question_id)).length;
  return res.status(200).json({ slug: exp.slug, id: exp.id, createdCount, matchedCount, totalQuestions: safeLinks.length });
}

async function handleQuestion(req, res, user) {
  const q = req.body || {};
  const rawBody = sanitize(q.body, 4000);
  if (rawBody.length < 30) return res.status(400).json({ error: 'Question body too short.' });
  if (detectInjection(rawBody).suspected) return res.status(422).json({ error: 'Question contains instruction-like text. Please rephrase.' });
  const body = redactPII(rawBody).clean;

  const row = {
    id: sanitize(q.id, 60) || `user-${Date.now()}`,
    company: sanitize(q.company, 60), role: sanitize(q.role, 80),
    topic: sanitize(q.topic, 60), topic_path: sanitize(q.topicPath, 120),
    difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
    round: sanitize(q.round, 60), body,
    tech: Array.isArray(q.tech) ? q.tech.map(t => sanitize(t, 40)).slice(0, 10) : [],
    upvotes: 0, asked: 1, verify_count: 1, days_ago: 0,
    user_id: user.id, created_at: new Date().toISOString(),
  };

  const { data, error } = await admin.from('questions').insert(row).select().single();
  if (error) { console.error('[submit/question] insert failed:', error.message); return res.status(500).json({ error: 'Could not save question.' }); }
  return res.status(200).json(data);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error: 'Server not configured.' });

  const user = await verifyToken(req, res);
  if (!user) return;

  const { type } = req.body || {};
  if (type === 'experience') return handleExperience(req, res, user);
  if (type === 'question')   return handleQuestion(req, res, user);
  return res.status(400).json({ error: 'type must be experience or question' });
}
