import { sanitize, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

const SYSTEM = `You are an expert technical recruiter.
Extract the most-relevant technical and behavioral skills from a job description and assign each an importance weight 1-5.
Respond with STRICT JSON only, no prose outside the object.`;

const TEMPLATE = (jd, company, role) => `Extract skills from this JD for a candidate targeting ${company} (${role}).

JOB DESCRIPTION:
${jd}

Return ONLY this JSON (6-10 skills, no markdown):
{"skills":[{"name":"<1-3 word skill name>","weight":<1-5 int>}]}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY is not configured.' });

  const { jd, target_company, target_role } = req.body || {};
  if (!jd) return res.status(400).json({ error: 'jd is required' });

  try {
    const text = await callOpenAI(
      apiKey, SYSTEM,
      TEMPLATE(sanitize(jd), sanitize(target_company, 120), sanitize(target_role, 120)),
      { temperature: 0.3, max_tokens: 500 }
    );
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('extract-skills error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again in a few minutes.' });
    res.status(502).json({ error: 'AI service unavailable. Please try again.' });
  }
}
