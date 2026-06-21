// ─── Client-side guardrails ────────────────────────────────────────────────
// Mirrors api/_security.js. Used to redact PII before anything user-submitted
// is written to Supabase or shown publicly. The /moderate endpoint blocks PII
// at submit time; this is defense-in-depth so stored/public text stays clean
// even if a value slips through or the moderate call is bypassed.

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

export function redactPII(text) {
  if (!text) return { clean: '', found: [] };
  let out = String(text);
  const found = [];
  for (const { kind, re, mask } of PII_PATTERNS) {
    let count = 0;
    out = out.replace(re, (m) => {
      if (kind === 'phone' || kind === 'card') {
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

// Convenience: redact and return just the clean string.
export const clean = (text) => redactPII(text).clean;

// Did this text contain any PII? (for warning before submit)
export function hasPII(text) {
  return redactPII(text).found.length > 0;
}
