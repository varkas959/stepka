// Shared security utilities for all API routes

const CONTROL_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;

// Strip control chars, trim, truncate
export function sanitize(text, max = 8000) {
  if (!text) return '';
  return String(text).replace(CONTROL_RE, '').trim().slice(0, max);
}

// ── PII detection + redaction ────────────────────────────────────────────────
// Masks personal data before it is sent to the LLM, stored, or shown publicly.
// Order matters: most-specific patterns first so they win the match.
const PII_PATTERNS = [
  { kind: 'api_key', re: /\b(?:sk|pk|rk|ghp|gho|xox[baprs])[-_][A-Za-z0-9_-]{12,}\b/g, mask: '[redacted-key]' },
  { kind: 'jwt',     re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{6,}\b/g, mask: '[redacted-token]' },
  { kind: 'email',   re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, mask: '[email]' },
  { kind: 'ssn',     re: /\b\d{3}-\d{2}-\d{4}\b/g, mask: '[id]' },
  { kind: 'aadhaar', re: /\b\d{4}\s\d{4}\s\d{4}\b/g, mask: '[id]' },
  { kind: 'pan',     re: /\b[A-Z]{5}\d{4}[A-Z]\b/g, mask: '[id]' },
  { kind: 'card',    re: /\b(?:\d[ -]?){13,16}\b/g, mask: '[card]' },
  { kind: 'phone',   re: /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}/g, mask: '[phone]' },
];

// Returns { clean, found: [{kind, count}] }. Only treats long digit runs as
// phone/card to avoid masking ordinary numbers in a JD ("5 years", "200ms").
export function redactPII(text) {
  if (!text) return { clean: '', found: [] };
  let out = String(text);
  const found = [];
  for (const { kind, re, mask } of PII_PATTERNS) {
    let count = 0;
    out = out.replace(re, (m) => {
      // For phone/card, require enough digits to be a real number
      if ((kind === 'phone' || kind === 'card')) {
        const digits = (m.match(/\d/g) || []).length;
        if (digits < (kind === 'card' ? 13 : 10)) return m;
      }
      count++;
      return mask;
    });
    if (count) found.push({ kind, count });
  }
  return { clean: out, found };
}

// ── Prompt-injection defense ─────────────────────────────────────────────────
// Heuristic detection of attempts to override instructions inside user text.
const INJECTION_RES = [
  /ignore\s+(?:all\s+|any\s+)?(?:the\s+)?(?:previous|above|prior|earlier|preceding)\s+(?:instruction|prompt|message|context|rule)/i,
  /disregard\s+(?:all\s+|the\s+)?(?:previous|above|prior)?\s*(?:instruction|prompt|rule)/i,
  /forget\s+(?:everything|all|previous|the\s+above)/i,
  /(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be|behave\s+like|roleplay\s+as)\b/i,
  /(?:new|updated|revised)\s+(?:system\s+)?(?:instruction|prompt|directive)/i,
  /(?:reveal|print|show|repeat|output)\s+(?:your|the)\s+(?:system\s+)?(?:prompt|instruction)/i,
  /(?:developer|god|jailbreak|dan)\s+mode/i,
  /^\s*(?:system|assistant|developer)\s*[:>]/im,   // fake role turns
  /<\/?(?:system|assistant|instruction)s?>/i,       // fake role tags
];

export function detectInjection(text) {
  if (!text) return { suspected: false, matches: [] };
  const matches = [];
  for (const re of INJECTION_RES) {
    const m = String(text).match(re);
    if (m) matches.push(m[0].slice(0, 60));
  }
  return { suspected: matches.length > 0, matches };
}

// Wrap untrusted user text so the model treats it strictly as data. Neutralizes
// delimiter-spoofing by stripping our fence token from the content first.
export function wrapUntrusted(label, text) {
  const nonce = Math.random().toString(36).slice(2, 10);
  const fence = `===${label.toUpperCase()}_${nonce}===`;
  const body = String(text || '').split(fence).join(''); // can't forge our fence
  return { fence, block: `${fence}\n${body}\n${fence}` };
}

// One-shot: sanitize → redact PII → flag injection. For LLM-bound free text.
export function safeForLLM(text, max = 8000) {
  const s = sanitize(text, max);
  const { clean, found } = redactPII(s);
  const { suspected, matches } = detectInjection(clean);
  return { clean, pii: found, injection: suspected, injectionMatches: matches };
}

// ── CORS origin guard ────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  'https://www.stepkai.com',
  'https://stepkai.com',
  'http://localhost:3000',
  'http://localhost:5173',
]);

export function checkOrigin(req, res) {
  const origin = req.headers.origin;
  // No origin header = same-origin or server-to-server — allow
  if (!origin) return true;
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    return true;
  }
  res.status(403).json({ error: 'Forbidden' });
  return false;
}

// ── In-process rate limiter (per serverless instance, best-effort) ───────────
// For production-grade limiting add Upstash Redis with @upstash/ratelimit
const ipWindows = new Map(); // ip → { count, resetAt }
const RATE_LIMIT = 20;        // requests per window per IP
const WINDOW_MS  = 60_000;    // 1 minute

export function checkRateLimit(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';

  const now = Date.now();
  const entry = ipWindows.get(ip);

  if (!entry || now > entry.resetAt) {
    ipWindows.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) {
    res.setHeader('Retry-After', '60');
    res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    return false;
  }
  return true;
}

// ── Prompt injection hardening ───────────────────────────────────────────────
const VALID_BANDS = new Set(['Strong', 'Interview Ready', 'Needs Improvement', 'Weak', 'Critical Gap']);
const VALID_Q_TYPES = new Set(['mcq', 'scenario_selection', 'ranking', 'free_text']);

// Validate and sanitize a heatmap item from request body
export function sanitizeHeatmapItem(item) {
  if (!item || typeof item !== 'object') return null;
  const skill = sanitize(String(item.skill || ''), 80);
  if (!skill) return null;
  const score = Math.max(0, Math.min(100, Math.round(Number(item.score) || 0)));
  const band  = VALID_BANDS.has(item.band) ? item.band : 'Weak';
  return { skill, score, band };
}

// Validate and sanitize a competency item (name + weight)
export function sanitizeCompetency(item) {
  if (!item || typeof item !== 'object') return null;
  const name   = sanitize(String(item.name || ''), 80);
  if (!name) return null;
  const weight = Math.max(1, Math.min(5, Math.round(Number(item.weight) || 3)));
  return { name, weight };
}

// Validate and sanitize a QA item from the assessment response
export function sanitizeQAItem(item) {
  if (!item || typeof item !== 'object') return null;
  const type = VALID_Q_TYPES.has(item.type) ? item.type : null;
  if (!type) return null;
  return {
    id:                 sanitize(String(item.id || ''), 40),
    type,
    competency:         sanitize(String(item.competency || ''), 80),
    question:           sanitize(String(item.question || ''), 600),
    correctAnswer:      sanitize(String(item.correctAnswer || ''), 10),
    correctOrder:       Array.isArray(item.correctOrder)
                          ? item.correctOrder.map(s => sanitize(String(s), 120)).slice(0, 10)
                          : [],
    evaluation_criteria: Array.isArray(item.evaluation_criteria)
                          ? item.evaluation_criteria.map(s => sanitize(String(s), 200)).slice(0, 5)
                          : [],
    // User-supplied answers — sanitize and cap
    candidateAnswer:    sanitize(String(item.candidateAnswer || ''), 2000),
    candidateOrder:     Array.isArray(item.candidateOrder)
                          ? item.candidateOrder.map(s => sanitize(String(s), 120)).slice(0, 10)
                          : [],
  };
}

// Wrap OpenAI call with shared config
export async function callOpenAI(apiKey, system, user, { temperature = 0.3, max_tokens = 2000 } = {}) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user },
      ],
      temperature,
      max_tokens,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(`OpenAI ${res.status}: ${data?.error?.message || ''}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

// Batched embeddings (text-embedding-3-small, 1536 dims). One call for many texts.
export async function embedBatch(apiKey, texts) {
  const input = (Array.isArray(texts) ? texts : [texts]).map(t => String(t || '').slice(0, 8000));
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(`OpenAI embed ${res.status}: ${data?.error?.message || ''}`);
  }
  // Return one vector (as a pgvector literal string) per input, in order.
  return (data.data || []).sort((a, b) => a.index - b.index).map(d => `[${d.embedding.join(',')}]`);
}

export function extractJson(text) {
  text = text.trim();
  const fence = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fence) return JSON.parse(fence[1]);
  const m = text.match(/\{[\s\S]*\}/);
  if (m) return JSON.parse(m[0]);
  return JSON.parse(text);
}
