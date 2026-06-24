// ─── Depth Intelligence ──────────────────────────────────────────────────────
// A first-class model that separates two things a normal assessment conflates:
//
//   Coverage — do they know the topic at all?      (recognition / breadth)
//   Depth    — how many follow-up levels deep can   (defend under probing)
//              they actually defend it?
//
// Real interviews fail candidates not on coverage but on depth: they can say
// what RAG is, but not why embeddings hold negative values. This module turns
// the assessment's existing signals (objectiveScore = recognition, deepScore =
// recall) and the live depth-probe (deepest level passed) into that profile.

export const DEPTH_LEVELS = [
  { level: 1, name: 'Definition',  q: 'What is it?' },
  { level: 2, name: 'Motivation',  q: 'Why does it exist / why use it?' },
  { level: 3, name: 'Mechanism',   q: 'How does it work under the hood?' },
  { level: 4, name: 'Internals',   q: 'What do the internals / representations mean?' },
  { level: 5, name: 'Assumptions', q: 'What assumptions & trade-offs make it work?' },
];

export const levelName = (lvl) => (DEPTH_LEVELS.find(l => l.level === lvl)?.name) || `Level ${lvl}`;

// Deepest level genuinely passed (0-5) → a 0-100 Depth Score.
export const depthScore = (deepestLevel) => Math.round((Math.max(0, Math.min(5, deepestLevel)) / 5) * 100);

export const depthBand = (depth) => (depth >= 70 ? 'deep' : depth >= 40 ? 'partial' : 'shallow');
export const depthColor = (depth) => (depth >= 70 ? 'var(--diff-easy)' : depth >= 40 ? 'var(--diff-medium)' : 'var(--diff-hard)');

// Derive Coverage + Depth for a heatmap skill. Coverage leans on recognition
// (objectiveScore), Depth on recall/divergence (deepScore). Falls back to the
// blended score when a format wasn't present. If a live depth probe has run for
// this skill, its deepest level overrides the estimated depth.
export function coverageDepth(h, deepestLevel) {
  const coverage = Math.round(h?.objectiveScore ?? h?.score ?? 0);
  const depth = typeof deepestLevel === 'number'
    ? depthScore(deepestLevel)
    : Math.round(h?.deepScore ?? h?.score ?? 0);
  return { coverage, depth };
}

// Plain-English strength / weakness from the depth floor a candidate hits.
// `deepestLevel` is the last level they cleared (0-5).
export function describeDepth(skill, deepestLevel) {
  const s = skill || 'this topic';
  if (deepestLevel >= 5) {
    return {
      strength: `Defends ${s} all the way down — mechanism, internals and trade-offs.`,
      weakness: '',
    };
  }
  const floor = Math.max(0, Math.min(4, deepestLevel));
  const STRENGTH = {
    0: `Recognises ${s} but can't yet define it under questioning.`,
    1: `Can define ${s} clearly.`,
    2: `Explains ${s} and why it's used.`,
    3: `Explains how ${s} works at a mechanism level.`,
    4: `Explains the mechanism of ${s} in real detail.`,
  };
  const WEAKNESS = {
    0: `Falls apart at the definition — likely memorised the term, not the idea.`,
    1: `Knows what ${s} is, but not why it's used or where it fits.`,
    2: `Understands the motivation, but can't explain the underlying mechanism.`,
    3: `Explains the mechanism, but not what the internals / representations actually mean.`,
    4: `Handles internals, but can't reason about the assumptions and trade-offs that make ${s} work or break.`,
  };
  return { strength: STRENGTH[floor], weakness: WEAKNESS[floor] };
}

// The classic depth failure mode for a study-plan "common failure" line.
export const commonDepthFailure = (skill) =>
  `Understanding where ${skill || 'it'} is used without understanding how it works internally.`;
