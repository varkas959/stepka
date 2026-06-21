import { sanitize, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

// Adaptive interviewer. Stateless: the client replays the transcript each turn.
// The model behaves like a senior interviewer probing one skill in depth —
// asking ONE question at a time, drilling into vague answers, and only stopping
// once it is confident about the candidate's true depth (or has found the floor).

const SYSTEM = `You are a senior technical interviewer running a live, adaptive deep-dive on ONE skill.
Your job is to establish the candidate's TRUE depth, not to be nice.

Rules:
- Ask exactly ONE question per turn. Never ask multiple.
- Start broad, then drill into the specifics of whatever they just said.
- If an answer is vague, hand-wavy, buzzword-y, or memorised, probe the gap directly
  ("you said X — walk me through exactly how X works under the hood").
- Follow the thread of THEIR answer; do not jump to unrelated subtopics.
- Detect hidden gaps: contradictions, missing edge cases, no mention of trade-offs.
- Stop when (a) you've confirmed genuine depth across 2-3 layers, or (b) you've hit
  a clear floor where they cannot go deeper. Aim for 4-7 questions; never exceed 8.
Return STRICT JSON only.`;

function sanitizeTurn(t) {
  if (!t || typeof t !== 'object') return null;
  const q = sanitize(String(t.q || ''), 600);
  const a = sanitize(String(t.a || ''), 2000);
  if (!q && !a) return null;
  return { q, a };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, skill, transcript } = req.body || {};
  if (!company || !role || !skill) return res.status(400).json({ error: 'company, role, skill required' });

  const safeTranscript = (Array.isArray(transcript) ? transcript : []).map(sanitizeTurn).filter(Boolean).slice(0, 12);
  const turnCount = safeTranscript.filter(t => t.a).length;

  const history = safeTranscript.length
    ? safeTranscript.map((t, i) => `Q${i + 1}: ${t.q}\nA${i + 1}: ${t.a || '(unanswered)'}`).join('\n\n')
    : '(no questions asked yet — produce the opening question)';

  const prompt = `Skill under examination: ${sanitize(skill, 80)}
Target: ${sanitize(role, 60)} at ${sanitize(company, 120)}
Questions answered so far: ${turnCount}

TRANSCRIPT:
${history}

Decide the next move. Return ONLY this JSON:
{
  "done": <true|false>,
  "nextQuestion": "<the single next question, or empty if done>",
  "probeReason": "<why you are asking this specific question — what gap you are testing, 1 sentence>",
  "gapDetected": "<the hidden gap exposed by their LAST answer, or empty if none yet>",
  "depthReached": <integer 1-5, how deep their demonstrated understanding goes>,
  "confidence": <integer 0-100, your confidence you now know their true level>,
  "verdict": "<only if done: 1-2 sentence honest assessment of their real depth>"
}
- If transcript is empty, set done=false and ask a strong opening question.
- Push depth before declaring done. Only set done=true when confidence >= 80 or you've hit a clear floor.`;

  try {
    const text = await callOpenAI(apiKey, SYSTEM, prompt, { temperature: 0.5, max_tokens: 700 });
    const result = extractJson(text);
    // hard cap: force completion after 8 answered turns
    if (turnCount >= 8) result.done = true;
    res.status(200).json({
      done: !!result.done,
      nextQuestion: sanitize(String(result.nextQuestion || ''), 600),
      probeReason: sanitize(String(result.probeReason || ''), 300),
      gapDetected: sanitize(String(result.gapDetected || ''), 300),
      depthReached: Math.max(1, Math.min(5, Math.round(Number(result.depthReached) || 1))),
      confidence: Math.max(0, Math.min(100, Math.round(Number(result.confidence) || 0))),
      verdict: sanitize(String(result.verdict || ''), 400),
    });
  } catch (e) {
    console.error('challenge error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Challenge failed. Please try again.' });
  }
}
