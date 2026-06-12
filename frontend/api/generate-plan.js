import { sanitize, sanitizeHeatmapItem, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

const SYSTEM = `You are an elite technical interview coach and hiring committee member.
Your goal is to maximise the candidate's probability of passing the interview.
Rules for tasks:
- BAD: "Learn Kafka" GOOD: "Explain Kafka partitions, replication, consumer groups, ISR and retention policy. Build a producer-consumer demo."
- Every task must have a measurable outcome linked to an identified weakness.
Structure: Days 1-7 front-load critical gaps. Days 8-12 strengthen weak areas + mocks. Days 13-14 full simulation.
Each day: Learning + Hands-on + Practice questions + Reflection. Return STRICT JSON only.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, heatmap, gaps, readiness } = req.body || {};
  if (!company || !role || !heatmap?.length) return res.status(400).json({ error: 'company, role, heatmap required' });

  // Sanitize array items to block prompt injection
  const safeHeatmap  = heatmap.map(sanitizeHeatmapItem).filter(Boolean).slice(0, 20);
  if (!safeHeatmap.length) return res.status(400).json({ error: 'Invalid heatmap data' });

  const safeCritical  = Array.isArray(gaps?.critical) ? gaps.critical.map(s => sanitize(String(s), 80)).filter(Boolean).slice(0, 10) : [];
  const safeWeak      = Array.isArray(gaps?.weak)     ? gaps.weak.map(s => sanitize(String(s), 80)).filter(Boolean).slice(0, 10)     : [];
  const safeReadiness = Math.max(0, Math.min(100, Math.round(Number(readiness) || 0)));

  const prompt = `Build a 14-day interview prep roadmap for a ${sanitize(role, 60)} candidate at ${sanitize(company, 120)}.

SKILLS HEATMAP:
${safeHeatmap.map(h => `- ${h.skill}: ${h.score}% (${h.band})`).join('\n')}

GAPS: Critical: ${safeCritical.join(', ') || 'none'} | Weak: ${safeWeak.join(', ') || 'none'}
Readiness: ${safeReadiness}%

Return ONLY this JSON (no markdown):
{"successProbability":"<e.g. 72%>","days":[{"day":1,"focus":"<skill>","theme":"<theme>","tasks":["<task>"],"practiceQuestions":["<q>"],"mockInterview":null}],"mockInterviews":[{"day":5,"type":"Coding Mock","topics":["<skill>"],"duration":"60 min"}]}
- 14 days exactly. Tasks must name the exact concept or algorithm.`;

  try {
    const text = await callOpenAI(apiKey, SYSTEM, prompt, { temperature: 0.4, max_tokens: 4000 });
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('generate-plan error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Plan generation failed. Please try again.' });
  }
}
