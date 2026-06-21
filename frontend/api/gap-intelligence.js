import { sanitize, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

const SYSTEM = `You are a senior hiring-committee interviewer who has run hundreds of loops.
For each weak skill you receive, explain — concretely, for THIS role and company —
why it matters in interviews, what the interviewer is actually probing beneath the
surface question, the specific mistakes that get candidates rejected, and three
targeted practice activities with measurable outcomes.
Be specific and opinionated. Never generic. Reference the real signal you are given
(false confidence, interview frequency). Return STRICT JSON only.`;

// Validate one incoming gap-skill item
function sanitizeGapSkill(item) {
  if (!item || typeof item !== 'object') return null;
  const skill = sanitize(String(item.skill || ''), 80);
  if (!skill) return null;
  return {
    skill,
    score: Math.max(0, Math.min(100, Math.round(Number(item.score) || 0))),
    falseConfidence: !!item.falseConfidence,
    objectiveScore: item.objectiveScore == null ? null : Math.max(0, Math.min(100, Math.round(Number(item.objectiveScore)))),
    deepScore: item.deepScore == null ? null : Math.max(0, Math.min(100, Math.round(Number(item.deepScore)))),
    riskScore: Math.max(0, Math.min(100, Math.round(Number(item.riskScore) || 0))),
    askCount: Math.max(0, Math.round(Number(item.askCount) || 0)),
    questionCount: Math.max(0, Math.round(Number(item.questionCount) || 0)),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, skills } = req.body || {};
  if (!company || !role || !Array.isArray(skills) || !skills.length) {
    return res.status(400).json({ error: 'company, role, skills required' });
  }

  const safeSkills = skills.map(sanitizeGapSkill).filter(Boolean).slice(0, 8);
  if (!safeSkills.length) return res.status(400).json({ error: 'Invalid skills data' });

  const prompt = `Role: ${sanitize(role, 60)} at ${sanitize(company, 120)}.

For EACH weak skill below, produce a gap intelligence card. Use the signal:
- "falseConfidence: true" means the candidate recognised correct answers (${'objectiveScore'}) but could not recall/articulate it (deepScore) — address the illusion of competence directly.
- "askCount"/"questionCount" is how often this is actually asked in reported interviews for this role — higher means higher stakes.

SKILLS:
${safeSkills.map((s, i) => `${i + 1}. ${s.skill} — score ${s.score}%${s.falseConfidence ? `, FALSE CONFIDENCE (recognised ${s.objectiveScore}% / recalled ${s.deepScore}%)` : ''}, interview-risk ${s.riskScore}/100, asked ~${s.askCount}x across ${s.questionCount} reported questions`).join('\n')}

Return ONLY this JSON:
{"cards":[{
  "skill":"<exact skill name>",
  "whyItMatters":"<2 sentences, specific to this role/company>",
  "whatTheyTest":"<the deeper competency behind the surface question, 1-2 sentences>",
  "commonMistakes":["<mistake 1>","<mistake 2>","<mistake 3>"],
  "activities":[
    {"title":"<imperative, specific>","outcome":"<measurable result>","time":"<e.g. 45 min>"},
    {"title":"...","outcome":"...","time":"..."},
    {"title":"...","outcome":"...","time":"..."}
  ]
}]}
- One card per skill, same order. Activities must name the exact concept, never "practice more".`;

  try {
    const text = await callOpenAI(apiKey, SYSTEM, prompt, { temperature: 0.4, max_tokens: 2600 });
    const result = extractJson(text);
    res.status(200).json({ cards: Array.isArray(result.cards) ? result.cards : [] });
  } catch (e) {
    console.error('gap-intelligence error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Gap intelligence failed. Please try again.' });
  }
}
