const CONTROL_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
function sanitize(text, max = 8000) {
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
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.3 }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(`OpenAI ${res.status}: ${data?.error?.message || ''}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

const SYSTEM = `You are an elite technical interview coach evaluating candidate answers.
Score each competency honestly. Empty or skipped answers score 0-15.
Use these bands: 90-100=Strong, 75-89=Interview Ready, 60-74=Needs Improvement, 40-59=Weak, 0-39=Critical Gap.
Be calibrated — most candidates have gaps. Do not inflate scores.
Return STRICT JSON only.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, qa } = req.body || {};
  if (!company || !role || !qa?.length) return res.status(400).json({ error: 'company, role, qa required' });

  const qaText = qa.map((item, i) =>
    `Q${i + 1} [${item.competency}]: ${item.question}\nAnswer: ${sanitize(item.answer || '(skipped — no answer provided)', 800)}`
  ).join('\n\n');

  const prompt = `Evaluate this ${role} candidate's assessment for ${sanitize(company, 120)}.

QUESTIONS AND ANSWERS:
${qaText}

For each competency that appeared in the questions, calculate a score 0-100.
Then classify gaps.

Return ONLY this JSON:
{
  "heatmap": [
    {
      "skill": "<competency name>",
      "score": <0-100 int>,
      "band": "<Strong|Interview Ready|Needs Improvement|Weak|Critical Gap>",
      "feedback": "<1 sentence specific feedback on their answer>"
    }
  ],
  "gaps": {
    "critical": ["<skill>"],
    "weak": ["<skill>"],
    "moderate": ["<skill>"],
    "strong": ["<skill>"]
  },
  "readiness": <0-100 overall interview readiness>,
  "summary": "<2-3 sentence honest assessment of the candidate's current state>"
}`;

  try {
    const text = await callOpenAI(apiKey, SYSTEM, prompt);
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('evaluate-assessment error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Evaluation failed. Please try again.' });
  }
}
