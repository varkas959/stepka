const MAX_TEXT_LEN = 8000;
const MAX_SHORT_LEN = 120;
const CONTROL_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;

function sanitize(text, maxLen = MAX_TEXT_LEN) {
  if (!text) return '';
  return String(text).replace(CONTROL_RE, '').trim().slice(0, maxLen);
}

function extractJson(text) {
  text = text.trim();
  const fence = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fence) return JSON.parse(fence[1]);
  if (!text.startsWith('{')) {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) text = m[0];
  }
  return JSON.parse(text);
}

async function callOpenAI(apiKey, systemPrompt, userPrompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(`OpenAI error ${res.status}: ${data?.error?.message || ''}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

const SYSTEM = `You are an expert technical recruiter.
Extract the most-relevant technical and behavioral skills from a job description and
assign each an importance weight from 1 (nice-to-have) to 5 (must-have, central to the role).
Respond with STRICT JSON only, no prose outside the object.`;

const TEMPLATE = (jd, company, role) => `Extract skills from this JD for a candidate targeting ${company} (${role}).

JOB DESCRIPTION:
${jd}

Return ONLY this JSON shape (no markdown, no extra text). Extract 6-10 skills.
{
  "skills": [
    {"name": "<concise skill name, 1-3 words>", "weight": <1-5 int importance>}
  ]
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OPENAI_API_KEY is not configured in Vercel environment variables.' });
  }

  const { jd, target_company, target_role } = req.body || {};
  if (!jd) return res.status(400).json({ error: 'jd is required' });

  try {
    const text = await callOpenAI(
      apiKey,
      SYSTEM,
      TEMPLATE(sanitize(jd), sanitize(target_company, MAX_SHORT_LEN), sanitize(target_role, MAX_SHORT_LEN))
    );
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('extract-skills error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') {
      return res.status(429).json({ error: 'API quota reached. Try again in a few minutes.' });
    }
    res.status(502).json({ error: 'AI service unavailable. Please try again.' });
  }
}
