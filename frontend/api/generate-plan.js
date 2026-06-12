const CONTROL_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
function sanitize(text, max = 4000) {
  if (!text) return '';
  return String(text).replace(CONTROL_RE, '').trim().slice(0, max);
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
      temperature: 0.4,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(`OpenAI error ${res.status}: ${data?.error?.message || ''}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

const SYSTEM = `You are an expert interview coach building personalised 14-day prep plans.
Given a candidate's skill gaps and a target role, produce a structured day-by-day study plan.
Each day should have a clear focus topic, 5-7 specific study tasks, and 2-3 practice questions relevant to the gap.
Weight weak skills (low mastery, high JD weight) heavily in the first 7 days.
Respond with STRICT JSON only.`;

const TEMPLATE = (company, role, skills) => `Build a 14-day interview prep plan for ${company} ${role}.

CANDIDATE SKILL ASSESSMENT (mastery 0-100, weight 1-5 importance):
${skills.map(s => `- ${s.name}: mastery ${s.mastery}%, JD weight ${s.weight}/5${s.mastery < 50 ? ' [GAP - prioritise]' : s.mastery < 70 ? ' [needs work]' : ' [strong]'}`).join('\n')}

Return ONLY this JSON (no markdown):
{
  "days": [
    {
      "day": 1,
      "focus": "<1-2 topic names for this day>",
      "tasks": [
        "<specific study task — what to read, code, or practise>",
        "<another task>",
        "<another task>",
        "<another task>",
        "<another task>"
      ],
      "practiceQuestions": [
        "<specific interview question to practise>",
        "<another question>"
      ]
    }
  ]
}

Rules:
- 14 days exactly
- Days 1-7: focus on GAP skills
- Days 8-12: deepen mid-level skills + mock interviews
- Days 13-14: full mock loops, revision, confidence building
- Tasks must be specific and actionable, not generic (e.g. "Implement a thread-safe LRU cache in Java" not "study Java")
- Practice questions must be real interview-style questions`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OPENAI_API_KEY is not configured.' });
  }

  const { company, role, skills } = req.body || {};
  if (!company || !role || !skills?.length) {
    return res.status(400).json({ error: 'company, role, and skills are required' });
  }

  try {
    const text = await callOpenAI(
      apiKey,
      SYSTEM,
      TEMPLATE(sanitize(company, 120), sanitize(role, 60), skills.slice(0, 10))
    );
    res.status(200).json(extractJson(text));
  } catch (e) {
    console.error('generate-plan error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') {
      return res.status(429).json({ error: 'API quota reached. Try again in a few minutes.' });
    }
    res.status(502).json({ error: 'Plan generation failed. Please try again.' });
  }
}
