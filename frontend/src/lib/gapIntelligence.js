// ─── Gap Intelligence ──────────────────────────────────────────────────────
// Turns a raw assessment heatmap into an evidence-backed gap profile that a
// generic AI assistant cannot reproduce. Two signals power it:
//
//   1. Behavioral signal — cross-format answer divergence from the user's own
//      answers (high recognition / low recall = false confidence).
//   2. Market signal — real reported-question frequency from the Stepkai
//      question bank for the target company + role (weak × frequently-asked =
//      high interview risk).
//
// The heatmap items already carry { skill, score, band, objectiveScore,
// deepScore, falseConfidence } from /api/evaluate-assessment.

import { QUESTIONS, COMPANIES } from './mockData';

const WEAK_CEIL     = 60;   // < 60% = weak / critical
const STRONG_FLOOR  = 75;   // >= 75% = strong
const RISK_FREQ_MIN = 2;    // a skill must be asked >= 2x to count as "frequent"

// Normalise a string for fuzzy matching ("React Performance" ~ "react-performance")
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Does a question touch this competency? Match against topic, topicPath, tech.
function questionMatchesSkill(q, skillTokens) {
  const haystack = norm([q.topic, q.topicPath, ...(q.tech || [])].join(' '));
  // require at least one meaningful token (len >= 3) to overlap
  return skillTokens.some(t => t.length >= 3 && haystack.includes(t));
}

// Build a frequency index: how often is each competency asked at company+role?
// Returns { askCount, questionCount, sampleQuestions } per skill.
export function computeMarketFrequency(skills, { companyId, role, corpus = QUESTIONS }) {
  const co = COMPANIES.find(c => c.id === companyId || c.name === companyId);
  const pool = corpus.filter(q => {
    const companyOk = !co || q.company === co.id;
    return companyOk;
  });
  // Role-scoped pool, falling back to company-wide if too thin
  const roleScoped = pool.filter(q => norm(q.role) === norm(role));
  const usePool = roleScoped.length >= 3 ? roleScoped : pool;

  const out = {};
  skills.forEach(skill => {
    const tokens = norm(skill).split(' ');
    const matches = usePool.filter(q => questionMatchesSkill(q, tokens));
    const askCount = matches.reduce((s, q) => s + (q.asked || 0), 0);
    out[skill] = {
      questionCount: matches.length,
      askCount,
      sampleQuestions: matches.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 3).map(q => q.body),
    };
  });
  return out;
}

// Classify every skill into the four Gap Intelligence categories.
// A skill can appear in more than one list (e.g. weak AND high-risk).
export function classifySkills(heatmap, { companyId, role, corpus } = {}) {
  const skills = heatmap.map(h => h.skill);
  const freq = computeMarketFrequency(skills, { companyId, role, corpus });
  const maxAsk = Math.max(1, ...Object.values(freq).map(f => f.askCount));

  const enriched = heatmap.map(h => {
    const f = freq[h.skill] || { questionCount: 0, askCount: 0, sampleQuestions: [] };
    const frequent = f.questionCount >= RISK_FREQ_MIN || f.askCount >= 30;
    const weak = h.score < WEAK_CEIL;
    // Interview-risk score 0-100: weighted blend of weakness and ask-frequency.
    const weaknessFactor = Math.max(0, (WEAK_CEIL - Math.min(h.score, WEAK_CEIL)) / WEAK_CEIL); // 0..1
    const demandFactor   = Math.min(1, f.askCount / maxAsk);                                    // 0..1
    const riskScore = Math.round((weaknessFactor * 0.6 + demandFactor * 0.4) * 100);
    return {
      ...h,
      frequency: f,
      frequent,
      highRisk: weak && frequent,
      riskScore,
    };
  });

  const strong          = enriched.filter(h => h.score >= STRONG_FLOOR && !h.falseConfidence);
  const weak            = enriched.filter(h => h.score < WEAK_CEIL);
  const falseConfidence = enriched.filter(h => h.falseConfidence);
  const highRisk        = enriched.filter(h => h.highRisk).sort((a, b) => b.riskScore - a.riskScore);

  return { enriched, strong, weak, falseConfidence, highRisk };
}

// Skills that deserve a deep "why it matters" card: weak OR false-confidence,
// ordered by interview risk so the riskiest gap is addressed first.
export function prioritizedGapSkills(classified) {
  const seen = new Set();
  return [...classified.highRisk, ...classified.weak, ...classified.falseConfidence]
    .filter(h => { if (seen.has(h.skill)) return false; seen.add(h.skill); return true; })
    .sort((a, b) => b.riskScore - a.riskScore);
}
