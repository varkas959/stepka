// SEO feedback loop — "verify" + "learn" step.
//
// Pulls real Google Search Console performance data (clicks, impressions,
// CTR, position) for stepkai.com, diffs it against the previous period, and
// writes a markdown report highlighting concrete next actions:
//   - Page-2 opportunities: queries ranking 11-20 (close, worth pushing to page 1)
//   - Low-CTR pages: high impressions but a CTR below what that position should get
//     (usually a weak title/meta description, not a ranking problem)
//   - Rising / falling queries vs. the prior period
//   - Sitemap pages with zero impressions (not attracting search demand, or not
//     indexed yet — cross-check in GSC's Page Indexing report)
//
// One-time setup required (see SETUP.md in this folder):
//   1. Create a Google Cloud project + service account, enable the
//      "Google Search Console API".
//   2. Download the service account's JSON key, save it as
//      frontend/gsc-service-account.json (gitignored — never commit it).
//   3. In Search Console (search.google.com/search-console) → Settings →
//      Users and permissions → Add user → paste the service account's
//      email (looks like ...@...iam.gserviceaccount.com) → Restricted (read-only is enough).
//
// Usage:
//   node scripts/seo-loop.mjs                 (last 28 days vs prior 28 days)
//   node scripts/seo-loop.mjs --days=90        (custom window)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleAuth } from 'google-auth-library';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const KEY_PATH = path.join(ROOT, 'gsc-service-account.json');
const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:stepkai.com';
const REPORTS_DIR = path.join(ROOT, 'seo-reports');

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v ?? true];
}));
const WINDOW_DAYS = parseInt(args.days, 10) || 28;

function fmtDate(d) { return d.toISOString().split('T')[0]; }

function dateRange(daysAgoStart, daysAgoEnd) {
  const end = new Date(); end.setDate(end.getDate() - daysAgoEnd);
  const start = new Date(); start.setDate(start.getDate() - daysAgoStart);
  return { startDate: fmtDate(start), endDate: fmtDate(end) };
}

async function main() {
  if (!fs.existsSync(KEY_PATH)) {
    console.error(`\n[seo-loop] Missing ${KEY_PATH}`);
    console.error('[seo-loop] See scripts/SEO_LOOP_SETUP.md for the one-time setup steps.\n');
    process.exit(1);
  }

  const auth = new GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const client = await auth.getClient();

  async function query(body) {
    const res = await client.request({
      url: `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
      method: 'POST',
      data: body,
    });
    return res.data.rows || [];
  }

  console.log(`[seo-loop] Fetching last ${WINDOW_DAYS}d vs prior ${WINDOW_DAYS}d for ${SITE_URL}...`);

  const current = dateRange(WINDOW_DAYS, 0);
  const prior = dateRange(WINDOW_DAYS * 2, WINDOW_DAYS);

  const [queryRowsNow, pageRowsNow, queryRowsPrior] = await Promise.all([
    query({ ...current, dimensions: ['query'], rowLimit: 5000 }),
    query({ ...current, dimensions: ['page'], rowLimit: 5000 }),
    query({ ...prior, dimensions: ['query'], rowLimit: 5000 }),
  ]);

  const priorByQuery = Object.fromEntries(queryRowsPrior.map(r => [r.keys[0], r]));

  // ── Page-2 opportunities: position 11-20, meaningful impressions ──
  const page2 = queryRowsNow
    .filter(r => r.position >= 11 && r.position <= 20 && r.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);

  // ── Low-CTR pages: expected CTR by position bucket (rough industry curve) ──
  const expectedCTR = pos => pos <= 1 ? 0.28 : pos <= 3 ? 0.15 : pos <= 5 ? 0.07 : pos <= 10 ? 0.03 : 0.01;
  const lowCTR = pageRowsNow
    .filter(r => r.impressions >= 20)
    .map(r => ({ ...r, expected: expectedCTR(r.position), gap: expectedCTR(r.position) - r.ctr }))
    .filter(r => r.gap > 0.02)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);

  // ── Movers: biggest position change vs prior period ──
  const movers = queryRowsNow
    .filter(r => priorByQuery[r.keys[0]] && r.impressions >= 5)
    .map(r => ({ query: r.keys[0], now: r.position, before: priorByQuery[r.keys[0]].position, impressions: r.impressions }))
    .map(r => ({ ...r, delta: r.before - r.now })) // positive = improved (moved up)
    .sort((a, b) => b.delta - a.delta);
  const improved = movers.filter(m => m.delta >= 3).slice(0, 15);
  const declined = movers.filter(m => m.delta <= -3).sort((a, b) => a.delta - b.delta).slice(0, 15);

  // ── Sitemap pages with zero impressions ──
  let sitemapUrls = [];
  const sitemapPath = path.join(ROOT, 'build', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    sitemapUrls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  }
  const seenPages = new Set(pageRowsNow.map(r => r.keys[0]));
  const zeroImpression = sitemapUrls.filter(u => !seenPages.has(u)).slice(0, 40);

  // ── Totals for the headline ──
  const totalClicksNow = queryRowsNow.reduce((s, r) => s + r.clicks, 0);
  const totalClicksPrior = queryRowsPrior.reduce((s, r) => s + r.clicks, 0);
  const totalImprNow = queryRowsNow.reduce((s, r) => s + r.impressions, 0);
  const totalImprPrior = queryRowsPrior.reduce((s, r) => s + r.impressions, 0);

  // ── Write report ──
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const today = fmtDate(new Date());
  const reportPath = path.join(REPORTS_DIR, `${today}.md`);

  const pct = (now, before) => before === 0 ? 'n/a' : `${(((now - before) / before) * 100).toFixed(0)}%`;

  const md = `# SEO Loop Report — ${today}

Window: last ${WINDOW_DAYS} days (${current.startDate} to ${current.endDate}) vs prior ${WINDOW_DAYS} days (${prior.startDate} to ${prior.endDate})

## Headline
- Clicks: **${totalClicksNow}** (prior: ${totalClicksPrior}, ${pct(totalClicksNow, totalClicksPrior)})
- Impressions: **${totalImprNow}** (prior: ${totalImprPrior}, ${pct(totalImprNow, totalImprPrior)})
- Tracked queries with impressions: ${queryRowsNow.length}
- Tracked pages with impressions: ${pageRowsNow.length}
- Sitemap URLs with zero impressions: ${zeroImpression.length} / ${sitemapUrls.length}

## Page-2 opportunities (position 11-20 — closest to page-1 payoff)
${page2.length ? page2.map(r => `- **${r.keys[0]}** — pos ${r.position.toFixed(1)}, ${r.impressions} impressions, ${r.clicks} clicks`).join('\n') : '_None found in this window._'}

## Low-CTR pages (ranking OK, but title/meta likely underselling the click)
${lowCTR.length ? lowCTR.map(r => `- **${r.keys[0]}** — pos ${r.position.toFixed(1)}, CTR ${(r.ctr * 100).toFixed(1)}% (expected ~${(r.expected * 100).toFixed(0)}%), ${r.impressions} impressions`).join('\n') : '_None found in this window._'}

## Rising queries (moved up ≥3 positions)
${improved.length ? improved.map(m => `- **${m.query}** — ${m.before.toFixed(1)} → ${m.now.toFixed(1)} (${m.impressions} impressions)`).join('\n') : '_None found in this window._'}

## Declining queries (moved down ≥3 positions — investigate)
${declined.length ? declined.map(m => `- **${m.query}** — ${m.before.toFixed(1)} → ${m.now.toFixed(1)} (${m.impressions} impressions)`).join('\n') : '_None found in this window._'}

## Sitemap pages with zero impressions (sample of ${Math.min(40, zeroImpression.length)})
${zeroImpression.length ? zeroImpression.map(u => `- ${u}`).join('\n') : '_All sitemap pages have some impressions._'}
`;

  fs.writeFileSync(reportPath, md, 'utf-8');
  console.log(`[seo-loop] Report written to ${reportPath}`);
  console.log(md);
}

main().catch(e => {
  console.error('[seo-loop] Failed:', e.response?.data || e.message);
  process.exit(1);
});
