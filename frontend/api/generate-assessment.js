import { sanitize, sanitizeHeatmapItem, sanitizeCompetency, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

const SYSTEM = `You are an elite technical interview coach building assessments.
Rules:
- Questions must be practical and scenario-based, never trivia
- MCQ/Scenario: exactly 4 options (A, B, C, D) and a correctAnswer letter
- Ranking: 4 items and correctOrder array in correct priority order
- Free-text: 3 evaluation_criteria strings
- Return STRICT JSON only, no markdown`;

const SCREENING_PROMPT = (company, role, competencies) => {
  const compList = competencies.map(c => `- ${c.name} (weight ${c.weight}/5)`).join('\n');
  return `Generate a 10-question screening assessment for ${role} at ${company}.

COMPETENCY MATRIX:
${compList}

REQUIRED DISTRIBUTION (exactly): 5 MCQ, 3 scenario_selection, 1 ranking, 1 free_text

Return ONLY this JSON:
{"questions":[
  {"id":"q1","type":"mcq","competency":"<name>","question":"<q>","options":["A. <o>","B. <o>","C. <o>","D. <o>"],"correctAnswer":"<A|B|C|D>"},
  {"id":"q3","type":"ranking","competency":"<name>","question":"<q>","items":["<i1>","<i2>","<i3>","<i4>"],"correctOrder":["<highest>","<2nd>","<3rd>","<lowest>"]},
  {"id":"q4","type":"free_text","competency":"<name>","question":"<q>","evaluation_criteria":["<c1>","<c2>","<c3>"]}
]}`;
};

const DEEPDIVE_PROMPT = (company, role, weakSkills, questionCount) => {
  const skillList = weakSkills.map(s => `- ${s.skill} (score: ${s.score}%, band: ${s.band})`).join('\n');
  const mcq      = Math.round(questionCount * 0.3);
  const scenario = Math.round(questionCount * 0.3);
  const ranking  = Math.round(questionCount * 0.2);
  const freetext = questionCount - mcq - scenario - ranking;
  return `Generate ${questionCount} deep-dive questions for ${role} at ${company}.
Focus ONLY on these weak areas:
${skillList}
Distribution: ${mcq} MCQ, ${scenario} scenario_selection, ${ranking} ranking, ${freetext} free_text.
Use the same JSON format. Escalate complexity to expose depth of understanding.`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, competencies, weakSkills, mode = 'screening' } = req.body || {};
  if (!company || !role) return res.status(400).json({ error: 'company and role required' });

  // Sanitize all array items to block prompt injection
  const safeCompetencies = Array.isArray(competencies)
    ? competencies.map(sanitizeCompetency).filter(Boolean).slice(0, 15)
    : [];

  const safeWeakSkills = Array.isArray(weakSkills)
    ? weakSkills.map(sanitizeHeatmapItem).filter(Boolean).slice(0, 15)
    : [];

  const questionCount = safeWeakSkills.length
    ? safeWeakSkills.length <= 2 ? 6 : safeWeakSkills.length <= 4 ? 10 : 15
    : 10;

  const prompt = mode === 'deep-dive' && safeWeakSkills.length
    ? DEEPDIVE_PROMPT(sanitize(company, 120), sanitize(role, 60), safeWeakSkills, questionCount)
    : SCREENING_PROMPT(sanitize(company, 120), sanitize(role, 60), safeCompetencies);

  try {
    const text = await callOpenAI(apiKey, SYSTEM, prompt, { temperature: 0.5, max_tokens: 3000 });
    const parsed = extractJson(text);
    res.status(200).json({ ...parsed, questionCount });
  } catch (e) {
    console.error('generate-assessment error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Assessment generation failed. Please try again.' });
  }
}
