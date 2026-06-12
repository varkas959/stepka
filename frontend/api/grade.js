import { sanitize, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

const GRADE_SYSTEM = `You are a senior staff engineer grading interview answers at top tech companies.
Be honest, specific, and brief. Score generously when reasoning is solid; never inflate.
Always respond with STRICT JSON only, no prose outside the object.`;

const BEHAVIORAL_TEMPLATE = (question, answer) => `Grade this behavioral interview answer.
QUESTION: ${question}
CANDIDATE ANSWER: ${answer}
Return ONLY this JSON:
{"overall":<1.0-5.0>,"dims":[{"name":"STAR structure","score":<0-100>},{"name":"Relevance","score":<0-100>},{"name":"Outcome clarity","score":<0-100>},{"name":"Conciseness","score":<0-100>}],"suggestedRating":<1|2|3|4>,"suggestedLabel":"<Forgot|Hard|Good|Easy>","text":"<2-3 sentences of feedback>"}`;

const TECHNICAL_TEMPLATE = (question, answer, mode) => `Grade this technical interview answer.
QUESTION: ${question}
CANDIDATE ANSWER (${mode}): ${answer}
Return ONLY this JSON:
{"overall":<1.0-5.0>,"dims":[{"name":"Correctness","score":<0-100>},{"name":"Depth","score":<0-100>},{"name":"Examples","score":<0-100>},{"name":"Edge cases","score":<0-100>}],"suggestedRating":<1|2|3|4>,"suggestedLabel":"<Forgot|Hard|Good|Easy>","text":"<2-3 sentences of feedback>"}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { question, answer, mode = 'text', is_behavioral = false } = req.body || {};
  if (!question || !answer) return res.status(400).json({ error: 'question and answer are required' });

  const q = sanitize(question, 600);
  const a = sanitize(answer);
  const prompt = is_behavioral ? BEHAVIORAL_TEMPLATE(q, a) : TECHNICAL_TEMPLATE(q, a, mode);

  try {
    const text = await callOpenAI(apiKey, GRADE_SYSTEM, prompt, { temperature: 0.4, max_tokens: 600 });
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('grade error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again in a few minutes.' });
    res.status(502).json({ error: 'AI grading unavailable. Please try again.' });
  }
}
