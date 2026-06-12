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
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.5 }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(`OpenAI ${res.status}: ${data?.error?.message || ''}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

const SYSTEM = `You are an elite technical interview coach.
Generate scenario-based assessment questions to evaluate a candidate's real knowledge.
Rules:
- Questions must be scenario-based, not trivia
- BAD: "What is HashMap?" GOOD: "You have a cache accessed by 100 threads. Why choose ConcurrentHashMap over HashMap and what are its trade-offs?"
- Each question tests practical, on-the-job knowledge
- Questions must match the seniority level of the role
- Return STRICT JSON only`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, competencies } = req.body || {};
  if (!company || !role || !competencies?.length) return res.status(400).json({ error: 'company, role, competencies required' });

  const compList = competencies.map(c => `- ${c.name} (importance: ${c.weight}/5)`).join('\n');

  const prompt = `Generate 10 scenario-based assessment questions for a ${role} candidate at ${sanitize(company, 120)}.

COMPETENCY MATRIX:
${compList}

Distribute questions across competencies weighted by importance (weight 5 = 2-3 questions, weight 3-4 = 1-2 questions, weight 1-2 = 0-1 questions).

Return ONLY this JSON:
{
  "questions": [
    {
      "id": "q1",
      "competency": "<exact competency name from the matrix>",
      "question": "<scenario-based question, 1-4 sentences>",
      "hint": "<what a strong answer should cover, 1 sentence>"
    }
  ]
}`;

  try {
    const text = await callOpenAI(apiKey, SYSTEM, prompt);
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('generate-assessment error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Assessment generation failed. Please try again.' });
  }
}
