import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_TEXT_LEN = 8000;
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

const GRADE_SYSTEM = `You are a senior staff engineer grading interview answers at top tech companies.
Be honest, specific, and brief. Score generously when reasoning is solid; never inflate.
Always respond with STRICT JSON only, no prose outside the object.`;

const BEHAVIORAL_TEMPLATE = (question, answer) => `Grade this behavioral interview answer.

QUESTION:
${question}

CANDIDATE ANSWER:
${answer}

Return ONLY this JSON shape (no markdown fences, no extra text):
{
  "overall": <number 1.0-5.0, one decimal>,
  "dims": [
    {"name": "STAR structure", "score": <0-100 int>},
    {"name": "Relevance", "score": <0-100 int>},
    {"name": "Outcome clarity", "score": <0-100 int>},
    {"name": "Conciseness", "score": <0-100 int>}
  ],
  "suggestedRating": <1|2|3|4>,
  "suggestedLabel": "<Forgot|Hard|Good|Easy>",
  "text": "<2-3 short paragraphs of specific feedback, plain text>"
}`;

const TECHNICAL_TEMPLATE = (question, answer, mode) => `Grade this technical interview answer.

QUESTION:
${question}

CANDIDATE ANSWER (${mode}):
${answer}

Return ONLY this JSON shape (no markdown fences, no extra text):
{
  "overall": <number 1.0-5.0, one decimal>,
  "dims": [
    {"name": "Correctness", "score": <0-100 int>},
    {"name": "Depth", "score": <0-100 int>},
    {"name": "Examples", "score": <0-100 int>},
    {"name": "Edge cases", "score": <0-100 int>}
  ],
  "suggestedRating": <1|2|3|4>,
  "suggestedLabel": "<Forgot|Hard|Good|Easy>",
  "text": "<2-3 short paragraphs of specific feedback, plain text>"
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured. Add it in Vercel → Settings → Environment Variables.' });
  }

  const { question, answer, mode = 'text', is_behavioral = false } = req.body;
  const q = sanitize(question);
  const a = sanitize(answer);

  const prompt = is_behavioral
    ? BEHAVIORAL_TEMPLATE(q, a)
    : TECHNICAL_TEMPLATE(q, a, mode);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: GRADE_SYSTEM },
    });
    const text = response.text;
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('grade error:', e);
    res.status(502).json({ error: e.message });
  }
}
