import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

const SYSTEM = `You are an expert technical recruiter and interview coach.
Extract the most-relevant technical and behavioral skills from a job description,
estimate the candidate's plausible mastery (use the JD + role seniority as context;
err toward 40-70 range to leave room for growth), and produce an overall readiness score.
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
  "suggestions": [
    "<one short specific suggestion>",
    "<another>"
  ]
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { jd, target_company, target_role } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: TEMPLATE(sanitize(jd), sanitize(target_company, MAX_SHORT_LEN), sanitize(target_role, MAX_SHORT_LEN)),
      config: { systemInstruction: SYSTEM },
    });
    res.status(200).json(extractJson(response.text()));
  } catch (e) {
    console.error('analyze-jd error:', e);
    res.status(502).json({ error: e.message });
  }
}
