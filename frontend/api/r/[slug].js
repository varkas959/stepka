import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scoreColor(s) {
  return s >= 75 ? '#22C55E' : s >= 50 ? '#F59E0B' : '#EF4444';
}

function scoreLabel(s) {
  return s >= 75 ? 'Loop Ready' : s >= 50 ? 'Interview Ready' : 'Needs Prep';
}

function prepLabel(weeks) {
  if (!weeks) return '3–5 weeks';
  if (weeks === 1) return '1 week · 30 min/day';
  return `${weeks} weeks · 45 min/day`;
}

function buildHtml(report) {
  const { company, role, readiness, heatmap = [], summary, prep_weeks, slug, created_at } = report;
  const strengths = heatmap.filter(h => h.score >= 65).slice(0, 4);
  const gaps = heatmap.filter(h => h.score < 50).sort((a, b) => a.score - b.score).slice(0, 4);
  const scoreClr = scoreColor(readiness);
  const date = new Date(created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const url = `https://www.stepkai.com/r/${slug}`;
  const ogTitle = `${esc(company)} ${esc(role)} · ${readiness}% Readiness · Stepkai`;
  const ogDesc = [
    strengths.length ? `Strengths: ${strengths.map(s => s.skill).join(', ')}.` : '',
    gaps.length ? `Gaps: ${gaps.map(g => g.skill).join(', ')}.` : '',
    `Estimated prep: ${prepLabel(prep_weeks)}.`,
  ].filter(Boolean).join(' ');

  const strengthRows = strengths.map(s => `
    <div class="skill-row">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="skill-name">${esc(s.skill)}</span>
      <span class="skill-score" style="color:#22C55E">${s.score}%</span>
    </div>`).join('');

  const gapRows = gaps.map(s => `
    <div class="skill-row">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/></svg>
      <span class="skill-name">${esc(s.skill)}</span>
      <span class="skill-score" style="color:#EF4444">${s.score}%</span>
    </div>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${ogTitle}</title>
  <meta name="description" content="${esc(ogDesc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${esc(ogDesc)}">
  <meta property="og:image" content="https://www.stepkai.com/og-image.png">
  <meta property="og:site_name" content="Stepkai">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${esc(ogDesc)}">
  <meta name="twitter:image" content="https://www.stepkai.com/og-image.png">
  <link rel="canonical" href="${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { min-height: 100%; background: #0C0E14; color: #F2F2F4; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 32px 16px 64px; }
    .report { width: 100%; max-width: 520px; border: 1px solid #272B3F; border-radius: 12px; overflow: hidden; background: #141720; }
    .rh { background: #0C0E14; border-bottom: 1px solid #272B3F; padding: 11px 20px; display: flex; align-items: center; justify-content: space-between; }
    .rh-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #4B5270; }
    .candidate { padding: 18px 20px; border-bottom: 1px solid #272B3F; }
    .c-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
    .c-company { font-size: 18px; font-weight: 600; color: #F2F2F4; }
    .c-role { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #4B5270; margin-top: 4px; }
    .score-num { font-family: 'JetBrains Mono', monospace; font-size: 44px; font-weight: 600; line-height: 1; text-align: right; }
    .score-lbl { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; text-align: right; margin-top: 5px; }
    .gauge-track { height: 3px; background: #1C2030; border-radius: 2px; margin-top: 14px; overflow: hidden; }
    .gauge-fill { height: 100%; border-radius: 2px; }
    .gaps-note { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4B5270; margin-top: 8px; }
    .skills-grid { display: grid; grid-template-columns: 1fr 1fr; }
    .skills-col { padding: 16px 20px; border-bottom: 1px solid #272B3F; }
    .skills-col:first-child { border-right: 1px solid #272B3F; }
    .skills-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 12px; }
    .skill-row { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; }
    .skill-row:last-child { margin-bottom: 0; }
    .skill-name { font-size: 12px; color: #8B8FA8; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .skill-score { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; margin-left: auto; flex-shrink: 0; }
    .prep { padding: 14px 20px; background: #0C0E14; display: flex; align-items: center; justify-content: space-between; }
    .prep-lbl { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #4B5270; }
    .prep-val { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #F2F2F4; margin-top: 4px; }
    .summary { padding: 14px 20px; font-size: 13px; color: #8B8FA8; line-height: 1.65; border-top: 1px solid #272B3F; }
    .cta-block { margin-top: 28px; width: 100%; max-width: 520px; text-align: center; }
    .cta-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #4B5270; margin-bottom: 14px; }
    .cta-btn { display: inline-flex; align-items: center; gap: 9px; background: #3B6FD4; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
    .cta-btn:hover { opacity: 0.88; }
    .brand { margin-top: 36px; display: flex; align-items: center; gap: 8px; }
    .brand-mark { width: 22px; height: 22px; background: #3B6FD4; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #fff; }
    .brand-name { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #4B5270; }
    @media (max-width: 480px) {
      .score-num { font-size: 36px; }
      .skills-grid { grid-template-columns: 1fr; }
      .skills-col:first-child { border-right: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="report">
      <div class="rh">
        <span class="rh-label mono">Readiness Report</span>
        <span class="rh-label mono">${date}</span>
      </div>
      <div class="candidate">
        <div class="c-row">
          <div>
            <div class="c-company">${esc(company)}</div>
            <div class="c-role mono">${esc(role)} &middot; Technical loop</div>
          </div>
          <div>
            <div class="score-num" style="color:${scoreClr}">${readiness}<span style="font-size:22px">%</span></div>
            <div class="score-lbl mono" style="color:${scoreClr}">${scoreLabel(readiness)}</div>
          </div>
        </div>
        <div class="gauge-track"><div class="gauge-fill" style="width:${readiness}%;background:${scoreClr}"></div></div>
        <div class="gaps-note mono">${gaps.length > 0 ? `${gaps.length} gap${gaps.length > 1 ? 's' : ''} to close before loop` : 'Ready to interview'}</div>
      </div>
      <div class="skills-grid">
        <div class="skills-col">
          <div class="skills-eyebrow mono" style="color:#22C55E">Strengths</div>
          ${strengthRows || '<div class="skill-row"><span class="skill-name">Complete assessment to see</span></div>'}
        </div>
        <div class="skills-col">
          <div class="skills-eyebrow mono" style="color:#EF4444">Weak Areas</div>
          ${gapRows || '<div class="skill-row"><span class="skill-name">No critical gaps found</span></div>'}
        </div>
      </div>
      <div class="prep">
        <div>
          <div class="prep-lbl mono">Estimated Preparation</div>
          <div class="prep-val mono">${prepLabel(prep_weeks)}</div>
        </div>
        <a href="https://www.stepkai.com/app/plan" class="rh-label mono" style="color:#3B6FD4;text-decoration:none">Start assessment &rarr;</a>
      </div>
      ${summary ? `<div class="summary">${esc(summary)}</div>` : ''}
    </div>

    <div class="cta-block">
      <div class="cta-eyebrow mono">Know your readiness before your next interview.</div>
      <a href="https://www.stepkai.com/app/plan" class="cta-btn">
        Measure your readiness
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>

    <div class="brand">
      <div class="brand-mark mono">S</div>
      <span class="brand-name mono">stepkai.com</span>
    </div>
  </div>
</body>
</html>`;
}

const NOT_FOUND_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Report Not Found · Stepkai</title><style>body{background:#0C0E14;color:#F2F2F4;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;gap:0}</style></head><body><div><p style="color:#4B5270;font-size:14px;margin-bottom:12px">This report does not exist or has been removed.</p><a href="https://www.stepkai.com" style="color:#3B6FD4;text-decoration:none;font-size:13px">← stepkai.com</a></div></body></html>`;

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug || !/^[a-z0-9]{6,12}$/.test(slug)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(NOT_FOUND_HTML);
  }

  const { data, error } = await supabase
    .from('readiness_reports')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');

  if (error || !data) return res.status(404).send(NOT_FOUND_HTML);

  return res.status(200).send(buildHtml(data));
}