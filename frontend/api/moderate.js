import { sanitize, checkOrigin, checkRateLimit, redactPII, detectInjection } from './_security.js';

const URL_RE = /\bhttps?:\/\/\S+|\bwww\.\S+/gi;
const PROFANITY_WORDS = new Set([
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy',
  'porn', 'xxx', 'nsfw', 'nude', 'naked', 'sex', 'erotic', 'escort',
  'rape', 'kill yourself', 'kys', 'retard',
]);
const ADULT_DOMAINS = new Set([
  'pornhub', 'xvideos', 'xhamster', 'redtube', 'onlyfans', 'chaturbate', 'youporn',
]);

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const text  = sanitize(req.body?.text ?? '');
  const lower = text.toLowerCase();
  const flagged = [];

  for (const word of PROFANITY_WORDS) {
    if (lower.includes(word)) flagged.push({ kind: 'profanity', match: word });
  }

  const urls = text.match(URL_RE) || [];
  if (urls.length) {
    flagged.push({ kind: 'url', match: urls.slice(0, 3).join(', ') });
    for (const domain of ADULT_DOMAINS) {
      if (urls.some(u => u.toLowerCase().includes(domain))) {
        flagged.push({ kind: 'adult_domain', match: domain });
        break;
      }
    }
  }

  // PII — flag so the client can ask the user to remove it before submitting
  const { found } = redactPII(text);
  for (const { kind, count } of found) {
    flagged.push({ kind: 'pii', match: `${kind} (${count})` });
  }

  // Prompt injection in submitted content
  const { suspected, matches } = detectInjection(text);
  if (suspected) flagged.push({ kind: 'injection', match: matches[0] });

  res.status(200).json({ ok: flagged.length === 0, flagged });
}
