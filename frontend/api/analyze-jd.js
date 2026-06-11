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

async function callGemini(apiKey, systemPrompt, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.3 },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const body2 = await res.text();
  if (!res.ok) {
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(`Gemini ${res.status}: ${body2.slice(0, 300)}`);
  }
  const data = JSON.parse(body2);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const SYSTEM = `You are an expert technical recruiter and interview coach.
Extract the most-relevant technical and behavioral skills from a job description,
estimate the candidate's plausible mastery (err toward 40-70 range), and produce an overall readiness score.
Respond with STRICT JSON only, no prose outside the object.`;

const TEMPLATE = (jd, company, role) => `Analyze this JD for a candidate targeting ${company} (${role}).

JOB DESCRIPTION:
${jd}

Return ONLY this JSON shape (no markdown, no extra text). Extract 6-10 skills.
{
  "extractedSkills": [
    {"name": "<skill name>", "mastery": <0-100 int>}
  ],
  "readiness": <0-100 int overall readiness>,
  "suggestions": ["<one short specific suggestion>", "<another>"]
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured in Vercel environment variables.' });
  }

  const { jd, target_company, target_role } = req.body || {};
  if (!jd) return res.status(400).json({ error: 'jd is required' });

  try {
    const text = await callGemini(
      apiKey,
      SYSTEM,
      TEMPLATE(sanitize(jd), sanitize(target_company, MAX_SHORT_LEN), sanitize(target_role, MAX_SHORT_LEN))
    );
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('analyze-jd error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') {
      return res.status(429).json({ error: 'Gemini free tier quota reached. Try again in a few minutes.' });
    }
    res.status(502).json({ error: 'AI service unavailable. Please try again.' });
  }
}
