const CONTROL_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
function sanitize(text, max = 4000) {
  if (!text) return '';
  return String(text).replace(CONTROL_RE, '').trim().slice(0, max);
}
function extractJson(text) {
  text = text.trim();
  const fence = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fence) return JSON.parse(fence[1]);
  const m = text.match(/\{[\s\S]*\}/);
  if (m) return JSON.parse(m[0]);
  return JSON.parse(text);
}
async function callOpenAI(apiKey, system, user) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.4, max_tokens: 4000 }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(`OpenAI ${res.status}: ${data?.error?.message || ''}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

const SYSTEM = `You are an elite technical interview coach and hiring committee member.

Your goal is NOT to generate a generic study plan.
Your goal is to maximise the candidate's probability of passing the interview.

Rules for tasks:
- BAD: "Learn Kafka" GOOD: "Explain Kafka partitions, replication, consumer groups, ISR and retention policy. Build a producer-consumer demo."
- BAD: "Study System Design" GOOD: "Design a notification service for 10M daily messages. Produce architecture, APIs, DB design, scaling strategy, failure handling."
- Every task must have a measurable outcome
- Every recommendation must be linked to an identified weakness
- Focus on interview readiness, not content consumption

Structure:
- Days 1-7: Front-load critical gaps (maximum effort)
- Days 8-12: Strengthen weak areas + targeted mock interviews
- Days 13-14: Full mock interview simulation + revision

Each day must contain: Learning + Hands-on implementation + Practice questions + Reflection
Insert mock interviews on appropriate days.
Return STRICT JSON only.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, heatmap, gaps, readiness } = req.body || {};
  if (!company || !role || !heatmap?.length) return res.status(400).json({ error: 'company, role, heatmap required' });

  const heatmapText = heatmap.map(h => `- ${h.skill}: ${h.score}% (${h.band})`).join('\n');
  const criticalText = (gaps?.critical || []).join(', ') || 'none';
  const weakText = (gaps?.weak || []).join(', ') || 'none';

  const prompt = `Build a 14-day personalised interview prep roadmap for a ${sanitize(role, 60)} candidate at ${sanitize(company, 120)}.

SKILLS HEATMAP (from actual assessment):
${heatmapText}

GAP CLASSIFICATION:
Critical gaps (score < 40, needs maximum attention): ${criticalText}
Weak areas (score 40-59, needs significant work): ${weakText}
Overall interview readiness: ${readiness || 0}%

Return ONLY this JSON (no markdown):
{
  "successProbability": "<percentage estimate e.g. 72%>",
  "days": [
    {
      "day": 1,
      "focus": "<1-2 skill names being targeted today>",
      "theme": "<morning: learning | afternoon: hands-on | evening: assessment>",
      "tasks": [
        "<specific actionable task with measurable outcome>",
        "<hands-on implementation task>",
        "<assessment or practice task>",
        "<reflection prompt>"
      ],
      "practiceQuestions": [
        "<scenario-based interview question directly linked to today's gap>",
        "<another scenario question>"
      ],
      "mockInterview": null
    }
  ],
  "mockInterviews": [
    {
      "day": 5,
      "type": "Coding Mock",
      "topics": ["<skill1>", "<skill2>"],
      "duration": "60 min"
    }
  ]
}

Rules:
- 14 days exactly
- mockInterview field on a day: null OR {"type": "...", "topics": [...], "duration": "..."}
- mockInterviews array should list days 5, 9, 12, 14 (adjust topics to match the candidate's gaps)
- Tasks must be specific — name the exact concept, algorithm, or design to implement`;

  try {
    const text = await callOpenAI(apiKey, SYSTEM, prompt);
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('generate-plan error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Plan generation failed. Please try again.' });
  }
}
