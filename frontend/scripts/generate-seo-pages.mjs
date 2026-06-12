// Post-build static SEO page generator for Stepkai
// Generates /questions/[company-tech]/, /questions/company/[company]/, etc.
// Outputs to frontend/build/ — Vercel serves these before the SPA fallback

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(__dirname, '..', 'build');
const DATA  = JSON.parse(fs.readFileSync(path.join(__dirname, 'seo-data.json'), 'utf-8'));

const { COMPANIES, QUESTIONS, TECH_STACK } = DATA;

const slug   = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const esc    = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const trunc  = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;

const COMPANY_MAP = Object.fromEntries(COMPANIES.map(c => [c.id, c]));
const YEAR = new Date().getFullYear();

// ── Track all generated URLs for sitemap ────────────────────────────────────
const sitemapUrls = [];
function write(relPath, html) {
  const abs = path.join(BUILD, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, html, 'utf-8');
  const url = '/' + relPath.replace(/index\.html$/, '').replace(/\\/g, '/');
  sitemapUrls.push(url);
}

// ── Base HTML shell ──────────────────────────────────────────────────────────
function shell({ title, desc, canonical, h1, bodyHtml, faqItems = [], breadcrumb = [] }) {
  const faqSchema = faqItems.length ? `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [${faqItems.map(f => `
    {
      "@type": "Question",
      "name": ${JSON.stringify(f.q)},
      "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(f.a)} }
    }`).join(',')}
  ]
}
</script>` : '';

  const crumbs = [{ label: 'Stepkai', href: '/' }, ...breadcrumb];
  const breadcrumbSchema = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [${crumbs.map((c, i) => `
    { "@type": "ListItem", "position": ${i + 1}, "name": ${JSON.stringify(c.label)}, "item": "https://www.stepkai.com${c.href}" }`).join(',')}
  ]
}
</script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} | Stepkai</title>
<meta name="description" content="${esc(trunc(desc, 155))}" />
<link rel="canonical" href="https://www.stepkai.com${canonical}" />
<meta property="og:title" content="${esc(title)} | Stepkai" />
<meta property="og:description" content="${esc(trunc(desc, 155))}" />
<meta property="og:url" content="https://www.stepkai.com${canonical}" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://www.stepkai.com/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)} | Stepkai" />
<meta name="twitter:description" content="${esc(trunc(desc, 155))}" />
<meta name="robots" content="index, follow" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MY36EXDRBM"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-MY36EXDRBM');</script>
${faqSchema}
${breadcrumbSchema}
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#09090b;color:#f4f4f5;line-height:1.6}
a{color:#f59e0b;text-decoration:none}a:hover{text-decoration:underline}
.nav{border-bottom:1px solid rgba(255,255,255,.06);background:rgba(9,9,11,.9);backdrop-filter:blur(8px);position:sticky;top:0;z-index:30;padding:0 24px}
.nav-inner{max-width:900px;margin:0 auto;height:56px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.logo{display:flex;align-items:center;gap:8px;font-family:monospace;font-weight:700;font-size:15px;color:#f4f4f5;text-decoration:none}
.logo-badge{width:28px;height:28px;border-radius:6px;background:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:11px;color:#09090b;font-weight:800}
.cta{font-family:monospace;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;padding:8px 16px;border-radius:6px;background:#f59e0b;color:#09090b;text-decoration:none;white-space:nowrap}
.cta:hover{brightness:1.1;text-decoration:none}
main{max-width:900px;margin:0 auto;padding:40px 24px 80px}
.breadcrumb{font-family:monospace;font-size:12px;color:#52525b;margin-bottom:24px}
.breadcrumb a{color:#71717a;text-decoration:none}.breadcrumb a:hover{color:#f4f4f5}
.breadcrumb span{margin:0 6px;color:#3f3f46}
h1{font-size:clamp(28px,5vw,44px);font-weight:700;letter-spacing:-.02em;line-height:1.15;margin-bottom:12px}
.subtitle{color:#a1a1aa;font-size:15px;max-width:680px;margin-bottom:32px;line-height:1.7}
.stat-row{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:40px}
.stat{font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:.14em;padding:6px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.1);color:#a1a1aa}
.stat b{color:#f4f4f5}
h2{font-size:20px;font-weight:600;margin:40px 0 20px;letter-spacing:-.01em;color:#f4f4f5;border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:10px}
.q-card{border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:20px 22px;margin-bottom:14px;background:#0c0c0f;transition:border-color .15s}
.q-card:hover{border-color:rgba(255,255,255,.18)}
.q-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.tag{font-family:monospace;font-size:10px;padding:3px 8px;border-radius:4px;border:1px solid rgba(255,255,255,.1);color:#71717a}
.tag.diff-Hard{border-color:#ef444440;color:#ef4444;background:#ef444408}
.tag.diff-Medium{border-color:#f59e0b40;color:#f59e0b;background:#f59e0b08}
.tag.diff-Easy{border-color:#22c55e40;color:#22c55e;background:#22c55e08}
.q-body{font-size:14px;color:#d4d4d8;line-height:1.75}
.q-meta{margin-top:12px;font-family:monospace;font-size:11px;color:#52525b}
.practice-cta{margin:44px 0;padding:24px 28px;border-radius:12px;border:1px solid rgba(245,158,11,.25);background:rgba(245,158,11,.04)}
.practice-cta h3{font-size:18px;font-weight:600;margin-bottom:8px}
.practice-cta p{color:#a1a1aa;font-size:14px;margin-bottom:16px}
.pill-grid{display:flex;flex-wrap:wrap;gap:8px}
.pill{font-family:monospace;font-size:12px;padding:6px 14px;border-radius:6px;border:1px solid rgba(255,255,255,.1);color:#a1a1aa;text-decoration:none}
.pill:hover{border-color:rgba(255,255,255,.25);color:#f4f4f5;text-decoration:none}
.pill.accent{border-color:rgba(245,158,11,.4);color:#f59e0b}
footer{border-top:1px solid rgba(255,255,255,.06);padding:32px 24px;text-align:center;font-family:monospace;font-size:12px;color:#3f3f46}
footer a{color:#52525b}
@media(max-width:600px){main{padding:24px 16px 60px}.nav{padding:0 16px}}
</style>
</head>
<body>
<nav class="nav"><div class="nav-inner">
  <a href="/" class="logo"><div class="logo-badge">sk</div>Stepkai</a>
  <a href="/app/questions" class="cta">Practice free →</a>
</div></nav>
<main>
${breadcrumb.length ? `<div class="breadcrumb">
  <a href="/">Home</a>${breadcrumb.map(c => `<span>/</span><a href="${c.href}">${esc(c.label)}</a>`).join('')}
</div>` : ''}
<h1>${esc(h1)}</h1>
${bodyHtml}
</main>
<footer>
  <p>&copy; ${YEAR} Stepkai &middot; <a href="/">Home</a> &middot; <a href="/app/questions">Question Bank</a> &middot; <a href="/app/study-plan">Study Plan</a> &middot; <a href="/questions/">Browse All</a></p>
  <p style="margin-top:8px">Real interview questions from engineers who cleared the loop.</p>
</footer>
</body></html>`;
}

// ── Question card HTML ───────────────────────────────────────────────────────
function qCard(q, idx) {
  const co = COMPANY_MAP[q.company];
  const techTags = (q.tech || []).slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  return `<div class="q-card">
  <div class="q-tags">
    ${co ? `<span class="tag" style="color:${co.color};border-color:${co.color}40">${esc(co.name)}</span>` : ''}
    <span class="tag diff-${esc(q.difficulty)}">${esc(q.difficulty)}</span>
    <span class="tag">${esc(q.round)} round</span>
    ${techTags}
  </div>
  <p class="q-body">${esc(q.body)}</p>
  <div class="q-meta">↑ ${q.upvotes} upvotes &middot; ${q.asked} engineers asked this</div>
</div>`;
}

// ── Pill grid of related links ───────────────────────────────────────────────
function relatedSection(title, pills) {
  if (!pills.length) return '';
  return `<h2>${esc(title)}</h2>
<div class="pill-grid">
${pills.map(p => `<a href="${p.href}" class="pill${p.accent ? ' accent' : ''}">${esc(p.label)}</a>`).join('\n')}
</div>`;
}

// ── CTA block ────────────────────────────────────────────────────────────────
function practiceBlock(company, topic) {
  return `<div class="practice-cta">
<h3>Practice these questions with AI feedback</h3>
<p>Get instant grading on your answers, identify your weak areas, and generate a personalised 14-day study plan — all free.</p>
<a href="/app/study-plan" class="cta" style="display:inline-block">Build my study plan →</a>
</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. COMPANY + TECH COMBO PAGES  (highest SEO value)
//    e.g. /questions/capgemini-playwright/
// ═══════════════════════════════════════════════════════════════════════════
const combos = new Map(); // key: "companyId:tech" → { questions, company, tech }

QUESTIONS.forEach(q => {
  if (!q.tech) return;
  q.tech.forEach(t => {
    const key = `${q.company}:${t}`;
    if (!combos.has(key)) combos.set(key, { questions: [], company: COMPANY_MAP[q.company], tech: t });
    combos.get(key).questions.push(q);
  });
});

combos.forEach(({ questions, company, tech }) => {
  if (!company || questions.length < 2) return;
  const compSlug = slug(company.name);
  const techSlug = slug(tech);
  const pageSlug = `${compSlug}-${techSlug}`;
  const title = `${company.name} ${tech} Interview Questions ${YEAR}`;
  const desc  = `${questions.length} real ${tech} interview questions asked at ${company.name}. Upvoted by engineers who cleared the loop. Covers ${[...new Set(questions.map(q => q.round))].join(', ')} rounds.`;
  const canonical = `/questions/${pageSlug}/`;

  const faqItems = questions.slice(0, 8).map(q => ({ q: q.body.split('\n')[0], a: q.body }));

  const relCo    = QUESTIONS.filter(q => q.company === company.id && !(q.tech||[]).includes(tech)).slice(0,6);
  const relTech  = QUESTIONS.filter(q => (q.tech||[]).includes(tech) && q.company !== company.id).slice(0,6);
  const relCoNames = [...new Set(relTech.map(q => COMPANY_MAP[q.company]?.name).filter(Boolean))].slice(0,8);
  const relTechs   = [...new Set(relCo.flatMap(q => q.tech||[]).filter(t2 => t2 !== tech))].slice(0,8);

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
<div class="stat-row">
  <div class="stat"><b>${questions.length}</b> questions</div>
  <div class="stat"><b>${questions.reduce((s,q)=>s+q.asked,0)}</b> engineers asked</div>
  <div class="stat"><b>${questions.reduce((s,q)=>s+q.upvotes,0)}</b> upvotes</div>
  <div class="stat">Company: <b>${esc(company.name)}</b></div>
  <div class="stat">Technology: <b>${esc(tech)}</b></div>
</div>
<h2>All ${esc(tech)} Questions Asked at ${esc(company.name)}</h2>
${questions.map((q,i) => qCard(q, i+1)).join('\n')}
${practiceBlock(company.name, tech)}
${relatedSection(`More ${esc(company.name)} Questions`, relTechs.map(t2 => ({
  label: `${company.name} ${t2} Questions`,
  href: `/questions/${compSlug}-${slug(t2)}/`,
})))}
${relatedSection(`${esc(tech)} Questions at Other Companies`, relCoNames.map(cn => ({
  label: `${cn} ${tech} Questions`,
  href: `/questions/${slug(cn)}-${techSlug}/`,
})))}
${relatedSection('Browse by company', COMPANIES.filter(c => QUESTIONS.some(q=>q.company===c.id)).map(c => ({
  label: c.name, href: `/questions/company/${slug(c.name)}/`,
})))}`;

  write(`questions/${pageSlug}/index.html`, shell({
    title, desc, canonical, h1: title, bodyHtml, faqItems,
    breadcrumb: [
      { label: 'Questions', href: '/questions/' },
      { label: company.name, href: `/questions/company/${compSlug}/` },
      { label: tech, href: `/questions/${pageSlug}/` },
    ],
  }));
});

console.log(`[seo] Generated ${combos.size} combo pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 2. COMPANY PAGES  /questions/company/[company]/
// ═══════════════════════════════════════════════════════════════════════════
COMPANIES.forEach(co => {
  const qs = QUESTIONS.filter(q => q.company === co.id);
  if (!qs.length) return;

  const compSlug  = slug(co.name);
  const title     = `${co.name} Interview Questions ${YEAR}`;
  const desc      = `${qs.length} real interview questions asked at ${co.name}. Covers ${[...new Set(qs.map(q=>q.topicPath))].join(', ')}. Reported by engineers who went through the ${co.name} process.`;
  const canonical = `/questions/company/${compSlug}/`;

  const techs = [...new Set(qs.flatMap(q => q.tech||[]))].slice(0, 12);
  const topics = [...new Set(qs.map(q => q.topicPath))];

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
<div class="stat-row">
  <div class="stat"><b>${qs.length}</b> questions</div>
  <div class="stat"><b>${qs.reduce((s,q)=>s+q.asked,0)}</b> engineers asked</div>
  <div class="stat"><b>${qs.reduce((s,q)=>s+q.upvotes,0)}</b> upvotes</div>
</div>
${topics.map(tp => {
  const tqs = qs.filter(q => q.topicPath === tp);
  return `<h2>${esc(tp)} (${tqs.length})</h2>${tqs.map((q,i)=>qCard(q,i+1)).join('\n')}`;
}).join('\n')}
${practiceBlock(co.name, '')}
${relatedSection(`${esc(co.name)} questions by technology`, techs.map(t => ({
  label: `${co.name} ${t}`,
  href: `/questions/${compSlug}-${slug(t)}/`,
})))}
${relatedSection('More companies', COMPANIES.filter(c=>c.id!==co.id&&QUESTIONS.some(q=>q.company===c.id)).map(c=>({
  label: c.name, href: `/questions/company/${slug(c.name)}/`,
})))}`;

  write(`questions/company/${compSlug}/index.html`, shell({
    title, desc, canonical, h1: title, bodyHtml,
    faqItems: qs.slice(0,5).map(q=>({ q: q.body.split('\n')[0], a: q.body })),
    breadcrumb: [{ label: 'Questions', href: '/questions/' }, { label: co.name, href: canonical }],
  }));
});

console.log(`[seo] Generated company pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 3. TOPIC PAGES  /questions/topic/[topic]/
// ═══════════════════════════════════════════════════════════════════════════
const topicMap = new Map();
QUESTIONS.forEach(q => {
  if (!topicMap.has(q.topic)) topicMap.set(q.topic, { name: q.topicPath, questions: [] });
  topicMap.get(q.topic).questions.push(q);
});

topicMap.forEach(({ name: topicName, questions: qs }, topicId) => {
  const topSlug   = slug(topicName.split('/').pop().trim());
  const title     = `${topicName} Interview Questions ${YEAR}`;
  const companies = [...new Set(qs.map(q => COMPANY_MAP[q.company]?.name).filter(Boolean))];
  const desc      = `${qs.length} ${topicName} interview questions from ${companies.join(', ')} and more. Real questions from Technical, System Design, and HR rounds.`;
  const canonical = `/questions/topic/${topSlug}/`;

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
<div class="stat-row">
  <div class="stat"><b>${qs.length}</b> questions</div>
  <div class="stat">Companies: <b>${companies.slice(0,4).join(', ')}${companies.length>4?'…':''}</b></div>
</div>
<h2>All ${esc(topicName)} Questions</h2>
${qs.sort((a,b)=>b.upvotes-a.upvotes).map((q,i)=>qCard(q,i+1)).join('\n')}
${practiceBlock('', topicName)}
${relatedSection('Same topic at specific companies', companies.map(cn => {
  const co = COMPANIES.find(c=>c.name===cn);
  return co ? { label: `${cn} ${topicName}`, href: `/questions/company/${slug(cn)}/` } : null;
}).filter(Boolean).slice(0,10))}
${relatedSection('Related topics', [...topicMap.keys()].filter(t=>t!==topicId).map(t=>({
  label: topicMap.get(t).name, href: `/questions/topic/${slug(topicMap.get(t).name.split('/').pop().trim())}/`,
})))}`;

  write(`questions/topic/${topSlug}/index.html`, shell({
    title, desc, canonical, h1: title, bodyHtml,
    faqItems: qs.slice(0,5).map(q=>({ q: q.body.split('\n')[0], a: q.body })),
    breadcrumb: [{ label: 'Questions', href: '/questions/' }, { label: topicName, href: canonical }],
  }));
});

console.log(`[seo] Generated topic pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 4. TECH PAGES  /questions/tech/[tech]/
// ═══════════════════════════════════════════════════════════════════════════
const techMap = new Map();
QUESTIONS.forEach(q => {
  (q.tech || []).forEach(t => {
    if (!techMap.has(t)) techMap.set(t, []);
    techMap.get(t).push(q);
  });
});

techMap.forEach((qs, tech) => {
  if (qs.length < 3) return;
  const techSlug  = slug(tech);
  const companies = [...new Set(qs.map(q => COMPANY_MAP[q.company]?.name).filter(Boolean))];
  const title     = `${tech} Interview Questions ${YEAR}`;
  const desc      = `${qs.length} ${tech} interview questions from ${companies.slice(0,4).join(', ')}. All difficulty levels, all roles. Upvoted by engineers who were asked them.`;
  const canonical = `/questions/tech/${techSlug}/`;

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
<div class="stat-row">
  <div class="stat"><b>${qs.length}</b> questions</div>
  <div class="stat">Companies: <b>${companies.slice(0,4).join(', ')}</b></div>
  <div class="stat"><b>${qs.reduce((s,q)=>s+q.upvotes,0)}</b> upvotes</div>
</div>
<h2>${esc(tech)} Questions by Company</h2>
${companies.map(cn => {
  const coQs = qs.filter(q => COMPANY_MAP[q.company]?.name === cn);
  return `<h2>${esc(cn)} (${coQs.length})</h2>${coQs.map((q,i)=>qCard(q,i+1)).join('\n')}`;
}).join('\n')}
${practiceBlock('', tech)}
${relatedSection(`${esc(tech)} questions at each company`, companies.map(cn => ({
  label: `${cn} ${tech}`, href: `/questions/${slug(cn)}-${techSlug}/`,
})))}`;

  write(`questions/tech/${techSlug}/index.html`, shell({
    title, desc, canonical, h1: title, bodyHtml,
    faqItems: qs.slice(0,5).map(q=>({ q: q.body.split('\n')[0], a: q.body })),
    breadcrumb: [{ label: 'Questions', href: '/questions/' }, { label: tech, href: canonical }],
  }));
});

console.log(`[seo] Generated tech pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 5. TRENDING PAGE  /questions/trending/
// ═══════════════════════════════════════════════════════════════════════════
{
  const qs = [...QUESTIONS].sort((a,b) => (b.upvotes + b.asked*2) - (a.upvotes + a.asked*2)).slice(0, 30);
  const title = `Trending Interview Questions ${YEAR}`;
  const desc  = `The ${qs.length} most upvoted interview questions right now across TCS, Infosys, Wipro, Capgemini and Indian tech companies. Updated as engineers report new questions.`;
  write('questions/trending/index.html', shell({
    title, desc, canonical: '/questions/trending/', h1: title,
    faqItems: qs.slice(0,5).map(q=>({ q: q.body.split('\n')[0], a: q.body })),
    breadcrumb: [{ label: 'Questions', href: '/questions/' }, { label: 'Trending', href: '/questions/trending/' }],
    bodyHtml: `
<p class="subtitle">${esc(desc)}</p>
<h2>Top ${qs.length} Questions This Month</h2>
${qs.map((q,i)=>qCard(q,i+1)).join('\n')}
${practiceBlock('','trending')}
${relatedSection('Browse by company', COMPANIES.filter(c=>QUESTIONS.some(q=>q.company===c.id)).map(c=>({
  label: c.name, href: `/questions/company/${slug(c.name)}/`,
})))}`,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. MAIN QUESTIONS INDEX  /questions/
// ═══════════════════════════════════════════════════════════════════════════
{
  const activeCompanies = COMPANIES.filter(c => QUESTIONS.some(q => q.company === c.id));
  const title = `Interview Questions ${YEAR} — TCS, Infosys, Wipro, Capgemini & More`;
  const desc  = `${QUESTIONS.length} real interview questions from TCS, Infosys, Wipro, Capgemini, Accenture and 20+ Indian and global tech companies. Reported by engineers who cleared the interviews.`;
  write('questions/index.html', shell({
    title, desc, canonical: '/questions/', h1: title,
    breadcrumb: [{ label: 'Questions', href: '/questions/' }],
    bodyHtml: `
<p class="subtitle">${esc(desc)}</p>
<div class="stat-row">
  <div class="stat"><b>${QUESTIONS.length}</b> questions</div>
  <div class="stat"><b>${activeCompanies.length}</b> companies</div>
  <div class="stat"><b>${QUESTIONS.reduce((s,q)=>s+q.asked,0)}</b> engineers asked</div>
</div>
<h2>Browse by Company</h2>
<div class="pill-grid">
${activeCompanies.map(c => {
  const n = QUESTIONS.filter(q=>q.company===c.id).length;
  return `<a href="/questions/company/${slug(c.name)}/" class="pill">${esc(c.name)} <span style="color:#52525b">(${n})</span></a>`;
}).join('\n')}
</div>
<h2>Popular Company + Technology Combos</h2>
<div class="pill-grid">
${[...combos.entries()]
  .filter(([,v]) => v.questions.length >= 3)
  .sort((a,b) => b[1].questions.reduce((s,q)=>s+q.upvotes,0) - a[1].questions.reduce((s,q)=>s+q.upvotes,0))
  .slice(0, 30)
  .map(([key, { company: co, tech }]) => co
    ? `<a href="/questions/${slug(co.name)}-${slug(tech)}/" class="pill accent">${esc(co.name)} ${esc(tech)}</a>`
    : '')
  .filter(Boolean)
  .join('\n')}
</div>
<h2>Browse by Topic</h2>
<div class="pill-grid">
${[...topicMap.entries()].map(([,{name,questions:qs}]) =>
  `<a href="/questions/topic/${slug(name.split('/').pop().trim())}/" class="pill">${esc(name)} <span style="color:#52525b">(${qs.length})</span></a>`
).join('\n')}
</div>
<h2>Browse by Technology</h2>
<div class="pill-grid">
${[...techMap.entries()].filter(([,qs])=>qs.length>=3).sort((a,b)=>b[1].length-a[1].length).map(([t,qs])=>
  `<a href="/questions/tech/${slug(t)}/" class="pill">${esc(t)} <span style="color:#52525b">(${qs.length})</span></a>`
).join('\n')}
<a href="/questions/trending/" class="pill accent">🔥 Trending</a>
</div>
${practiceBlock('','')}`,
  }));
}

console.log(`[seo] Generated questions index`);

// ═══════════════════════════════════════════════════════════════════════════
// 7. SITEMAP.XML
// ═══════════════════════════════════════════════════════════════════════════
const today = new Date().toISOString().split('T')[0];
const staticPages = ['/', '/app/questions', '/app/study-plan', '/app/practice', '/app/daily-review'];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(u => `  <url><loc>https://www.stepkai.com${u}</loc><changefreq>weekly</changefreq><priority>0.8</priority><lastmod>${today}</lastmod></url>`).join('\n')}
${sitemapUrls.map(u => `  <url><loc>https://www.stepkai.com${u}</loc><changefreq>monthly</changefreq><priority>0.7</priority><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`[seo] sitemap.xml with ${sitemapUrls.length + staticPages.length} URLs`);

// ═══════════════════════════════════════════════════════════════════════════
// 8. ROBOTS.TXT
// ═══════════════════════════════════════════════════════════════════════════
fs.writeFileSync(path.join(BUILD, 'robots.txt'),
`User-agent: *
Allow: /

Sitemap: https://www.stepkai.com/sitemap.xml
`, 'utf-8');

console.log('[seo] robots.txt written');
console.log(`[seo] Done. Total static pages: ${sitemapUrls.length}`);
