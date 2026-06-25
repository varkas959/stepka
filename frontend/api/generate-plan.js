import { sanitize, sanitizeHeatmapItem, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

const SYSTEM = `You are an elite technical interview coach building a prep plan that maximises the
candidate's chance of passing THIS specific interview.

ABSOLUTE RULE — STAY ON THE ACTUAL SKILLS:
Every day must be built around ONE skill taken VERBATIM from the provided SKILLS HEATMAP.
- Copy the skill name exactly as the day's "focus".
- Never invent generic competencies like "Technical Judgment" or "Problem Solving".
- Never drift to topics that are not in the heatmap. If the heatmap is about test automation
  (Selenium, waits, Page Object Model, CI), the entire plan is about test automation — NOT
  system design, microservices, or any topic the JD did not ask for.

DEPTH INTELLIGENCE: interviews fail candidates on DEPTH, not coverage — they can say what a
skill is but cannot defend it under "why?" follow-ups. Frame each day as a climb down a
5-level ladder FOR THAT SKILL: 1 Definition, 2 Motivation, 3 Mechanism, 4 Internals/representation,
5 Assumptions/trade-offs — using concrete internals of that exact skill (for "Explicit Waits":
what they are → why over implicit waits → how polling works → what happens on a stale element).

Each day MUST have:
- focus: the exact skill name, copied from the heatmap.
- outcome: the capability owned by end of day, depth-framed and SPECIFIC to that skill.
- task: ONE concrete task forcing depth on that skill (e.g. "answer 5 progressively harder follow-ups on <focus> without notes").
- successCriteria: a self-runnable depth test naming a real internal of that skill.
- avoid: the depth trap for that skill.
- depthTarget: integer 1-5.
- commonFailure: how candidates stall on that skill.
- estimatedTime: realistic budget (e.g. "90 min").

Rules:
- Front-load the highest interview-risk and false-confidence gaps in days 1-7.
- For false-confidence skills, the task must force RECALL/BUILD from scratch, never recognition.
Return STRICT JSON only.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, heatmap, gaps, readiness, falseConfidenceSkills, highRiskSkills } = req.body || {};
  if (!company || !role || !heatmap?.length) return res.status(400).json({ error: 'company, role, heatmap required' });

  // Sanitize array items to block prompt injection
  const safeHeatmap  = heatmap.map(sanitizeHeatmapItem).filter(Boolean).slice(0, 20);
  if (!safeHeatmap.length) return res.status(400).json({ error: 'Invalid heatmap data' });

  const safeCritical  = Array.isArray(gaps?.critical) ? gaps.critical.map(s => sanitize(String(s), 80)).filter(Boolean).slice(0, 10) : [];
  const safeWeak      = Array.isArray(gaps?.weak)     ? gaps.weak.map(s => sanitize(String(s), 80)).filter(Boolean).slice(0, 10)     : [];
  const safeFalseConf = Array.isArray(falseConfidenceSkills) ? falseConfidenceSkills.map(s => sanitize(String(s), 80)).filter(Boolean).slice(0, 10) : [];
  const safeHighRisk  = Array.isArray(highRiskSkills) ? highRiskSkills.map(s => sanitize(String(s), 80)).filter(Boolean).slice(0, 10) : [];
  const safeReadiness = Math.max(0, Math.min(100, Math.round(Number(readiness) || 0)));

  const prompt = `Build a 14-day interview prep roadmap for a ${sanitize(role, 60)} candidate at ${sanitize(company, 120)}.

SKILLS HEATMAP (these are the ONLY topics allowed in the plan — every day's "focus" must be one of these exact names):
${safeHeatmap.map(h => `- ${h.skill}: ${h.score}% (${h.band})`).join('\n')}

GAPS: Critical: ${safeCritical.join(', ') || 'none'} | Weak: ${safeWeak.join(', ') || 'none'}
HIGH INTERVIEW-RISK (weak AND frequently asked here — prioritise these): ${safeHighRisk.join(', ') || 'none'}
FALSE CONFIDENCE (recognise but cannot recall — tasks must force build-from-scratch): ${safeFalseConf.join(', ') || 'none'}
Readiness: ${safeReadiness}%

Return ONLY this JSON (no markdown):
{"successProbability":"<e.g. 72%>","days":[{"day":1,"focus":"<skill>","theme":"<theme>","outcome":"<depth-framed capability>","task":"<one concrete depth-forcing task>","successCriteria":"<reach Depth Level N: ...>","avoid":"<depth trap>","depthTarget":4,"commonFailure":"<how candidates stall>","estimatedTime":"<e.g. 90 min>","practiceQuestions":["<q>"],"mockInterview":null}],"mockInterviews":[{"day":5,"type":"Coding Mock","topics":["<skill>"],"duration":"60 min"}]}
- 14 days exactly. Every day must include outcome, task, successCriteria, avoid, depthTarget, commonFailure, estimatedTime.
- CRITICAL: every "focus" and all content must come from the SKILLS HEATMAP above. Do NOT introduce system design, microservices, or any topic not in that list unless it literally appears there.`;

  try {
    const text = await callOpenAI(apiKey, SYSTEM, prompt, { temperature: 0.4, max_tokens: 4000 });
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('generate-plan error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Plan generation failed. Please try again.' });
  }
}
