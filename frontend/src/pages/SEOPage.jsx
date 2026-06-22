import { Link, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ArrowLeft, TrendingUp } from 'lucide-react';
import { QUESTIONS, COMPANIES, TECH_STACK, TOPIC_TREE } from '../lib/mockData';

// ── helpers ──────────────────────────────────────────────────────────────────
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const unslug  = (s) => s.replace(/-/g, ' ');

// Build lookup maps
const COMPANY_BY_SLUG  = Object.fromEntries(COMPANIES.map(c => [slugify(c.name), c]));
const TOPIC_LABELS     = TOPIC_TREE.flatMap(n => n.children ? n.children : [n]);
const TOPIC_BY_SLUG    = Object.fromEntries(TOPIC_LABELS.map(t => [slugify(t.name), t]));
const TECH_BY_SLUG     = Object.fromEntries(TECH_STACK.map(t => [slugify(t), t]));

// All companies/topics/techs that actually have questions
const ACTIVE_COMPANIES = COMPANIES.filter(c => QUESTIONS.some(q => q.company === c.id));
const ACTIVE_TOPICS    = TOPIC_LABELS.filter(t => QUESTIONS.some(q => q.topic === t.id));
const ACTIVE_TECHS     = TECH_STACK.filter(t => QUESTIONS.some(q => (q.tech || []).includes(t)));

function QuestionList({ questions, title }) {
  return (
    <div className="space-y-4 mt-6">
      {questions.length === 0 && (
        <p className="text-zinc-500 font-mono text-sm">No questions found.</p>
      )}
      {questions.map(q => {
        const company = COMPANIES.find(c => c.id === q.company);
        return (
          <div key={q.id} className="rounded-lg border border-white/10 bg-zinc-950 p-5 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="font-mono text-[11px] px-2 py-0.5 rounded" style={{ background: (company?.color || '#888') + '22', color: company?.color || '#888', border: `1px solid ${(company?.color || '#888')}44` }}>{company?.name}</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-white/10 text-zinc-400">{q.role}</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-white/10 text-zinc-400">{q.topicPath}</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-white/10 text-zinc-400">{q.difficulty}</span>
            </div>
            <p className="text-zinc-100 text-sm leading-relaxed line-clamp-3">{q.body.replace(/\n/g, ' ')}</p>
            <div className="mt-3 font-mono text-xs text-zinc-600">↑ {q.upvotes} upvotes · {q.asked} people asked this</div>
          </div>
        );
      })}
    </div>
  );
}

function RelatedLinks({ currentKind, currentSlug }) {
  return (
    <div className="mt-12 pt-8 border-t border-white/5">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-4">Browse more</h3>
      <div className="flex flex-wrap gap-2">
        {ACTIVE_COMPANIES.slice(0, 8).map(c => (
          <Link key={c.id} to={`/questions/company/${slugify(c.name)}`}
            className="font-mono text-xs px-2.5 py-1 rounded border border-white/10 text-zinc-400 hover:text-zinc-50 hover:border-white/25 transition-colors">
            {c.name}
          </Link>
        ))}
        {ACTIVE_TOPICS.map(t => (
          <Link key={t.id} to={`/questions/topic/${slugify(t.name)}`}
            className="font-mono text-xs px-2.5 py-1 rounded border border-white/10 text-zinc-400 hover:text-zinc-50 hover:border-white/25 transition-colors">
            {t.name}
          </Link>
        ))}
        {ACTIVE_TECHS.slice(0, 6).map(t => (
          <Link key={t} to={`/questions/tech/${slugify(t)}`}
            className="font-mono text-xs px-2.5 py-1 rounded border border-white/10 text-zinc-400 hover:text-zinc-50 hover:border-white/25 transition-colors">
            {t}
          </Link>
        ))}
        <Link to="/questions/trending"
          className="font-mono text-xs px-2.5 py-1 rounded border transition-colors" style={{ borderColor: 'rgba(59,111,212,0.3)', color: '#7AA9F7' }}>
          🔥 Trending
        </Link>
      </div>
    </div>
  );
}

function PageShell({ title, description, children, slug, kind }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Helmet>
        <title>{title} | Stepkai</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | Stepkai`} />
        <meta property="og:description" content={description} />
        <link rel="canonical" href={`https://www.stepkai.com/questions/${kind}/${slug || ''}`} />
      </Helmet>

      {/* Nav */}
      <header className="border-b border-white/5 sticky top-0 z-30 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-white text-xs" style={{ background: 'var(--accent)' }}>S</div>
            <span className="font-mono font-semibold text-sm">Stepkai</span>
          </Link>
          <Link to="/app/questions" className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--accent)' }}>
            Browse all <ArrowRight size={11} strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/app/questions" className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft size={12} /> Back to all questions
        </Link>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="text-zinc-400 mt-3 text-sm leading-relaxed max-w-2xl">{description}</p>
        {children}
        <RelatedLinks kind={kind} slug={slug} />
      </main>
    </div>
  );
}

// ── Page variants ─────────────────────────────────────────────────────────────
function TrendingPage() {
  const questions = [...QUESTIONS]
    .sort((a, b) => (b.upvotes + b.asked * 2) - (a.upvotes + a.asked * 2))
    .slice(0, 30);
  return (
    <PageShell
      title="Trending Interview Questions 2025"
      description={`The ${questions.length} most popular interview questions right now, ranked by upvotes and how many engineers reported being asked them. Updated daily.`}
      kind="trending"
    >
      <div className="mt-4 inline-flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded" style={{ color: '#7AA9F7', background: 'rgba(59,111,212,0.06)', border: '1px solid rgba(59,111,212,0.2)' }}>
        <TrendingUp size={12} /> Ranked by upvotes + times asked
      </div>
      <QuestionList questions={questions} />
    </PageShell>
  );
}

function CompanyPage() {
  const { slug } = useParams();
  const company = COMPANY_BY_SLUG[slug];
  if (!company) return <Navigate to="/questions/trending" replace />;
  const questions = [...QUESTIONS]
    .filter(q => q.company === company.id)
    .sort((a, b) => b.upvotes - a.upvotes);
  return (
    <PageShell
      title={`${company.name} Interview Questions 2025`}
      description={`${questions.length} real interview questions asked at ${company.name}. Submitted by engineers who went through the ${company.name} interview process. Filter by role, topic, and difficulty.`}
      kind="company"
      slug={slug}
    >
      <QuestionList questions={questions} />
    </PageShell>
  );
}

function TopicPage() {
  const { slug } = useParams();
  const topic = TOPIC_BY_SLUG[slug];
  const topicName = topic?.name || unslug(slug);
  const questions = [...QUESTIONS]
    .filter(q => q.topic === (topic?.id || slug) || q.topicPath.toLowerCase().includes(topicName.toLowerCase()))
    .sort((a, b) => b.upvotes - a.upvotes);
  return (
    <PageShell
      title={`${topicName} Interview Questions 2025`}
      description={`${questions.length} ${topicName} interview questions from top tech companies. Real questions asked in technical rounds, with upvote counts and frequency data.`}
      kind="topic"
      slug={slug}
    >
      <QuestionList questions={questions} />
    </PageShell>
  );
}

function TechPage() {
  const { slug } = useParams();
  const tech = TECH_BY_SLUG[slug] || unslug(slug);
  const questions = [...QUESTIONS]
    .filter(q => (q.tech || []).some(t => slugify(t) === slug))
    .sort((a, b) => b.upvotes - a.upvotes);
  return (
    <PageShell
      title={`${tech} Interview Questions 2025`}
      description={`${questions.length} ${tech} interview questions from real interviews at top companies. Covers all difficulty levels and roles.`}
      kind="tech"
      slug={slug}
    >
      <QuestionList questions={questions} />
    </PageShell>
  );
}

// ── Entry point ───────────────────────────────────────────────────────────────
export default function SEOPage({ kind }) {
  if (kind === 'trending') return <TrendingPage />;
  if (kind === 'company')  return <CompanyPage />;
  if (kind === 'topic')    return <TopicPage />;
  if (kind === 'tech')     return <TechPage />;
  return null;
}
