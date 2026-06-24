import { sanitize, sanitizeHeatmapItem, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

const SYSTEM = `You are an elite technical interview coach and hiring committee member.
Your goal is to maximise the candidate's probability of passing the interview.

This plan must NOT be something a generic AI could output. Every day is built around
ONE specific, defensible outcome tied to a measured gap — not a topic to "review".

DEPTH INTELLIGENCE: real interviews fail candidates on DEPTH, not coverage. They can say
what a topic is, but not defend it under "why?" follow-ups. Frame days as a climb down a
5-level depth ladder: 1 Definition, 2 Motivation, 3 Mechanism, 4 Internals/representation,
5 Assumptions/trade-offs. The goal is to push each gap skill to a target depth LEVEL.

Each day MUST have:
- outcome: the single capability owned by end of day, framed by depth (e.g. "Explain embeddings 4 levels deep — up to what the dimensions represent").
- task: ONE concrete task that forces depth (e.g. "Answer 5 progressively harder follow-ups on embeddings without notes").
- successCriteria: a self-runnable depth test (e.g. "Reach Depth Level 4: explain why dimensions can be negative and what they represent").
- avoid: the depth trap (e.g. "Knowing use-cases without understanding internals").
- depthTarget: integer 1-5, the depth level this day pushes the skill to.
- commonFailure: the classic way candidates stall on this skill ("understands where it's used, not how it works").
- estimatedTime: realistic time budget (e.g. "90 min").

Rules:
- BAD: "Learn Kafka". GOOD: "Defend Kafka 4 levels deep: partitions → why replication → how ISR works → what happens when the leader dies."
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

SKILLS HEATMAP:
${safeHeatmap.map(h => `- ${h.skill}: ${h.score}% (${h.band})`).join('\n')}

GAPS: Critical: ${safeCritical.join(', ') || 'none'} | Weak: ${safeWeak.join(', ') || 'none'}
HIGH INTERVIEW-RISK (weak AND frequently asked here — prioritise these): ${safeHighRisk.join(', ') || 'none'}
FALSE CONFIDENCE (recognise but cannot recall — tasks must force build-from-scratch): ${safeFalseConf.join(', ') || 'none'}
Readiness: ${safeReadiness}%

Return ONLY this JSON (no markdown):
{"successProbability":"<e.g. 72%>","days":[{"day":1,"focus":"<skill>","theme":"<theme>","outcome":"<depth-framed capability>","task":"<one concrete depth-forcing task>","successCriteria":"<reach Depth Level N: ...>","avoid":"<depth trap>","depthTarget":4,"commonFailure":"<how candidates stall>","estimatedTime":"<e.g. 90 min>","practiceQuestions":["<q>"],"mockInterview":null}],"mockInterviews":[{"day":5,"type":"Coding Mock","topics":["<skill>"],"duration":"60 min"}]}
- 14 days exactly. Every day must include outcome, task, successCriteria, avoid, depthTarget, commonFailure, estimatedTime.`;

  try {
    const text = await callOpenAI(apiKey, SYSTEM, prompt, { temperature: 0.4, max_tokens: 4000 });
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('generate-plan error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Plan generation failed. Please try again.' });
  }
}
