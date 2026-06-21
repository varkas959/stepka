// ─── Interview Experience system ───────────────────────────────────────────
// Collects real interview experiences and converts them into company/role
// intelligence. Client-side Supabase (RLS) to match the questions.js pattern.

import { supabase } from './supabaseClient';
import { QUESTIONS, COMPANIES } from './mockData';

export const OUTCOMES = ['Selected', 'Rejected', 'Waiting'];
export const EXP_YEARS = ['0-2 Years', '2-5 Years', '5-8 Years', '8-12 Years', '12+ Years'];
export const ROUND_TYPES_EXP = ['Online Assessment', 'Phone Screen', 'DSA', 'System Design', 'Technical', 'Behavioral', 'Hiring Manager', 'HR', 'Take-home', 'Other'];

const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const norm    = s => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length >= 4);
const STOP = new Set(['what','which','when','where','your','their','about','would','could','should','these','those','from','that','this','with','have','will','given','using','explain','design','implement','difference','between']);

// ── Auto-link a free-text reported question to an existing bank question ──────
// Returns the best matching question id, or null. Token-overlap (Jaccard) over
// significant words, requiring a meaningful overlap to avoid false links.
export function autoLinkQuestion(body, pool = QUESTIONS) {
  const tokens = new Set(norm(body).filter(t => !STOP.has(t)));
  if (tokens.size < 3) return null;
  let best = null, bestScore = 0;
  for (const q of pool) {
    const qTokens = new Set(norm(q.body).filter(t => !STOP.has(t)));
    if (qTokens.size === 0) continue;
    let shared = 0;
    tokens.forEach(t => { if (qTokens.has(t)) shared++; });
    const score = shared / Math.min(tokens.size, qTokens.size);
    if (score > bestScore) { bestScore = score; best = q; }
  }
  return bestScore >= 0.45 ? best.id : null;
}

const companyId = name => (COMPANIES.find(c => c.name === name || c.id === name)?.id) || slugify(name);
// Per-round difficulty (1–5) → bank difficulty band
const diffBand = n => (n >= 4 ? 'Hard' : n === 3 ? 'Medium' : n >= 1 ? 'Easy' : 'Medium');

// ── Submit an interview experience ───────────────────────────────────────────
export async function submitExperience(payload, userId) {
  // Build the matching pool from the seed bank + already-persisted user questions.
  // (Auto-linking is non-sensitive metadata and is computed client-side where the
  //  seed bank lives. The server re-redacts all text and owns the actual writes.)
  let userQs = [];
  try {
    const { data } = await supabase.from('questions').select('id, body');
    userQs = data || [];
  } catch { /* best-effort */ }
  const pool = [...QUESTIONS, ...userQs];

  const cid = companyId(payload.company);
  const token = Math.random().toString(36).slice(2, 8);
  const newQuestions = [];
  const linkRows = [];

  (payload.rounds || []).forEach((r, ri) => {
    const roundTopics = Array.isArray(r.topics) ? r.topics : [];
    (r.questions || []).forEach((raw, qi) => {
      const body = String(raw || '').trim();
      if (body.length < 10) return;
      let linkedId = autoLinkQuestion(body, pool);
      if (!linkedId) {
        const newId = `exp-${token}-${ri}-${qi}`;           // id independent of experience id
        const topic = roundTopics[0] || 'domain';
        newQuestions.push({
          id: newId, company: cid, role: payload.role,
          topic: slugify(topic) || 'domain',
          topic_path: roundTopics.join(' / ') || (r.type || r.name || 'Interview'),
          difficulty: diffBand(Number(r.difficulty)),
          round: r.type || r.name || 'Technical',
          body,
        });
        pool.push({ id: newId, body });
        linkedId = newId;
      }
      linkRows.push({ body, round: r.type || r.name || null, linked_question_id: linkedId, company: payload.company, role: payload.role });
    });
  });

  // All writes happen server-side (service role) so PII redaction + moderation
  // cannot be bypassed by hitting Supabase directly.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Sign in required');
  const resp = await fetch('/api/submit-experience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({
      experience: {
        company: payload.company, role: payload.role,
        experienceYears: payload.experienceYears, interviewDate: payload.interviewDate || null,
        outcome: payload.outcome, difficulty: payload.difficulty || null,
        notes: payload.notes || '', showName: !!payload.showName, contributorName: payload.contributorName || '',
        rounds: payload.rounds || [],
      },
      newQuestions, linkRows,
    }),
  });
  if (!resp.ok) {
    const e = await resp.json().catch(() => ({}));
    throw new Error(e.error || 'Submission failed');
  }
  const out = await resp.json();
  return { ...out, linkedCount: (out.matchedCount || 0) + (out.createdCount || 0) };
}

// Frequency a question has been reported across interview experiences.
// (Frequency for a matched question is simply the count of experience_questions
//  rows linking to it — no separate counter to keep in sync.)
export async function loadExperienceLinkCounts(questionIds = []) {
  if (!questionIds.length) return {};
  const { data, error } = await supabase
    .from('experience_questions')
    .select('linked_question_id')
    .in('linked_question_id', questionIds);
  if (error) return {};
  return (data || []).reduce((m, r) => {
    if (r.linked_question_id) m[r.linked_question_id] = (m[r.linked_question_id] || 0) + 1;
    return m;
  }, {});
}

// Linked bank questions for an experience scope (for "Related Questions")
export async function loadRelatedQuestions({ company, role } = {}, limit = 12) {
  let q = supabase.from('experience_questions').select('body, round, linked_question_id, company, role').not('linked_question_id', 'is', null);
  if (company) q = q.eq('company', company);
  if (role)    q = q.eq('role', role);
  const { data, error } = await q.limit(200);
  if (error) return [];
  // de-dupe by linked id, keep first
  const seen = new Set();
  const out = [];
  for (const row of data || []) {
    if (seen.has(row.linked_question_id)) continue;
    seen.add(row.linked_question_id);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

// ── Load experiences (optionally scoped by company / role) ───────────────────
export async function loadExperiences({ company, role } = {}) {
  let query = supabase.from('interview_experiences').select('*').order('created_at', { ascending: false });
  if (company) query = query.eq('company', company);
  if (role)    query = query.eq('role', role);
  const { data, error } = await query.limit(500);
  if (error) { console.error('[experiences] load failed:', error.message); return []; }
  return (data || []).map(mapExperience);
}

function mapExperience(row) {
  return {
    id: row.id, slug: row.slug, company: row.company, role: row.role,
    experienceYears: row.experience_years, interviewDate: row.interview_date,
    outcome: row.outcome, numRounds: row.num_rounds, rounds: row.rounds || [],
    difficulty: row.difficulty, notes: row.notes,
    contributorName: row.show_name ? row.contributor_name : null,
    verifiedCount: row.verified_count ?? 0,
    createdAt: row.created_at,
    daysAgo: row.created_at ? Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86400000) : 0,
  };
}

export function attribution(exp) {
  return exp.contributorName ? exp.contributorName : 'Community member';
}

// ── Aggregate experiences into intelligence ──────────────────────────────────
// Pure function over loaded experiences (+ optional bank questions for topics).
export function computeIntelligence(experiences, { bankQuestions = QUESTIONS } = {}) {
  const total = experiences.length;
  const roundFreq = {}, topicFreq = {}, questionFreq = {}, outcomeFreq = { Selected: 0, Rejected: 0, Waiting: 0 };
  const difficultyDist = [0, 0, 0, 0, 0]; // index 0 => difficulty 1
  let difficultySum = 0, difficultyCount = 0;

  experiences.forEach(exp => {
    if (exp.outcome && outcomeFreq[exp.outcome] != null) outcomeFreq[exp.outcome]++;
    if (exp.difficulty >= 1 && exp.difficulty <= 5) { difficultyDist[exp.difficulty - 1]++; difficultySum += exp.difficulty; difficultyCount++; }
    (exp.rounds || []).forEach(r => {
      const name = r.type || r.name;
      if (name) roundFreq[name] = (roundFreq[name] || 0) + 1;
      // Topics now come from the real reports (per-round) when present
      (Array.isArray(r.topics) ? r.topics : []).forEach(t => {
        const key = String(t).trim();
        if (key) topicFreq[key] = (topicFreq[key] || 0) + 1;
      });
      (r.questions || []).forEach(q => {
        const key = String(q).trim().toLowerCase().slice(0, 120);
        if (key.length >= 10) questionFreq[key] = (questionFreq[key] || 0) + 1;
      });
    });
  });

  // Fallback: if no reported topics yet, derive from the bank for this scope.
  if (Object.keys(topicFreq).length === 0) {
    const scope = experiences[0] || {};
    bankQuestions
      .filter(q => (!scope.company || q.company === scope.company))
      .forEach(q => { const t = q.topicPath || q.topic; if (t) topicFreq[t] = (topicFreq[t] || 0) + 1; });
  }

  const rank = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]);

  return {
    total,
    commonRounds:   rank(roundFreq).slice(0, 8).map(([name, count]) => ({ name, count })),
    topTopics:      rank(topicFreq).slice(0, 8).map(([name, count]) => ({ name, count })),
    topQuestions:   rank(questionFreq).slice(0, 10).map(([body, count]) => ({ body, count })),
    outcomeFreq,
    difficultyDist,
    avgDifficulty:  difficultyCount ? +(difficultySum / difficultyCount).toFixed(1) : null,
    recent:         experiences.slice(0, 10),
  };
}

// ── Verify a question / "I was asked this" ───────────────────────────────────
export async function verifyQuestion(questionId, userId) {
  if (!userId) throw new Error('Sign in required');
  const { error } = await supabase.from('question_verifications').insert({ question_id: questionId, user_id: userId });
  if (error && !error.message.includes('duplicate')) throw error;
  return true;
}

export async function markAsked(questionId, userId) {
  if (!userId) throw new Error('Sign in required');
  const { error } = await supabase.from('question_asks').insert({ question_id: questionId, user_id: userId });
  if (error && !error.message.includes('duplicate')) throw error;
  return true;
}

// Counts for a set of question ids (so the bank can show real verify/ask totals)
export async function loadContributionCounts(questionIds = []) {
  if (!questionIds.length) return { verifications: {}, asks: {} };
  const [{ data: v }, { data: a }] = await Promise.all([
    supabase.from('question_verifications').select('question_id').in('question_id', questionIds),
    supabase.from('question_asks').select('question_id').in('question_id', questionIds),
  ]);
  const tally = rows => (rows || []).reduce((m, r) => { m[r.question_id] = (m[r.question_id] || 0) + 1; return m; }, {});
  return { verifications: tally(v), asks: tally(a) };
}

// Resolve a /company/:slug or /role/:slug or /interview-experiences/:slug param
export function resolveCompany(slug) {
  return COMPANIES.find(c => slugify(c.name) === slug) || null;
}
export { slugify };
