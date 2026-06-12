import { sanitize, sanitizeQAItem, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

const CONFIDENCE_WEIGHT = { mcq: 1, scenario_selection: 2, ranking: 3, free_text: 5 };

function scoreMCQ(q) {
  if (!q.candidateAnswer) return 0;
  return q.candidateAnswer.toUpperCase() === q.correctAnswer?.toUpperCase() ? 100 : 0;
}

function scoreRanking(q) {
  if (!q.candidateOrder?.length || !q.correctOrder?.length) return 0;
  const correct = q.correctOrder, candidate = q.candidateOrder;
  let pairs = 0, concordant = 0;
  for (let i = 0; i < correct.length - 1; i++) {
    for (let j = i + 1; j < correct.length; j++) {
      const ci = candidate.indexOf(correct[i]), cj = candidate.indexOf(correct[j]);
      if (ci !== -1 && cj !== -1) { pairs++; if (ci < cj) concordant++; }
    }
  }
  return pairs > 0 ? Math.round((concordant / pairs) * 100) : 0;
}

function band(score) {
  if (score >= 90) return 'Strong';
  if (score >= 75) return 'Interview Ready';
  if (score >= 60) return 'Needs Improvement';
  if (score >= 40) return 'Weak';
  return 'Critical Gap';
}

const SYSTEM = `You are a technical interviewer evaluating free-text answers.
Score each answer 0-100 based on depth, correctness, and communication.
0-20 = blank or wrong. 40-60 = partial. 80-100 = thorough expertise.
Be honest and calibrated. Return STRICT JSON only.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, qa } = req.body || {};
  if (!company || !role || !qa?.length) return res.status(400).json({ error: 'company, role, qa required' });

  // Sanitize every QA item — prevents prompt injection via candidate answers
  const safeQA = qa.map(sanitizeQAItem).filter(Boolean).slice(0, 30);
  if (!safeQA.length) return res.status(400).json({ error: 'Invalid qa data' });

  // Pre-score objective questions
  const scored = safeQA.map(q => {
    let rawScore = null;
    if (q.type === 'mcq' || q.type === 'scenario_selection') rawScore = scoreMCQ(q);
    if (q.type === 'ranking') rawScore = scoreRanking(q);
    return { ...q, rawScore };
  });

  // Evaluate free-text with AI
  const freeTextItems = scored.filter(q => q.type === 'free_text' && q.candidateAnswer);
  let freeTextScores = {};

  if (freeTextItems.length > 0) {
    const ftPrompt = `Evaluate these free-text interview answers for ${sanitize(role, 60)} at ${sanitize(company, 120)}.

${freeTextItems.map((q, i) => `
--- Question ${i + 1} [${q.competency}] ---
Question: ${q.question}
Evaluation criteria: ${q.evaluation_criteria.join('; ')}
Candidate answer: ${q.candidateAnswer}
`).join('\n')}

Return ONLY this JSON:
{"scores":[{"id":"<id>","score":<0-100>,"feedback":"<1 sentence>"}]}`;

    try {
      const ftText = await callOpenAI(apiKey, SYSTEM, ftPrompt, { temperature: 0.2, max_tokens: 800 });
      const ftResult = extractJson(ftText);
      (ftResult.scores || []).forEach(s => { freeTextScores[s.id] = s; });
    } catch (e) {
      console.warn('free-text eval failed, defaulting to 0:', e.message);
    }
  }

  // Confidence-weighted competency scores
  const competencyData = {};
  scored.forEach(q => {
    let rawScore = q.rawScore;
    if (q.type === 'free_text') rawScore = freeTextScores[q.id]?.score ?? (q.candidateAnswer?.trim() ? 30 : 0);
    const weight   = CONFIDENCE_WEIGHT[q.type] || 1;
    const feedback = freeTextScores[q.id]?.feedback || null;
    if (!competencyData[q.competency]) competencyData[q.competency] = { weightedSum: 0, totalWeight: 0, feedback: null };
    competencyData[q.competency].weightedSum += rawScore * weight;
    competencyData[q.competency].totalWeight += weight;
    if (feedback) competencyData[q.competency].feedback = feedback;
  });

  const heatmap = Object.entries(competencyData).map(([skill, d]) => ({
    skill,
    score: d.totalWeight > 0 ? Math.round(d.weightedSum / d.totalWeight) : 0,
    band: band(d.totalWeight > 0 ? Math.round(d.weightedSum / d.totalWeight) : 0),
    feedback: d.feedback,
  })).sort((a, b) => a.score - b.score);

  const gaps = { critical: [], weak: [], moderate: [], strong: [] };
  heatmap.forEach(h => {
    if (h.score < 40) gaps.critical.push(h.skill);
    else if (h.score < 60) gaps.weak.push(h.skill);
    else if (h.score < 75) gaps.moderate.push(h.skill);
    else gaps.strong.push(h.skill);
  });

  const totalWeightedSum = Object.values(competencyData).reduce((s, d) => s + d.weightedSum, 0);
  const totalWeight      = Object.values(competencyData).reduce((s, d) => s + d.totalWeight, 0);
  const readiness        = totalWeight > 0 ? Math.round(totalWeightedSum / totalWeight) : 0;

  const weakCount    = gaps.critical.length + gaps.weak.length;
  const deepDiveCount = weakCount <= 2 ? 6 : weakCount <= 4 ? 10 : 15;
  const deepDiveSkills = [
    ...heatmap.filter(h => gaps.critical.includes(h.skill)),
    ...heatmap.filter(h => gaps.weak.includes(h.skill)),
  ];

  const summary = [
    readiness < 40 ? 'Significant preparation needed' : readiness < 60 ? 'Moderate gaps identified' : readiness < 75 ? 'Good foundation with some gaps' : 'Strong candidate',
    `for ${sanitize(role, 60)}.`,
    gaps.critical.length ? `Critical gaps in: ${gaps.critical.join(', ')}.` : '',
    gaps.weak.length ? `Weak areas: ${gaps.weak.join(', ')}.` : '',
  ].filter(Boolean).join(' ');

  res.status(200).json({ heatmap, gaps, readiness, summary, needsDeepDive: weakCount > 0, deepDiveCount, deepDiveSkills });
}
