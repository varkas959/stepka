import { sanitize, checkOrigin, checkRateLimit, callOpenAI, extractJson } from './_security.js';

// Adaptive interviewer with two modes (stateless — client replays the transcript):
//   mode = 'readiness' (default) — free adaptive deep-dive on one skill.
//   mode = 'depth' — Depth Intelligence: walks a fixed 5-level depth ladder and
//     escalates ONLY while the candidate keeps clearing levels, recording the
//     deepest level genuinely passed (the Depth Score).

const READINESS_SYSTEM = `You are a senior technical interviewer running a live, adaptive deep-dive on ONE skill.
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

const DEPTH_LEVELS = {
  1: 'Definition (what is it?)',
  2: 'Motivation (why does it exist / why use it?)',
  3: 'Mechanism (how does it work under the hood?)',
  4: 'Internals (what do the internals / representations mean?)',
  5: 'Assumptions (what assumptions, edge cases and trade-offs make it work or break?)',
};

const DEPTH_SYSTEM = `You are a senior interviewer measuring a candidate's TRUE DEPTH on ONE skill, not their recall.
You walk a fixed 5-level depth ladder and escalate ONLY while they keep clearing levels:
1 Definition, 2 Motivation, 3 Mechanism, 4 Internals/representation, 5 Assumptions/trade-offs.

Rules:
- Ask exactly ONE question, targeting the candidate's NEXT level.
- Grade their most recent answer strictly against the level it targeted. A confident-sounding but
  hand-wavy, buzzword, or use-case-only answer FAILS a mechanism/internals/assumptions level.
- The next question must drill into the SPECIFIC thing they just said, one level deeper.
- Stop the moment an answer fails its level (their depth floor), or after level 5 is passed.
Return STRICT JSON only.`;

function sanitizeTurn(t) {
  if (!t || typeof t !== 'object') return null;
  const q = sanitize(String(t.q || ''), 600);
  const a = sanitize(String(t.a || ''), 2000);
  if (!q && !a) return null;
  const level = Math.max(1, Math.min(5, Math.round(Number(t.level) || 1)));
  return { q, a, level };
}

function handleDepth({ company, role, skill, turns }, apiKey, res) {
  const answered = turns.filter(t => t.a);
  const lastLevel = answered.length ? answered[answered.length - 1].level : 0;
  const history = turns.length
    ? turns.map(t => `[Level ${t.level} · ${DEPTH_LEVELS[t.level]}]\nQ: ${t.q}\nA: ${t.a || '(unanswered)'}`).join('\n\n')
    : '(no questions yet — produce the Level 1 opening question)';

  const prompt = `Skill under examination: ${sanitize(skill, 80)}
${company ? `Target: ${sanitize(role, 60)} at ${sanitize(company, 120)}` : ''}
Levels answered so far: ${answered.length} (deepest asked: level ${lastLevel || 0})

TRANSCRIPT:
${history}

Grade their LAST answer (if any) against its level, then decide the next move. Return ONLY this JSON:
{
  "lastAnswerPassed": <true|false>,
  "deepestPassed": <integer 0-5, the deepest level they have genuinely cleared so far>,
  "done": <true|false>,
  "nextLevel": <integer 1-5, the level of the next question>,
  "nextQuestion": "<the single next question, or empty if done>",
  "feedback": "<1 sentence on why the last answer passed or failed its level>",
  "weakness": "<if failed: the specific thing they could not explain; else empty>",
  "verdict": "<only if done: 1-2 sentence honest read of how deep they really go>"
}
- If transcript is empty: done=false, nextLevel=1, ask the Level 1 question.
- Set done=true the instant an answer fails its level, OR once level 5 is passed.`;

  return callOpenAI(apiKey, DEPTH_SYSTEM, prompt, { temperature: 0.4, max_tokens: 700 }).then(text => {
    const r = extractJson(text);
    const deepest = Math.max(0, Math.min(5, Math.round(Number(r.deepestPassed) || 0)));
    res.status(200).json({
      mode: 'depth',
      lastAnswerPassed: !!r.lastAnswerPassed,
      deepestPassed: deepest,
      done: !!r.done || deepest >= 5,
      nextLevel: Math.max(1, Math.min(5, Math.round(Number(r.nextLevel) || 1))),
      nextQuestion: sanitize(String(r.nextQuestion || ''), 600),
      feedback: sanitize(String(r.feedback || ''), 300),
      weakness: sanitize(String(r.weakness || ''), 300),
      verdict: sanitize(String(r.verdict || ''), 400),
    });
  });
}

function handleReadiness({ company, role, skill, turns }, apiKey, res) {
  const turnCount = turns.filter(t => t.a).length;
  const history = turns.length
    ? turns.map((t, i) => `Q${i + 1}: ${t.q}\nA${i + 1}: ${t.a || '(unanswered)'}`).join('\n\n')
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

  return callOpenAI(apiKey, READINESS_SYSTEM, prompt, { temperature: 0.5, max_tokens: 700 }).then(text => {
    const result = extractJson(text);
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
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured.' });

  const { company, role, skill, transcript, mode } = req.body || {};
  if (!skill) return res.status(400).json({ error: 'skill required' });
  if (mode !== 'depth' && (!company || !role)) return res.status(400).json({ error: 'company, role, skill required' });

  const turns = (Array.isArray(transcript) ? transcript : []).map(sanitizeTurn).filter(Boolean).slice(0, 12);
  const args = { company, role, skill, turns };

  try {
    if (mode === 'depth') return await handleDepth(args, apiKey, res);
    return await handleReadiness(args, apiKey, res);
  } catch (e) {
    console.error('challenge error:', e.message);
    if (e.message === 'QUOTA_EXCEEDED') return res.status(429).json({ error: 'API quota reached. Try again shortly.' });
    res.status(502).json({ error: 'Challenge failed. Please try again.' });
  }
}
