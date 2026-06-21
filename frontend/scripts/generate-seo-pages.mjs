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
  <a href="/app/plan" class="cta">Practice free →</a>
</div></nav>
<main>
${breadcrumb.length ? `<div class="breadcrumb">
  <a href="/">Home</a>${breadcrumb.map(c => `<span>/</span><a href="${c.href}">${esc(c.label)}</a>`).join('')}
</div>` : ''}
<h1>${esc(h1)}</h1>
${bodyHtml}
</main>
<footer>
  <p>&copy; ${YEAR} Stepkai &middot; <a href="/">Home</a> &middot; <a href="/app/questions">Question Bank</a> &middot; <a href="/app/plan">Study Plan</a> &middot; <a href="/questions/">Browse All</a> &middot; <a href="/companies/">Companies</a> &middot; <a href="/roles/">Roles</a></p>
  <p style="margin-top:8px">Real interview questions from engineers who cleared the loop.</p>
</footer>
</body></html>`;
}

// ── Question card HTML ───────────────────────────────────────────────────────
function qCard(q, idx) {
  const co = COMPANY_MAP[q.company];
  const techTags = (q.tech || []).slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  const expTag = q.experience ? `<span class="tag">${esc(q.experience)}</span>` : '';
  const srcTag = q.source && q.source !== 'Community Report' ? `<span class="tag" style="color:#60a5fa;border-color:#60a5fa40">${esc(q.source)}</span>` : '';
  return `<div class="q-card">
  <div class="q-tags">
    ${co ? `<span class="tag" style="color:${co.color};border-color:${co.color}40">${esc(co.name)}</span>` : ''}
    <span class="tag diff-${esc(q.difficulty)}">${esc(q.difficulty)}</span>
    <span class="tag">${esc(q.round)} round</span>
    ${expTag}${srcTag}${techTags}
  </div>
  <p class="q-body">${esc(q.body)}</p>
  <div class="q-meta">↑ ${q.upvotes} upvotes &middot; ${q.asked} engineers asked this${q.role ? ` &middot; ${esc(q.role)}` : ''}</div>
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

  const techs  = [...new Set(qs.flatMap(q => q.tech||[]))].slice(0, 12);
  const topics = [...new Set(qs.map(q => q.topicPath))];

  // Roles for this company → guide links
  const rolesHere = [...new Set(qs.map(q => q.role).filter(Boolean))];
  const guideLinks = rolesHere.slice(0, 4).map(r => ({
    label: `${co.name} ${r} Guide`, href: `/guide/${compSlug}-${slug(r)}/`, accent: true,
  }));
  const hasExpPage = QUESTIONS.some(q => q.company === co.id && ['Interview Experience','My Interview','Glassdoor'].includes(q.source));

  const companyNavHtml = `
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:32px">
  <a href="${canonical}" class="pill" style="border-color:rgba(245,158,11,.5);color:#f59e0b">Questions</a>
  ${hasExpPage ? `<a href="/interview-experience/${compSlug}/" class="pill">Interview Experiences</a>` : ''}
  ${guideLinks.map(g => `<a href="${g.href}" class="pill accent">Interview Guides</a>`).join('')}
</div>`;

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
${companyNavHtml}
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
${guideLinks.length ? relatedSection(`${esc(co.name)} interview guides by role`, guideLinks) : ''}
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
// 7. COMPANY INTERVIEW PROCESS PAGES  /interview-process/[company]/
//    Targets: "TCS interview process 2026", "Wipro interview rounds"
// ═══════════════════════════════════════════════════════════════════════════

// Known round data derived from QUESTIONS
const ROUND_INFO = {
  amazon:    { rounds: ['Online Assessment','Technical (LP+DSA)','Technical (LP+DSA)','Bar Raiser','Hiring Manager'], tips: 'Every round has Leadership Principle behavioural questions alongside DSA. Prepare STAR stories for all 16 LPs before your first round.' },
  google:    { rounds: ['Recruiter screen','Phone screen (DSA)','Onsite x4 (DSA, System Design, Behavioural)','Hiring Committee'], tips: 'Google grades on a scale of 1–4. A 3 on most rounds clears the bar. Focus on clean code and walking through your thought process out loud.' },
  microsoft: { rounds: ['Recruiter call','Phone screen','Onsite x4 (DSA, Design, Culture)','As-Appropriate (senior)'], tips: 'Microsoft values "growth mindset". Show curiosity, ask clarifying questions, and be ready to explain trade-offs clearly.' },
  tcs:       { rounds: ['TCS NQT / Online test','Technical interview','Managerial round','HR round'], tips: 'TCS NQT tests Aptitude, Verbal, Coding. Technical round focuses on Java/Python basics, OOPs, DBMS, and OS. Be specific about project experience.' },
  infosys:   { rounds: ['InfyTQ / Hackathon','Technical interview','HR round'], tips: 'Infosys asks Java fundamentals heavily — Collections, multithreading, JVM internals. Spring Boot is common for experienced hires.' },
  wipro:     { rounds: ['Online test (AMCAT)','Technical interview','Managerial round','HR round'], tips: 'Wipro technical rounds focus on Selenium/automation for testers and Java/SQL for developers. Prepare at least 2-3 automation framework projects.' },
  accenture: { rounds: ['Online assessment','Technical interview','Communication assessment','HR round'], tips: 'Accenture values communication. Practice explaining your projects clearly. They hire for Playwright/Selenium automation, DevOps, and Java development.' },
  deloitte:  { rounds: ['Online test','Technical interview','Case interview (consulting)','HR round'], tips: 'Deloitte DevOps rounds focus heavily on Jenkins, Docker, Kubernetes, and CI/CD pipelines. Have a detailed pipeline explanation ready.' },
  capgemini: { rounds: ['Pseudo-code test','Technical interview','Versant (English)','HR round'], tips: 'Capgemini tests pseudo-code and analytical thinking. Playwright/Selenium and REST API testing is common for QA roles. English communication is tested separately.' },
  flipkart:  { rounds: ['Phone screen','Machine coding','System design','Culture fit'], tips: 'Flipkart machine coding is 90 minutes. They expect clean, runnable code — not just pseudocode. Practice LLD problems like Parking Lot, Snake and Ladder.' },
  swiggy:    { rounds: ['Phone screen','Technical (DSA)','System design','Hiring Manager'], tips: 'Swiggy asks logistics/geo-spatial system design questions frequently. Think about real-time tracking, ETA estimation, and matching algorithms.' },
  meta:      { rounds: ['Recruiter call','Phone screen x2','Onsite x5 (Coding, System Design, Behavioural)'], tips: 'Meta values speed of execution. System Design rounds often involve social graph or feed ranking problems. Behavioural rounds use the "impact" framework.' },
  uber:      { rounds: ['Phone screen','Technical x2','System Design','Hiring Manager'], tips: 'Uber frequently asks about geo-spatial systems, matching algorithms, and surge pricing. Show you understand distributed system trade-offs.' },
};

const ACTIVE_COMPANIES = COMPANIES.filter(c => QUESTIONS.some(q => q.company === c.id));

ACTIVE_COMPANIES.forEach(co => {
  const qs       = QUESTIONS.filter(q => q.company === co.id);
  const info     = ROUND_INFO[co.id] || {
    rounds: ['Online test / phone screen', 'Technical interview', 'Managerial / HR round'],
    tips:   `Prepare well for the technical interview with questions from ${co.name}'s previous loops.`,
  };
  const compSlug  = slug(co.name);
  const title     = `${co.name} Interview Process ${YEAR} — Rounds, Tips & Questions`;
  const desc      = `Everything about the ${co.name} interview process: rounds, what each round tests, difficulty level, and ${qs.length} real questions asked by engineers who cleared the loop.`;
  const canonical = `/interview-process/${compSlug}/`;

  const techs  = [...new Set(qs.flatMap(q => q.tech||[]))].slice(0, 8);
  const topics = [...new Set(qs.map(q => q.topicPath))];

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
<div class="stat-row">
  <div class="stat"><b>${info.rounds.length}</b> rounds</div>
  <div class="stat"><b>${qs.length}</b> real questions</div>
  <div class="stat"><b>${qs.reduce((s,q)=>s+q.asked,0)}</b> engineers asked</div>
</div>

<h2>Interview Rounds at ${esc(co.name)}</h2>
<ol style="padding-left:20px;margin-bottom:24px">
${info.rounds.map(r => `  <li style="padding:8px 0;color:#d4d4d8;font-size:15px">${esc(r)}</li>`).join('\n')}
</ol>

<div style="padding:18px 22px;border-radius:10px;border:1px solid rgba(245,158,11,.2);background:rgba(245,158,11,.04);margin-bottom:32px">
  <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#f59e0b;margin-bottom:8px">Insider tip</div>
  <p style="color:#d4d4d8;font-size:14px;line-height:1.7">${esc(info.tips)}</p>
</div>

<h2>Real Questions Asked at ${esc(co.name)}</h2>
${qs.sort((a,b)=>b.upvotes-a.upvotes).slice(0,10).map((q,i)=>qCard(q,i+1)).join('\n')}

${practiceBlock(co.name, '')}

${relatedSection(`What ${esc(co.name)} asks by topic`, topics.map(tp => ({
  label: tp, href: `/questions/company/${compSlug}/`,
})))}
${relatedSection(`${esc(co.name)} questions by technology`, techs.map(t => ({
  label: `${co.name} ${t}`, href: `/questions/${compSlug}-${slug(t)}/`,
})))}
${relatedSection('Other company interview processes', ACTIVE_COMPANIES.filter(c=>c.id!==co.id).slice(0,10).map(c=>({
  label: `${c.name} Interview Process`, href: `/interview-process/${slug(c.name)}/`,
})))}`;

  write(`interview-process/${compSlug}/index.html`, shell({
    title, desc, canonical, h1: title, bodyHtml,
    faqItems: [
      { q: `How many rounds does ${co.name} interview have?`, a: `${co.name} typically has ${info.rounds.length} rounds: ${info.rounds.join(', ')}.` },
      { q: `What topics does ${co.name} ask in technical rounds?`, a: topics.join(', ') + '. Based on ' + qs.length + ' questions reported by engineers.' },
      { q: `How hard is the ${co.name} interview?`, a: `Difficulty ranges from ${[...new Set(qs.map(q=>q.difficulty))].join(', ')}. ${info.tips}` },
    ],
    breadcrumb: [{ label: 'Interview Process', href: '/interview-process/' }, { label: co.name, href: canonical }],
  }));
});

// Interview process index page
{
  const title = `Tech Company Interview Process Guide ${YEAR}`;
  const desc  = `How to clear interviews at TCS, Infosys, Wipro, Capgemini, Accenture and 20+ companies. Round-by-round breakdown, insider tips, and real questions from engineers who got the offer.`;
  write('interview-process/index.html', shell({
    title, desc, canonical: '/interview-process/', h1: title,
    breadcrumb: [{ label: 'Interview Process', href: '/interview-process/' }],
    bodyHtml: `
<p class="subtitle">${esc(desc)}</p>
<h2>Select a Company</h2>
<div class="pill-grid">
${ACTIVE_COMPANIES.map(c => `<a href="/interview-process/${slug(c.name)}/" class="pill">${esc(c.name)} Interview Process</a>`).join('\n')}
</div>
${practiceBlock('', '')}`,
  }));
}

console.log(`[seo] Generated interview-process pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 8. HOW-TO-PREPARE PAGES  /prepare/[company]/
//    Targets: "how to prepare for TCS interview", "Wipro interview preparation guide"
// ═══════════════════════════════════════════════════════════════════════════

ACTIVE_COMPANIES.forEach(co => {
  const qs      = QUESTIONS.filter(q => q.company === co.id);
  const compSlug = slug(co.name);
  const topics   = [...new Set(qs.map(q => q.topicPath))];
  const techs    = [...new Set(qs.flatMap(q => q.tech||[]))].slice(0, 8);
  const topQ     = qs.sort((a,b)=>b.upvotes-a.upvotes).slice(0, 5);
  const title    = `How to Prepare for ${co.name} Interview ${YEAR} — Complete Guide`;
  const desc     = `Step-by-step preparation guide for ${co.name} interviews. Covers what to study, how long to prepare, top resources, and ${qs.length} real questions reported by engineers who cleared the ${co.name} process.`;
  const canonical = `/prepare/${compSlug}/`;

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>

<h2>Step 1 — Understand what ${esc(co.name)} actually tests</h2>
<p style="color:#a1a1aa;font-size:14px;line-height:1.75;margin-bottom:16px">Based on ${qs.length} questions reported by engineers, ${esc(co.name)} focuses on: <b style="color:#f4f4f5">${topics.join(', ')}</b>.</p>
<div class="stat-row">
  <div class="stat">Topics: <b>${topics.length}</b></div>
  <div class="stat">Questions reported: <b>${qs.length}</b></div>
  <div class="stat">Engineers interviewed: <b>${qs.reduce((s,q)=>s+q.asked,0)}</b></div>
</div>

<h2>Step 2 — Study the right topics in order</h2>
<ol style="padding-left:20px;margin-bottom:24px">
${topics.map((tp,i) => {
  const tqs = qs.filter(q => q.topicPath === tp);
  return `  <li style="padding:10px 0;color:#d4d4d8;font-size:14px;line-height:1.6">
    <b style="color:#f4f4f5">${esc(tp)}</b> — ${tqs.length} questions. ${i===0 ? 'Start here — highest weight in technical rounds.' : i===1 ? 'Second priority after the first topic.' : 'Cover once the first two topics are solid.'}
  </li>`;
}).join('\n')}
</ol>

<h2>Step 3 — Practice with real questions</h2>
<p style="color:#a1a1aa;font-size:14px;line-height:1.75;margin-bottom:16px">These are the most upvoted questions engineers report being asked at ${esc(co.name)}:</p>
${topQ.map((q,i)=>qCard(q,i+1)).join('\n')}

<h2>Step 4 — Analyse the job description</h2>
<div style="padding:20px 24px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:#0c0c0f;margin-bottom:16px">
  <p style="color:#d4d4d8;font-size:14px;line-height:1.75">Paste the exact ${esc(co.name)} JD into Stepkai's AI tool. It will extract the competencies being tested, score your current readiness, and generate a personalised day-by-day plan targeting your specific gaps — not a generic checklist.</p>
  <div style="margin-top:16px"><a href="/app/study-plan" class="cta" style="display:inline-block">Analyse my JD →</a></div>
</div>

<h2>Step 5 — Mock interview</h2>
<p style="color:#a1a1aa;font-size:14px;line-height:1.75;margin-bottom:24px">Practice answering ${esc(co.name)} questions with AI grading. Get instant feedback on depth, correctness, and communication before the real thing.</p>
<a href="/app/practice" class="cta" style="display:inline-block;margin-bottom:32px">Start practising →</a>

${relatedSection(`All ${esc(co.name)} questions by technology`, techs.map(t => ({
  label: `${co.name} ${t}`, href: `/questions/${compSlug}-${slug(t)}/`,
})))}
${relatedSection('Preparation guides for other companies', ACTIVE_COMPANIES.filter(c=>c.id!==co.id).slice(0,10).map(c=>({
  label: `How to prepare for ${c.name}`, href: `/prepare/${slug(c.name)}/`,
})))}`;

  write(`prepare/${compSlug}/index.html`, shell({
    title, desc, canonical, h1: title, bodyHtml,
    faqItems: [
      { q: `How long does it take to prepare for ${co.name} interview?`, a: `For experienced engineers, 2–4 weeks of focused preparation covering ${topics.join(', ')} is typically sufficient for ${co.name}.` },
      { q: `What topics should I study for ${co.name} interview?`, a: `${co.name} interview questions cover ${topics.join(', ')}. The most upvoted topics from ${qs.length} real questions are: ${topics.slice(0,3).join(', ')}.` },
      { q: `Is ${co.name} interview hard?`, a: `Difficulty levels range from ${[...new Set(qs.map(q=>q.difficulty))].join(' to ')}. Most questions are Medium. Preparation with real questions from engineers who cleared the loop makes a significant difference.` },
    ],
    breadcrumb: [{ label: 'Prepare', href: '/prepare/' }, { label: co.name, href: canonical }],
  }));
});

// Prepare index
{
  const title = `Interview Preparation Guides — TCS, Infosys, Wipro, Capgemini & More`;
  const desc  = `Company-specific preparation guides written from real interview data. Know exactly what to study, in what order, and how long it takes to prepare for each company.`;
  write('prepare/index.html', shell({
    title, desc, canonical: '/prepare/', h1: title,
    breadcrumb: [{ label: 'Prepare', href: '/prepare/' }],
    bodyHtml: `
<p class="subtitle">${esc(desc)}</p>
<h2>Pick your target company</h2>
<div class="pill-grid">
${ACTIVE_COMPANIES.map(c => `<a href="/prepare/${slug(c.name)}/" class="pill">${esc(c.name)} Preparation Guide</a>`).join('\n')}
</div>
${practiceBlock('','')}`,
  }));
}

console.log(`[seo] Generated prepare pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 9. FEATURE LANDING PAGES  /tools/[feature]/
//    Targets: "JD analysis tool", "AI interview practice", "study plan generator"
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    id: 'jd-analysis',
    title: `JD Analysis Tool — Know Exactly What to Prep From Any Job Description`,
    desc:  'Free AI tool that reads any tech job description and tells you which skills to focus on, how ready you are, and what your gaps are. No generic advice.',
    h1:    'JD Analysis Tool',
    appPath: '/app/study-plan',
    cta:   'Analyse my JD free →',
    faq: [
      { q: 'How does the JD analysis tool work?', a: 'Paste any job description. The AI extracts the key competencies being tested, scores your readiness based on a quick assessment, and shows you exactly which skills are critical gaps vs strengths for that specific role.' },
      { q: 'Is the JD analysis tool free?', a: 'Yes, completely free. No signup required for the analysis. Create an account to save your results and get a full 14-day study plan.' },
      { q: 'Which companies JDs does it work for?', a: 'Any company — TCS, Infosys, Wipro, Capgemini, Accenture, Deloitte, Amazon, Google, and any other tech company. It reads the raw JD text, not a company database.' },
    ],
    body: `
<p class="subtitle">Paste any tech job description. The AI extracts what's actually being tested — not what the JD says in jargon — and shows your readiness score and specific gaps.</p>

<h2>What the JD analysis does</h2>
<ol style="padding-left:20px;margin-bottom:24px">
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Extracts real competencies</b> — strips HR jargon and identifies the actual technical skills being tested</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Runs a 10-question assessment</b> — mixed MCQ, scenario, ranking, and free-text questions calibrated to that JD</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Shows your readiness score</b> — confidence-weighted percentage per skill, not a vague overall score</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Identifies critical gaps</b> — exactly which skills to fix first, in priority order</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Generates a 14-day plan</b> — specific daily tasks with measurable outcomes, not "study Kafka"</li>
</ol>

<div style="padding:20px 24px;border-radius:10px;border:1px solid rgba(245,158,11,.25);background:rgba(245,158,11,.04);margin-bottom:32px">
  <h3 style="font-size:16px;margin-bottom:8px">Try it free — no signup needed</h3>
  <p style="color:#a1a1aa;font-size:14px;line-height:1.7;margin-bottom:16px">Paste any JD from TCS, Infosys, Wipro, Capgemini, Amazon, or any other company. Takes 5 minutes. Most engineers are surprised by what the JD is actually testing vs what they thought.</p>
  <a href="/app/study-plan" class="cta" style="display:inline-block">Analyse my JD →</a>
</div>

<h2>Why generic preparation guides fail</h2>
<p style="color:#a1a1aa;font-size:14px;line-height:1.75;margin-bottom:24px">A TCS SDE2 JD focusing on Spring Boot microservices needs completely different preparation than a TCS SDE2 JD for a Kafka streaming team — even though both say "Java, 4 years, microservices experience." The JD analysis reads the specific requirements and adapts the prep accordingly.</p>`,
  },
  {
    id: 'ai-interview-practice',
    title: `AI Interview Practice — Get Graded on Real Interview Questions`,
    desc:  'Practice real interview questions from TCS, Infosys, Wipro, Capgemini and 20+ companies. AI grades your answers instantly on depth, correctness, and communication.',
    h1:    'AI Interview Practice',
    appPath: '/app/practice',
    cta:   'Start practising free →',
    faq: [
      { q: 'How does AI interview practice work?', a: 'Pick a company and topic. Answer the question in your own words. The AI grades your answer on depth of knowledge, technical correctness, and how clearly you communicated — same criteria real interviewers use.' },
      { q: 'What companies and topics are available?', a: `Questions from ${ACTIVE_COMPANIES.map(c=>c.name).slice(0,8).join(', ')} and more. Topics include DSA, System Design, Behavioural, Domain-specific, Testing, DevOps, and API Testing.` },
      { q: 'Is this better than LeetCode?', a: 'For interview communication skills, yes. LeetCode tests if your code runs — AI grading tests if your explanation is strong enough to convince a real interviewer. Both are useful for different things.' },
    ],
    body: `
<p class="subtitle">Stop practising in isolation. Answer real interview questions and get instant feedback on what a hiring manager would actually think of your answer.</p>

<h2>What makes this different from other practice tools</h2>
<ol style="padding-left:20px;margin-bottom:24px">
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Real questions</b> — reported by engineers who went through actual ${ACTIVE_COMPANIES.slice(0,4).map(c=>c.name).join(', ')} and other company loops</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">AI grading</b> — scored on depth, correctness, and communication quality — not just keywords</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Spaced repetition</b> — weak questions resurface. Strong answers get retired. Your time goes to what you actually need.</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Progress tracking</b> — see your mastery score per topic grow as you practice</li>
</ol>

<div style="padding:20px 24px;border-radius:10px;border:1px solid rgba(245,158,11,.25);background:rgba(245,158,11,.04);margin-bottom:32px">
  <h3 style="font-size:16px;margin-bottom:8px">Free forever for the core practice</h3>
  <p style="color:#a1a1aa;font-size:14px;line-height:1.7;margin-bottom:16px">${QUESTIONS.length} real questions, AI grading, and progress tracking. No paywall on the basics.</p>
  <a href="/app/practice" class="cta" style="display:inline-block">Start practising →</a>
</div>`,
  },
  {
    id: 'study-plan-generator',
    title: `Free Interview Study Plan Generator — Personalised 14-Day Roadmap`,
    desc:  'Generate a personalised 14-day interview study plan based on your actual skill gaps. AI builds the plan from your JD analysis results — not a generic checklist.',
    h1:    'Interview Study Plan Generator',
    appPath: '/app/study-plan',
    cta:   'Build my study plan →',
    faq: [
      { q: 'How is this different from a generic study plan?', a: 'Generic plans say "study Kafka". This plan says "Explain Kafka partitions, replication, consumer groups, ISR and retention policy. Build a producer-consumer demo." Every task has a measurable outcome tied to your specific gaps.' },
      { q: 'How long does it take to generate a plan?', a: 'About 10 minutes including the assessment. Paste your JD, answer 10 questions, and your plan is ready with day-by-day tasks and practice questions.' },
      { q: 'Can I get a plan for any company?', a: `Yes. The plan is built from your JD, not a company template. It works for TCS, Infosys, Wipro, Capgemini, Accenture, Amazon, Google, startups, or any tech role.` },
    ],
    body: `
<p class="subtitle">Most study plans are useless because they're generic. This one is built from your actual JD, your assessment results, and your specific gaps — so every day's work moves the needle.</p>

<h2>How the plan is generated</h2>
<ol style="padding-left:20px;margin-bottom:24px">
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Paste your JD</b> — the AI extracts the real competencies being tested (not the HR jargon)</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Complete a 10-question assessment</b> — MCQ, scenario, ranking, and free-text questions calibrated to your JD</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">See your skills heatmap</b> — readiness score per competency, critical gaps flagged</li>
  <li style="padding:8px 0;color:#d4d4d8;font-size:15px"><b style="color:#f4f4f5">Get your 14-day roadmap</b> — Days 1-7 front-load critical gaps, Days 8-12 strengthen weak areas, Days 13-14 mock interview simulation</li>
</ol>

<h2>What a day looks like</h2>
<div style="padding:18px 22px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:#0c0c0f;margin-bottom:24px">
  <div style="font-family:monospace;font-size:11px;color:#52525b;margin-bottom:10px">day 3 example — if System Design is a critical gap</div>
  <ul style="padding-left:20px;color:#d4d4d8;font-size:14px;line-height:1.8">
    <li>Design a URL shortener (tinyurl clone). Write API spec, DB schema, cache strategy, and scaling plan to 1B requests/day.</li>
    <li>Implement consistent hashing in code and explain why it reduces hotspots vs round-robin.</li>
    <li>Answer: "Design a notification service for 10M daily messages" — time yourself to 30 minutes.</li>
    <li>Reflection: what would break first at 10x scale? Write 3 bullet points.</li>
  </ul>
</div>

<div style="padding:20px 24px;border-radius:10px;border:1px solid rgba(245,158,11,.25);background:rgba(245,158,11,.04);margin-bottom:32px">
  <a href="/app/study-plan" class="cta" style="display:inline-block">Generate my plan — free →</a>
</div>`,
  },
];

FEATURES.forEach(f => {
  const canonical = `/tools/${f.id}/`;
  const bodyHtml = `${f.body}
${relatedSection('Related tools', FEATURES.filter(f2=>f2.id!==f.id).map(f2=>({ label: f2.h1, href: `/tools/${f2.id}/` })))}
${relatedSection('Company interview prep', ACTIVE_COMPANIES.slice(0,10).map(c=>({ label: `${c.name} preparation guide`, href: `/prepare/${slug(c.name)}/` })))}`;

  write(`tools/${f.id}/index.html`, shell({
    title: f.title, desc: f.desc, canonical, h1: f.h1, bodyHtml, faqItems: f.faq,
    breadcrumb: [{ label: 'Tools', href: '/tools/' }, { label: f.h1, href: canonical }],
  }));
});

// Tools index
{
  const title = 'Free Interview Prep Tools — JD Analysis, AI Practice, Study Plans';
  const desc  = 'Free tools to prepare smarter for tech interviews. Analyse any JD, practice with AI grading, and generate a personalised study plan based on your actual gaps.';
  write('tools/index.html', shell({
    title, desc, canonical: '/tools/', h1: title,
    breadcrumb: [{ label: 'Tools', href: '/tools/' }],
    bodyHtml: `
<p class="subtitle">${esc(desc)}</p>
<div class="pill-grid">
${FEATURES.map(f => `<a href="/tools/${f.id}/" class="pill accent">${esc(f.h1)}</a>`).join('\n')}
</div>
<h2>All tools are free</h2>
<p style="color:#a1a1aa;font-size:14px;line-height:1.75">No paid tiers for the core prep workflow. JD analysis, assessment, study plan generation, and question practice are all free. Create an account to save progress across sessions.</p>
${practiceBlock('','')}`,
  }));
}

console.log(`[seo] Generated feature/tool pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 10. TECHNOLOGY COMPARISON GUIDES  /compare/[tech-vs-tech]/
//     Targets: "selenium vs playwright 2026", "java vs python for interviews"
// ═══════════════════════════════════════════════════════════════════════════

const COMPARISONS = [
  {
    slug: 'selenium-vs-playwright',
    title: `Selenium vs Playwright ${YEAR} — Which to Learn for QA Interviews`,
    desc:  `Selenium vs Playwright for interview preparation. Which framework do TCS, Wipro, Accenture, and Capgemini ask about? Real data from ${QUESTIONS.filter(q=>(q.tech||[]).some(t=>['Selenium','Playwright'].includes(t))).length} interview questions.`,
    h1:    `Selenium vs Playwright ${YEAR}`,
    techs: ['Selenium', 'Playwright'],
    comparison: [
      { aspect: 'Industry adoption in India', selenium: 'Very high — majority of legacy projects', playwright: 'Rapidly growing — new projects in 2024–26' },
      { aspect: 'Interview frequency', selenium: 'High at Wipro, TCS, Infosys (older stacks)', playwright: 'High at Accenture, Capgemini, new startups' },
      { aspect: 'Architecture', selenium: 'WebDriver protocol — external browser driver', playwright: 'CDP/browser-native — built-in browser control' },
      { aspect: 'Auto-wait', selenium: 'Manual — requires explicit waits', playwright: 'Built-in — actionability checks before every action' },
      { aspect: 'Cross-browser', selenium: 'Chrome, Firefox, Safari, Edge, IE', playwright: 'Chromium, Firefox, WebKit (no IE)' },
      { aspect: 'Speed', selenium: 'Slower — network round trips to WebDriver', playwright: 'Faster — in-process browser control' },
      { aspect: 'Language support', selenium: 'Java, Python, C#, Ruby, JavaScript', playwright: 'TypeScript/JS, Python, Java, C#' },
    ],
  },
  {
    slug: 'java-vs-python-interview',
    title: `Java vs Python for Tech Interviews ${YEAR} — Which to Choose`,
    desc:  `Java or Python for your next tech interview? Which language does TCS, Infosys, Wipro prefer? Data from real interview questions across Indian tech companies.`,
    h1:    `Java vs Python for Tech Interviews ${YEAR}`,
    techs: ['Java', 'Python'],
    comparison: [
      { aspect: 'Preferred at Indian service companies', java: 'Strong preference — TCS, Infosys, Wipro, Accenture', python: 'Growing — data/ML roles, scripting, testing' },
      { aspect: 'DSA in interviews', java: 'Collections, Streams, generics well-tested', python: 'List comprehension, dicts, generators commonly asked' },
      { aspect: 'OOP questions', java: 'Very heavy — JVM internals, GC, threading', python: 'Lighter — duck typing, decorators, GIL' },
      { aspect: 'Framework questions', java: 'Spring Boot, Hibernate, Maven', python: 'Django, FastAPI, Flask, Pytest' },
      { aspect: 'Verbosity in interviews', java: 'More lines — but shows discipline', python: 'Concise — faster to write, easier to explain' },
      { aspect: 'Salary impact (India)', java: 'Marginally higher for backend roles', python: 'Higher for ML/data roles' },
    ],
  },
];

COMPARISONS.forEach(comp => {
  const canonical = `/compare/${comp.slug}/`;
  const [tech1, tech2] = comp.techs;
  const qs1 = QUESTIONS.filter(q=>(q.tech||[]).includes(tech1));
  const qs2 = QUESTIONS.filter(q=>(q.tech||[]).includes(tech2));
  const companies1 = [...new Set(qs1.map(q=>COMPANY_MAP[q.company]?.name).filter(Boolean))];
  const companies2 = [...new Set(qs2.map(q=>COMPANY_MAP[q.company]?.name).filter(Boolean))];

  const tableRows = comp.comparison.map(row => `
  <tr>
    <td style="padding:12px 14px;color:#a1a1aa;font-size:13px;border-bottom:1px solid rgba(255,255,255,.06)">${esc(row.aspect)}</td>
    <td style="padding:12px 14px;color:#d4d4d8;font-size:13px;border-bottom:1px solid rgba(255,255,255,.06)">${esc(row[slug(tech1).replace(/-/g,'')] || row.selenium || row.java || '')}</td>
    <td style="padding:12px 14px;color:#d4d4d8;font-size:13px;border-bottom:1px solid rgba(255,255,255,.06)">${esc(row[slug(tech2).replace(/-/g,'')] || row.playwright || row.python || '')}</td>
  </tr>`).join('');

  const bodyHtml = `
<p class="subtitle">${esc(comp.desc)}</p>
<div class="stat-row">
  <div class="stat">${esc(tech1)}: <b>${qs1.length} questions</b></div>
  <div class="stat">${esc(tech2)}: <b>${qs2.length} questions</b></div>
</div>

<h2>Side-by-side comparison</h2>
<div style="overflow-x:auto;margin-bottom:32px">
<table style="width:100%;border-collapse:collapse;border:1px solid rgba(255,255,255,.09);border-radius:10px;overflow:hidden">
  <thead>
    <tr style="background:#0c0c0f">
      <th style="padding:12px 14px;text-align:left;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#52525b">Aspect</th>
      <th style="padding:12px 14px;text-align:left;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#f59e0b">${esc(tech1)}</th>
      <th style="padding:12px 14px;text-align:left;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#60a5fa">${esc(tech2)}</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
</div>

<h2>Interview questions for ${esc(tech1)} (${qs1.length} total)</h2>
<p style="color:#a1a1aa;font-size:13px;margin-bottom:16px">Companies asking: ${companies1.join(', ')}</p>
${qs1.sort((a,b)=>b.upvotes-a.upvotes).slice(0,4).map((q,i)=>qCard(q,i+1)).join('\n')}
<p style="margin-top:12px"><a href="/questions/tech/${slug(tech1)}/" class="pill">See all ${qs1.length} ${esc(tech1)} questions →</a></p>

<h2>Interview questions for ${esc(tech2)} (${qs2.length} total)</h2>
<p style="color:#a1a1aa;font-size:13px;margin-bottom:16px">Companies asking: ${companies2.join(', ')}</p>
${qs2.sort((a,b)=>b.upvotes-a.upvotes).slice(0,4).map((q,i)=>qCard(q,i+1)).join('\n')}
<p style="margin-top:12px"><a href="/questions/tech/${slug(tech2)}/" class="pill">See all ${qs2.length} ${esc(tech2)} questions →</a></p>

${practiceBlock('', '')}
${relatedSection('Related comparisons', COMPARISONS.filter(c=>c.slug!==comp.slug).map(c=>({ label: c.h1, href: `/compare/${c.slug}/` })))}`;

  write(`compare/${comp.slug}/index.html`, shell({
    title: comp.title, desc: comp.desc, canonical, h1: comp.h1, bodyHtml,
    faqItems: [
      { q: `Should I learn ${tech1} or ${tech2} for interviews?`, a: `${tech1} has ${qs1.length} questions from ${companies1.slice(0,3).join(', ')}. ${tech2} has ${qs2.length} questions from ${companies2.slice(0,3).join(', ')}. The best choice depends on your target company.` },
    ],
    breadcrumb: [{ label: 'Compare', href: '/compare/' }, { label: `${tech1} vs ${tech2}`, href: canonical }],
  }));
});

console.log(`[seo] Generated comparison pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 11. COMPANY + ROLE PAGES  /companies/[company]/[role]-interview-questions/
//     e.g. "Business Analyst Interview Questions at Accenture"
// ═══════════════════════════════════════════════════════════════════════════
const companyRoleMap = new Map();

QUESTIONS.forEach(q => {
  if (!q.role) return;
  const key = `${q.company}:${slug(q.role)}`;
  if (!companyRoleMap.has(key)) companyRoleMap.set(key, { questions: [], company: COMPANY_MAP[q.company], role: q.role, roleSlug: slug(q.role) });
  companyRoleMap.get(key).questions.push(q);
});

companyRoleMap.forEach(({ questions, company, role, roleSlug }) => {
  if (!company || questions.length < 2) return;
  const compSlug = slug(company.name);
  const canonical = `/companies/${compSlug}/${roleSlug}-interview-questions/`;
  const title = `${role} Interview Questions at ${company.name} ${YEAR}`;
  const h1 = `${role} Interview Questions at ${company.name}`;
  const desc = `${questions.length} real ${role} interview questions asked at ${company.name}. Covers ${[...new Set(questions.map(q => q.round))].join(', ')} rounds. Sourced from engineers who cleared the loop.`;

  const topicFreq = {};
  questions.forEach(q => { const t = q.topic || q.topicPath; if (t) topicFreq[t] = (topicFreq[t] || 0) + 1; });
  const topTopics = Object.entries(topicFreq).sort((a,b) => b[1]-a[1]).slice(0, 5);

  const expFreq = {};
  questions.forEach(q => { if (q.experience) expFreq[q.experience] = (expFreq[q.experience] || 0) + 1; });
  const topExp = Object.entries(expFreq).sort((a,b) => b[1]-a[1]).slice(0, 4);

  const roundFreq = {};
  questions.forEach(q => { if (q.round) roundFreq[q.round] = (roundFreq[q.round] || 0) + 1; });

  const sameRoleCompanies = [...new Set(
    QUESTIONS.filter(q => q.role === role && q.company !== company.id)
      .map(q => COMPANY_MAP[q.company]?.name).filter(Boolean)
  )].slice(0, 6);

  const faqItems = [
    { q: `What topics does ${company.name} ask ${role}s?`, a: topTopics.length ? `Common topics: ${topTopics.map(([t])=>t).join(', ')}.` : 'Topics vary by team.' },
    { q: `What rounds are there in ${company.name} ${role} interview?`, a: `Reported rounds: ${Object.keys(roundFreq).join(', ')}.` },
    { q: `What experience level does ${company.name} hire ${role}s at?`, a: topExp.length ? `Most reported experience: ${topExp[0][0]}.` : 'Experience levels vary by team.' },
  ];

  const signalsHtml = `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:32px">
  <div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:16px;background:#0c0c0f">
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-bottom:10px">Frequently Asked Topics</div>
    ${topTopics.map(([t,n]) => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#d4d4d8;border-bottom:1px solid rgba(255,255,255,.04)"><span>${esc(t)}</span><span style="color:#a1a1aa;font-family:monospace">${n}x</span></div>`).join('')}
  </div>
  <div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:16px;background:#0c0c0f">
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-bottom:10px">Interview Rounds</div>
    ${Object.entries(roundFreq).map(([r,n]) => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#d4d4d8;border-bottom:1px solid rgba(255,255,255,.04)"><span>${esc(r)}</span><span style="color:#a1a1aa;font-family:monospace">${n}q</span></div>`).join('')}
  </div>
  ${topExp.length ? `<div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:16px;background:#0c0c0f">
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-bottom:10px">Experience Level</div>
    ${topExp.map(([e,n]) => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#d4d4d8;border-bottom:1px solid rgba(255,255,255,.04)"><span>${esc(e)}</span><span style="color:#a1a1aa;font-family:monospace">${n}q</span></div>`).join('')}
  </div>` : ''}
</div>`;

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
<div class="stat-row">
  <div class="stat"><b>${questions.length}</b> questions</div>
  <div class="stat"><b>${questions.reduce((s,q)=>s+q.upvotes,0)}</b> upvotes</div>
  <div class="stat">Rounds: <b>${Object.keys(roundFreq).length}</b></div>
  ${topTopics.length ? `<div class="stat">Top topic: <b>${esc(topTopics[0][0])}</b></div>` : ''}
</div>
<h2>Interview Signals — What ${esc(company.name)} Asks ${esc(role)}s</h2>
${signalsHtml}
<h2>All ${esc(role)} Questions Asked at ${esc(company.name)}</h2>
${questions.sort((a,b) => b.upvotes-a.upvotes).map((q,i) => qCard(q,i+1)).join('\n')}
${practiceBlock(company.name, role)}
${sameRoleCompanies.length ? relatedSection(`Other companies hiring ${esc(role)}s`, sameRoleCompanies.map(n => {
  const co = COMPANIES.find(c => c.name===n);
  return co ? { label: `${n} ${role} questions`, href: `/companies/${slug(n)}/${roleSlug}-interview-questions/` } : null;
}).filter(Boolean)) : ''}
${relatedSection(`More at ${esc(company.name)}`, [
  { label: `All ${esc(company.name)} questions`, href: `/questions/company/${compSlug}/` },
  { label: `${esc(company.name)} interview process`, href: `/interview-process/${compSlug}/` },
  { label: `Prepare for ${esc(company.name)}`, href: `/prepare/${compSlug}/`, accent: true },
])}`;

  write(`companies/${compSlug}/${roleSlug}-interview-questions/index.html`, shell({
    title, desc, canonical, h1, bodyHtml, faqItems,
    breadcrumb: [
      { label: 'Companies', href: '/companies/' },
      { label: company.name, href: `/companies/${compSlug}/` },
      { label: `${role} Questions`, href: canonical },
    ],
  }));
});

console.log(`[seo] Generated company+role pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 12. ROLE PAGES  /roles/[role]/interview-questions/
//     e.g. "Full Stack Developer Interview Questions — All Companies"
// ═══════════════════════════════════════════════════════════════════════════
const roleMap = new Map();

QUESTIONS.forEach(q => {
  if (!q.role) return;
  const rs = slug(q.role);
  if (!roleMap.has(rs)) roleMap.set(rs, { questions: [], role: q.role, roleSlug: rs });
  roleMap.get(rs).questions.push(q);
});

roleMap.forEach(({ questions, role, roleSlug }) => {
  if (questions.length < 3) return;
  const canonical = `/roles/${roleSlug}/interview-questions/`;
  const uniqueCompanies = [...new Set(questions.map(q => COMPANY_MAP[q.company]?.name).filter(Boolean))];
  const title = `${role} Interview Questions ${YEAR} — All Companies`;
  const h1 = `${role} Interview Questions`;
  const desc = `${questions.length} verified ${role} interview questions from ${uniqueCompanies.slice(0, 5).join(', ')}${uniqueCompanies.length > 5 ? ' and more' : ''}. Covers all experience levels.`;

  const companyFreq = {};
  questions.forEach(q => { const n = COMPANY_MAP[q.company]?.name; if (n) companyFreq[n] = (companyFreq[n]||0)+1; });
  const topCompanies = Object.entries(companyFreq).sort((a,b) => b[1]-a[1]);

  const expFreq = {};
  questions.forEach(q => { if (q.experience) expFreq[q.experience] = (expFreq[q.experience]||0)+1; });

  const topicFreq = {};
  questions.forEach(q => { const t = q.topic || q.topicPath; if (t) topicFreq[t] = (topicFreq[t]||0)+1; });
  const topTopics = Object.entries(topicFreq).sort((a,b) => b[1]-a[1]).slice(0, 5);

  const signalsHtml = `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:32px">
  <div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:16px;background:#0c0c0f">
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-bottom:10px">Companies Asking</div>
    ${topCompanies.slice(0, 6).map(([n,c]) => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#d4d4d8;border-bottom:1px solid rgba(255,255,255,.04)"><span>${esc(n)}</span><span style="color:#a1a1aa;font-family:monospace">${c}q</span></div>`).join('')}
  </div>
  ${topTopics.length ? `<div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:16px;background:#0c0c0f">
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-bottom:10px">Most Asked Topics</div>
    ${topTopics.map(([t,n]) => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#d4d4d8;border-bottom:1px solid rgba(255,255,255,.04)"><span>${esc(t)}</span><span style="color:#a1a1aa;font-family:monospace">${n}x</span></div>`).join('')}
  </div>` : ''}
  ${Object.keys(expFreq).length ? `<div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:16px;background:#0c0c0f">
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-bottom:10px">By Experience</div>
    ${Object.entries(expFreq).sort((a,b) => b[1]-a[1]).map(([e,n]) => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#d4d4d8;border-bottom:1px solid rgba(255,255,255,.04)"><span>${esc(e)}</span><span style="color:#a1a1aa;font-family:monospace">${n}q</span></div>`).join('')}
  </div>` : ''}
</div>`;

  const faqItems = [
    { q: `What do ${role} interviews cover?`, a: topTopics.length ? `Common topics: ${topTopics.map(([t])=>t).join(', ')}.` : 'Technical and behavioral rounds are typical.' },
    { q: `Which companies hire ${role}s?`, a: `Companies with reported questions: ${topCompanies.slice(0,5).map(([n])=>n).join(', ')}.` },
  ];

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
<div class="stat-row">
  <div class="stat"><b>${questions.length}</b> questions</div>
  <div class="stat"><b>${topCompanies.length}</b> companies</div>
  <div class="stat"><b>${questions.reduce((s,q)=>s+q.upvotes,0)}</b> upvotes</div>
</div>
<h2>Interview Signals for ${esc(role)} Roles</h2>
${signalsHtml}
<h2>Top Questions by Upvotes</h2>
${questions.sort((a,b) => b.upvotes-a.upvotes).slice(0, 12).map((q,i) => qCard(q,i+1)).join('\n')}
${practiceBlock('', role)}
${relatedSection(`${esc(role)} by company`, topCompanies.slice(0, 8).map(([n]) => {
  const co = COMPANIES.find(c => c.name===n);
  return co ? { label: `${n} ${role} questions`, href: `/companies/${slug(n)}/${roleSlug}-interview-questions/` } : null;
}).filter(Boolean))}`;

  write(`roles/${roleSlug}/interview-questions/index.html`, shell({
    title, desc, canonical, h1, bodyHtml, faqItems,
    breadcrumb: [
      { label: 'Roles', href: '/roles/' },
      { label: role, href: `/roles/${roleSlug}/` },
      { label: 'Interview Questions', href: canonical },
    ],
  }));
});

console.log(`[seo] Generated role pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 13. INTERVIEW EXPERIENCE PAGES  /interview-experience/[company]/
//     "PayU Frontend Developer Interview Experience — Rounds & Topics"
// ═══════════════════════════════════════════════════════════════════════════
const expPagesMap = new Map();

QUESTIONS.forEach(q => {
  if (!q.source || !['Interview Experience', 'My Interview', 'Glassdoor'].includes(q.source)) return;
  const co = COMPANY_MAP[q.company];
  if (!co) return;
  if (!expPagesMap.has(q.company)) expPagesMap.set(q.company, { questions: [], company: co });
  expPagesMap.get(q.company).questions.push(q);
});

expPagesMap.forEach(({ questions, company }) => {
  if (questions.length < 3) return;
  const compSlug = slug(company.name);
  const canonical = `/interview-experience/${compSlug}/`;
  const rounds = [...new Set(questions.map(q => q.round).filter(Boolean))];
  const title = `${company.name} Interview Experience ${YEAR} — Rounds, Questions & Tips`;
  const h1 = `${company.name} Interview Experience`;
  const desc = `Real ${company.name} interview experiences from engineers. ${questions.length} questions covering ${rounds.join(', ')} rounds. What to expect and how to prepare.`;

  const roundFreq = {};
  questions.forEach(q => { if (q.round) roundFreq[q.round] = (roundFreq[q.round]||0)+1; });

  const topicFreq = {};
  questions.forEach(q => { const t = q.topic||q.topicPath; if (t) topicFreq[t]=(topicFreq[t]||0)+1; });
  const topTopics = Object.entries(topicFreq).sort((a,b) => b[1]-a[1]).slice(0, 6);

  const roleFreq = {};
  questions.forEach(q => { if (q.role) roleFreq[q.role] = (roleFreq[q.role]||0)+1; });
  const topRoles = Object.entries(roleFreq).sort((a,b) => b[1]-a[1]).slice(0, 4);

  const roundsHtml = Object.entries(roundFreq).map(([round, count]) => {
    const roundQs = questions.filter(q => q.round===round).sort((a,b) => b.upvotes-a.upvotes).slice(0, 3);
    return `
<div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:20px;margin-bottom:20px;background:#0c0c0f">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
    <h3 style="font-size:15px;font-weight:600;color:#f4f4f5">${esc(round)} Round</h3>
    <span style="font-family:monospace;font-size:11px;color:#a1a1aa;background:rgba(255,255,255,.06);padding:3px 10px;border-radius:20px">${count} reported</span>
  </div>
  ${roundQs.map(q => `<div style="padding:10px 0;border-top:1px solid rgba(255,255,255,.05)">
    <p style="font-size:13px;color:#d4d4d8;line-height:1.65">${esc(trunc(q.body, 200))}</p>
    <div style="margin-top:6px;font-family:monospace;font-size:10px;color:#52525b">↑${q.upvotes} · ${esc(q.difficulty)}${q.experience ? ` · ${esc(q.experience)}` : ''}</div>
  </div>`).join('')}
</div>`;
  }).join('');

  const faqItems = [
    { q: `How many rounds does ${company.name} have?`, a: `Reported rounds: ${Object.keys(roundFreq).join(', ')}.` },
    { q: `What topics are asked at ${company.name}?`, a: topTopics.length ? `Frequently asked: ${topTopics.map(([t])=>t).join(', ')}.` : 'Topics vary by role.' },
    { q: `What roles does ${company.name} interview for?`, a: topRoles.length ? topRoles.map(([r])=>r).join(', ') : 'Multiple engineering roles.' },
  ];

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
<div class="stat-row">
  <div class="stat"><b>${questions.length}</b> reported questions</div>
  <div class="stat"><b>${Object.keys(roundFreq).length}</b> rounds</div>
  <div class="stat">Most asked: <b>${esc(topTopics[0]?.[0] || 'Various')}</b></div>
  ${topRoles.length ? `<div class="stat">Top role: <b>${esc(topRoles[0][0])}</b></div>` : ''}
</div>

<h2>Frequently Asked Topics</h2>
<div class="pill-grid" style="margin-bottom:32px">
${topTopics.map(([t,n]) => `<span class="pill">${esc(t)} <span style="color:#52525b">(${n})</span></span>`).join('\n')}
</div>

<h2>Round-by-Round Breakdown</h2>
${roundsHtml}
${practiceBlock(company.name, '')}
${relatedSection(`More from ${esc(company.name)}`, [
  { label: `All ${esc(company.name)} questions`, href: `/questions/company/${compSlug}/` },
  { label: `${esc(company.name)} interview process`, href: `/interview-process/${compSlug}/` },
  { label: `Prepare for ${esc(company.name)}`, href: `/prepare/${compSlug}/`, accent: true },
])}`;

  write(`interview-experience/${compSlug}/index.html`, shell({
    title, desc, canonical, h1, bodyHtml, faqItems,
    breadcrumb: [
      { label: 'Interview Experience', href: '/interview-experience/' },
      { label: company.name, href: canonical },
    ],
  }));
});

console.log(`[seo] Generated interview experience pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 14. INTERVIEW GUIDE PAGES  /guide/[company]-[role]/
//     "Which questions should I care about?" — evidence-backed prep playbook
// ═══════════════════════════════════════════════════════════════════════════
const DIFF_WEIGHT = { Easy: 1, Medium: 2, Hard: 3 };

function difficultyLabel(qs) {
  const avg = qs.reduce((s, q) => s + (DIFF_WEIGHT[q.difficulty] || 2), 0) / qs.length;
  if (avg >= 2.6) return { label: 'Mostly Hard', color: '#ef4444', bars: '⬛⬛⬛⬜' };
  if (avg >= 1.8) return { label: 'Medium–Hard', color: '#f59e0b', bars: '⬛⬛⬜⬜' };
  return { label: 'Medium', color: '#22c55e', bars: '⬛⬜⬜⬜' };
}

const guideMap = new Map(); // key: "companyId:roleSlug"

QUESTIONS.forEach(q => {
  if (!q.role) return;
  const key = `${q.company}:${slug(q.role)}`;
  if (!guideMap.has(key)) guideMap.set(key, { questions: [], company: COMPANY_MAP[q.company], role: q.role, roleSlug: slug(q.role) });
  guideMap.get(key).questions.push(q);
});

guideMap.forEach(({ questions, company, role, roleSlug }) => {
  if (!company || questions.length < 3) return;
  const compSlug = slug(company.name);
  const canonical = `/guide/${compSlug}-${roleSlug}/`;
  const title = `${company.name} ${role} Interview Guide ${YEAR}`;
  const h1 = `${company.name} ${role} Interview Guide`;
  const desc = `Evidence-backed preparation playbook for ${company.name} ${role} interviews. ${questions.length} reported questions, top topics, difficulty breakdown, and a free assessment.`;

  const diff = difficultyLabel(questions);

  // Topic frequency ranked
  const topicFreq = {};
  questions.forEach(q => { const t = q.topicPath || q.topic; if (t) topicFreq[t] = (topicFreq[t] || 0) + 1; });
  const rankedTopics = Object.entries(topicFreq).sort((a, b) => b[1] - a[1]);

  // Round frequency
  const roundFreq = {};
  questions.forEach(q => { if (q.round) roundFreq[q.round] = (roundFreq[q.round] || 0) + 1; });

  // Experience range
  const expFreq = {};
  questions.forEach(q => { if (q.experience) expFreq[q.experience] = (expFreq[q.experience] || 0) + 1; });
  const topExp = Object.entries(expFreq).sort((a, b) => b[1] - a[1]).slice(0, 2);

  // Top questions by upvotes
  const topQs = [...questions].sort((a, b) => b.upvotes - a.upvotes).slice(0, 6);

  // Other companies with same role
  const sameRole = [...new Set(
    QUESTIONS.filter(q => q.role === role && q.company !== company.id)
      .map(q => COMPANY_MAP[q.company]?.name).filter(Boolean)
  )].slice(0, 5);

  const focusAreasHtml = `
<div style="border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:24px;margin-bottom:32px;background:#0c0c0f">
  <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#52525b;margin-bottom:16px">Topics most frequently reported</div>
  ${rankedTopics.slice(0, 6).map(([t, n], i) => {
    const pct = Math.round((n / questions.length) * 100);
    const marker = i < 3 ? `<span style="color:#22c55e;margin-right:6px">✓</span>` : `<span style="color:#52525b;margin-right:6px">·</span>`;
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)">
      <span style="font-size:14px;color:${i < 3 ? '#f4f4f5' : '#a1a1aa'}">${marker}${esc(t)}</span>
      <span style="font-family:monospace;font-size:12px;color:#52525b">${n} question${n > 1 ? 's' : ''} · ${pct}%</span>
    </div>`;
  }).join('')}
</div>`;

  const statsHtml = `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:32px">
  <div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:18px;background:#0c0c0f;text-align:center">
    <div style="font-size:32px;font-weight:700;color:#f4f4f5;letter-spacing:-.02em">${questions.length}</div>
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-top:4px">Questions reported</div>
  </div>
  <div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:18px;background:#0c0c0f;text-align:center">
    <div style="font-size:22px;font-weight:700;color:${diff.color};letter-spacing:-.01em">${diff.label}</div>
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-top:4px">Difficulty</div>
  </div>
  <div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:18px;background:#0c0c0f;text-align:center">
    <div style="font-size:18px;font-weight:700;color:#f4f4f5">${topExp.length ? esc(topExp[0][0]) : 'All levels'}</div>
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-top:4px">Most reported exp</div>
  </div>
  <div style="border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:18px;background:#0c0c0f;text-align:center">
    <div style="font-size:18px;font-weight:700;color:#f4f4f5">${Object.keys(roundFreq).length}</div>
    <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#52525b;margin-top:4px">Interview rounds</div>
  </div>
</div>`;

  const roundsHtml = Object.entries(roundFreq).length ? `
<div style="margin-bottom:32px">
  <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#52525b;margin-bottom:12px">Rounds reported</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px">
    ${Object.entries(roundFreq).sort((a,b)=>b[1]-a[1]).map(([r,n])=>`<span class="pill">${esc(r)} <span style="color:#52525b;font-size:10px">${n}q</span></span>`).join('')}
  </div>
</div>` : '';

  const assessmentCtaHtml = `
<div style="margin:40px 0;padding:28px 32px;border-radius:12px;background:linear-gradient(135deg,rgba(59,111,212,.12),rgba(245,158,11,.08));border:1px solid rgba(59,111,212,.3)">
  <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#6b8dd6;margin-bottom:8px">Free · 10 minutes</div>
  <h3 style="font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:8px">Know your gaps before the interview</h3>
  <p style="color:#a1a1aa;font-size:14px;line-height:1.7;margin-bottom:20px">Answer 10 questions from this exact pool. Get a personalised readiness score for <strong style="color:#f4f4f5">${esc(company.name)} ${esc(role)}</strong> and a focused study plan targeting only your weak areas.</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap">
    <a href="/app/plan" class="cta" style="display:inline-block;background:#3B6FD4">Take free assessment →</a>
    <a href="/app/plan" class="cta" style="display:inline-block;background:transparent;border:1px solid rgba(245,158,11,.4);color:#f59e0b">Build study plan</a>
  </div>
</div>`;

  const faqItems = [
    { q: `How hard is the ${company.name} ${role} interview?`, a: `${diff.label} difficulty based on ${questions.length} reported questions. Most questions cover ${rankedTopics.slice(0,3).map(([t])=>t).join(', ')}.` },
    { q: `What topics does ${company.name} ask ${role}s?`, a: `Top reported topics: ${rankedTopics.slice(0,5).map(([t,n])=>`${t} (${n} questions)`).join(', ')}.` },
    { q: `How many rounds does ${company.name} have for ${role}?`, a: Object.keys(roundFreq).length ? `Reported rounds: ${Object.keys(roundFreq).join(', ')}.` : 'Round count varies by team.' },
    { q: `What experience level does ${company.name} hire ${role}s at?`, a: topExp.length ? `Most reported: ${topExp.map(([e])=>e).join(' and ')}.` : 'Varies by position.' },
  ];

  const bodyHtml = `
<p class="subtitle">${esc(desc)}</p>
${statsHtml}
${roundsHtml}
${focusAreasHtml}
${assessmentCtaHtml}
<h2>Top Questions — Ranked by Community Votes</h2>
<p style="color:#a1a1aa;font-size:13px;margin-bottom:20px">These ${topQs.length} questions appeared most in ${esc(company.name)} ${esc(role)} reports. Master these first.</p>
${topQs.map((q, i) => qCard(q, i + 1)).join('\n')}
<p style="margin-top:16px"><a href="/companies/${compSlug}/${roleSlug}-interview-questions/" class="pill">See all ${questions.length} questions →</a></p>
${sameRole.length ? relatedSection(`Same role at other companies`, sameRole.map(n => {
  const co2 = COMPANIES.find(c => c.name === n);
  return co2 ? { label: `${n} ${role} guide`, href: `/guide/${slug(n)}-${roleSlug}/`, accent: true } : null;
}).filter(Boolean)) : ''}
${relatedSection(`More at ${esc(company.name)}`, [
  { label: `All ${esc(company.name)} questions`, href: `/questions/company/${compSlug}/` },
  { label: `${esc(company.name)} interview process`, href: `/interview-process/${compSlug}/` },
  { label: `${esc(company.name)} ${role} questions`, href: `/companies/${compSlug}/${roleSlug}-interview-questions/` },
])}`;

  write(`guide/${compSlug}-${roleSlug}/index.html`, shell({
    title, desc, canonical, h1, bodyHtml, faqItems,
    breadcrumb: [
      { label: 'Guides', href: '/guide/' },
      { label: company.name, href: `/questions/company/${compSlug}/` },
      { label: `${role} Guide`, href: canonical },
    ],
  }));
});

console.log(`[seo] Generated interview guide pages`);

// ═══════════════════════════════════════════════════════════════════════════
// 15. SITEMAP.XML
// ═══════════════════════════════════════════════════════════════════════════
const today = new Date().toISOString().split('T')[0];
const staticPages = [
  '/', '/app/questions', '/app/plan', '/app/practice', '/app/daily-review',
  '/questions/', '/interview-process/', '/prepare/', '/tools/', '/compare/',
  '/companies/', '/roles/', '/interview-experience/', '/guide/',
];

// Interview Intelligence SPA routes — crawlable via Helmet meta + SPA fallback.
// /company/[slug], /role/[slug], /interview-experiences/[company]-[role]
const intelRoles = [...new Set(QUESTIONS.map(q => q.role).filter(Boolean))];
COMPANIES.filter(c => QUESTIONS.some(q => q.company === c.id)).forEach(c => {
  const cs = slug(c.name);
  staticPages.push(`/company/${cs}`);
  [...new Set(QUESTIONS.filter(q => q.company === c.id).map(q => q.role).filter(Boolean))]
    .forEach(r => staticPages.push(`/interview-experiences/${cs}-${slug(r)}`));
});
intelRoles.forEach(r => staticPages.push(`/role/${slug(r)}`));

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
