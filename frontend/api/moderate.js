const MAX_TEXT_LEN = 8000;
const CONTROL_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
const URL_RE = /\bhttps?:\/\/\S+|\bwww\.\S+/gi;

const PROFANITY_WORDS = new Set([
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy',
  'porn', 'xxx', 'nsfw', 'nude', 'naked', 'sex', 'erotic', 'escort',
  'rape', 'kill yourself', 'kys', 'retard',
]);
const ADULT_DOMAINS = new Set([
  'pornhub', 'xvideos', 'xhamster', 'redtube', 'onlyfans', 'chaturbate', 'youporn',
]);

function sanitize(text) {
  if (!text) return '';
  return String(text).replace(CONTROL_RE, '').trim().slice(0, MAX_TEXT_LEN);
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const text = sanitize(req.body?.text ?? '');
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

  res.status(200).json({ ok: flagged.length === 0, flagged });
}
