import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check, X, Clock, Target, ArrowUp } from 'lucide-react';
import { COMPANIES, QUESTIONS } from '../lib/mockData';
import { getSession } from '../lib/auth';

const C = {
  bg:      'var(--page)',
  bg2:     'var(--surface)',
  bg3:     'var(--surface-2)',
  border:  'var(--border)',
  border2: 'var(--border-2)',
  text1:   'var(--text-1)',
  text2:   'var(--text-2)',
  text3:   'var(--text-3)',
  accent:  'var(--accent)',
  green:   '#22C55E',
  amber:   '#F59E0B',
  red:     '#EF4444',
};

const ACTIVE_COMPANY_IDS = new Set(QUESTIONS.map(q => q.company));
const ACTIVE_COMPANIES = COMPANIES.filter(c => ACTIVE_COMPANY_IDS.has(c.id));

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Brand motif: ascending "steps" = readiness climbing ─────────────────────
const StepMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect x="3"  y="17" width="6" height="8"  rx="1.5" fill="var(--accent)" opacity="0.45" />
    <rect x="11" y="11" width="6" height="14" rx="1.5" fill="var(--accent)" opacity="0.72" />
    <rect x="19" y="4"  width="6" height="21" rx="1.5" fill="var(--accent)" />
  </svg>
);

// ─── Scroll-reveal wrapper (delight) ─────────────────────────────────────────
const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(18px)',
               transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.4,0,.2,1) ${delay}ms` }}>
      {children}
    </div>
  );
};

// Section eyebrow with the step motif — a small repeated visual signature
const Eyebrow = ({ children }) => (
  <div className="flex items-center gap-2 mb-3">
    <StepMark size={16} />
    <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-3)' }}>{children}</span>
  </div>
);

const PROFILES = [
  {
    company: 'Amazon', role: 'Senior SDE', readiness: 61,
    strengths: [{ name: 'Java', score: 84 }, { name: 'SQL', score: 71 }, { name: 'Data Structures', score: 68 }],
    gaps:      [{ name: 'System Design', score: 19 }, { name: 'Distributed Systems', score: 24 }, { name: 'Kafka / Streams', score: 38 }],
    weeks: 3,
  },
  {
    company: 'Atlassian', role: 'Product Owner', readiness: 58,
    strengths: [{ name: 'Stakeholder Mgmt', score: 79 }, { name: 'Backlog Grooming', score: 72 }, { name: 'User Stories', score: 65 }],
    gaps:      [{ name: 'OKR Alignment', score: 22 }, { name: 'Release Planning', score: 31 }, { name: 'Roadmapping', score: 41 }],
    weeks: 4,
  },
  {
    company: 'Google', role: 'Business Analyst', readiness: 72,
    strengths: [{ name: 'Data Analysis', score: 88 }, { name: 'SQL', score: 76 }, { name: 'Requirements', score: 70 }],
    gaps:      [{ name: 'Process Mapping', score: 28 }, { name: 'Change Management', score: 35 }, { name: 'Stakeholder Reports', score: 44 }],
    weeks: 2,
  },
  {
    company: 'PhonePe', role: 'Scrum Master', readiness: 54,
    strengths: [{ name: 'Sprint Planning', score: 81 }, { name: 'Retrospectives', score: 69 }, { name: 'Agile Coaching', score: 63 }],
    gaps:      [{ name: 'Metrics & Reporting', score: 17 }, { name: 'Dependency Mgmt', score: 29 }, { name: 'Scaled Agile', score: 36 }],
    weeks: 4,
  },
  {
    company: 'Netflix', role: 'Data Engineer', readiness: 67,
    strengths: [{ name: 'Python', score: 86 }, { name: 'Apache Spark', score: 73 }, { name: 'Data Modelling', score: 66 }],
    gaps:      [{ name: 'Flink / Streaming', score: 21 }, { name: 'ML Pipelines', score: 33 }, { name: 'Cost Optimisation', score: 45 }],
    weeks: 3,
  },
];

export default function Home() {
  const [session, setSession] = useState(null);
  useEffect(() => { getSession().then(setSession); }, []);
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text1 }}>
      <Helmet>
        <link rel="canonical" href="https://www.stepkai.com/" />
      </Helmet>
      <HomeNav session={session} />
      <Hero />
      <TrustBar />
      <ProductShowcase />
      <HowItWorks />
      <CompaniesStrip />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
const HomeNav = ({ session }) => (
  <header className="sticky top-0 z-30 backdrop-blur-sm" style={{ borderBottom: `1px solid ${C.border}`, background: 'var(--surface-blur)' }}>
    <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2" data-testid="home-logo">
        <StepMark size={24} />
        <span className="font-semibold text-sm tracking-tight" style={{ color: C.text1 }}>Stepkai</span>
      </Link>
      <nav className="hidden sm:flex items-center gap-6 text-sm" style={{ color: C.text2 }}>
        <a href="#how-it-works" className="hover:opacity-80 transition-opacity">How it works</a>
        <a href="#companies" className="hover:opacity-80 transition-opacity">Companies</a>
        <a href="/questions/" className="hover:opacity-80 transition-opacity">Questions</a>
      </nav>
      <div className="flex items-center gap-3">
        {session ? (
          <Link to="/app/plan" data-testid="nav-open-app"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-md transition-opacity hover:opacity-90 text-white"
            style={{ background: C.accent }}>
            Open app <ArrowRight size={13} strokeWidth={2} />
          </Link>
        ) : (
          <Link to="/app/plan"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-md transition-opacity hover:opacity-90 text-white"
            style={{ background: C.accent }}>
            Assess your readiness
          </Link>
        )}
      </div>
    </div>
  </header>
);

// ─── Rotating report card ─────────────────────────────────────────────────────
const ReadinessReport = () => {
  const [idx, setIdx]       = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % PROFILES.length);
        setVisible(true);
      }, 320);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const p = PROFILES[idx];
  const scoreClr = p.readiness >= 75 ? C.green : p.readiness >= 50 ? C.amber : C.red;
  const scoreLabel = p.readiness >= 75 ? 'Loop Ready' : p.readiness >= 50 ? 'Interview Ready' : 'Needs Prep';

  return (
    <div className="flex flex-col rounded-xl overflow-hidden"
         style={{ border: `1px solid ${C.border}`, background: C.bg2, minWidth: 0 }}>

      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between"
           style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.text3 }}>Example Report</span>
        <span className="font-mono text-[10px]" style={{ color: C.text3 }}>
          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Animated content */}
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        {/* Candidate + score */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold" style={{ color: C.text1 }}>{p.company}</div>
              <div className="font-mono text-xs mt-1" style={{ color: C.text3 }}>{p.role} · Technical loop</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono font-semibold leading-none" style={{ fontSize: 48, color: scoreClr }}>
                {p.readiness}<span style={{ fontSize: 22 }}>%</span>
              </div>
              <div className="font-mono text-[10px] mt-1.5 uppercase tracking-[0.15em]" style={{ color: scoreClr }}>{scoreLabel}</div>
            </div>
          </div>
          <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: C.bg3 }}>
            <div className="h-full rounded-full" style={{ width: `${p.readiness}%`, background: scoreClr, transition: 'width 0.6s ease' }} />
          </div>
          <div className="font-mono text-[10px] mt-2" style={{ color: C.text3 }}>
            {p.gaps.length} gaps to close before loop
          </div>
        </div>

        {/* Strengths + Gaps */}
        <div className="grid grid-cols-2">
          <div className="px-5 py-4" style={{ borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: C.green }}>Strengths</div>
            <div className="space-y-2.5">
              {p.strengths.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <Check size={11} strokeWidth={2.5} style={{ color: C.green, flexShrink: 0 }} />
                  <span className="text-xs flex-1 truncate" style={{ color: C.text2 }}>{s.name}</span>
                  <span className="font-mono text-xs ml-auto" style={{ color: C.green }}>{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: C.red }}>Weak Areas</div>
            <div className="space-y-2.5">
              {p.gaps.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <X size={11} strokeWidth={2.5} style={{ color: C.red, flexShrink: 0 }} />
                  <span className="text-xs flex-1 truncate" style={{ color: C.text2 }}>{s.name}</span>
                  <span className="font-mono text-xs ml-auto" style={{ color: C.red }}>{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prep estimate */}
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: C.bg }}>
          <div className="flex items-center gap-2.5">
            <Clock size={12} style={{ color: C.text3 }} />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: C.text3 }}>Estimated Preparation</div>
              <div className="font-mono text-sm font-semibold mt-0.5" style={{ color: C.text1 }}>{p.weeks} weeks · 45 min/day</div>
            </div>
          </div>
          <Link to="/app/plan" className="font-mono text-xs hover:opacity-80 transition-opacity" style={{ color: C.accent }}>
            Start assessment →
          </Link>
        </div>
      </div>

      {/* Profile dots */}
      <div className="flex items-center justify-center gap-1.5 py-3" style={{ background: C.bg }}>
        {PROFILES.map((_, i) => (
          <button key={i} onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 320); }}
            className="rounded-full transition-all"
            style={{ width: i === idx ? 16 : 6, height: 6, background: i === idx ? C.accent : C.border2 }} />
        ))}
      </div>
    </div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section className="px-6 pt-14 pb-20 relative overflow-hidden">
    {/* Steps motif watermark — brand signature, faint */}
    <div className="absolute -right-10 -top-6 pointer-events-none hidden lg:block" style={{ opacity: 0.5 }}>
      <svg width="320" height="320" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="3"  y="17" width="6" height="8"  rx="1.5" fill="var(--accent)" opacity="0.05" />
        <rect x="11" y="11" width="6" height="14" rx="1.5" fill="var(--accent)" opacity="0.07" />
        <rect x="19" y="4"  width="6" height="21" rx="1.5" fill="var(--accent)" opacity="0.09" />
      </svg>
    </div>
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center relative">

      {/* Left */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <StepMark size={15} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.text3 }}>
            {QUESTIONS.length}+ questions · {ACTIVE_COMPANIES.length} companies
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-tight"
            style={{ color: C.text1, letterSpacing: '-0.03em' }}>
          Stop preparing<br />
          everything.<br />
          <span style={{ color: C.text3 }}>Prepare what the<br />interview actually<br />requires.</span>
        </h1>

        <p className="mt-6 text-lg leading-relaxed max-w-md" style={{ color: C.text2 }}>
          Walk into your next interview knowing <span style={{ color: C.text1, fontWeight: 500 }}>exactly what to study</span> — not everything, just what this role actually tests.
        </p>

        <div className="flex items-center gap-4 mt-9 flex-wrap">
          <Link to="/app/plan" data-testid="hero-cta"
            className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded-lg transition-transform hover:-translate-y-0.5 text-white"
            style={{ background: C.accent, fontSize: '15px', boxShadow: '0 8px 24px -10px var(--accent)' }}>
            Analyze my JD — free <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
          <Link to="/app/questions"
            className="text-sm transition-opacity hover:opacity-80"
            style={{ color: C.text3 }}>
            Browse questions first
          </Link>
        </div>

        <div className="flex items-center gap-8 mt-12 pt-8" style={{ borderTop: `1px solid ${C.border}` }}>
          <Stat value={`${QUESTIONS.length}+`} label="Verified questions" />
          <Stat value={`${ACTIVE_COMPANIES.length}`} label="Companies tracked" />
          <Stat value="Free" label="To start" />
        </div>
      </div>

      {/* Right — example report (rotating illustration, not live user data) */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5 justify-center md:justify-start">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.text3 }}>Example readiness report</span>
        </div>
        <ReadinessReport />
      </div>
    </div>
  </section>
);

const Stat = ({ value, label }) => (
  <div>
    <div className="font-mono text-xl font-semibold" style={{ color: C.text1 }}>{value}</div>
    <div className="text-xs mt-0.5" style={{ color: C.text3 }}>{label}</div>
  </div>
);

// ─── How it works ─────────────────────────────────────────────────────────────
const PROCESS = [
  {
    action: 'Paste a job description',
    outcome: 'We extract every required skill and rank them by interview weight for your target company and role.',
  },
  {
    action: 'Take the assessment',
    outcome: '30 mixed-format questions — MCQ, scenario, ranking, free-text — calibrated to the actual interview loop.',
  },
  {
    action: 'Review your gap report',
    outcome: 'A scored readiness profile: which skills are strong, which are failing, and by how much.',
  },
  {
    action: 'Practice what matters',
    outcome: 'AI-graded answers on exactly the skills that failed. Calibrated feedback, not praise. Score updates in real time.',
  },
];

// Each step indents further right — the brand "steps" motif made literal,
// so the section reads as a climb toward readiness.
const STEP_INDENT = ['', 'sm:ml-10', 'sm:ml-20', 'sm:ml-32'];
const HowItWorks = () => (
  <section id="how-it-works" className="px-6 py-24" style={{ borderTop: `1px solid ${C.border}`, background: C.bg2 }}>
    <div className="max-w-5xl mx-auto">
      <Reveal>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12" style={{ color: C.text1, letterSpacing: '-0.02em' }}>
          Four steps to interview-ready.
        </h2>
      </Reveal>
      <div className="space-y-3">
        {PROCESS.map((step, i) => {
          const last = i === PROCESS.length - 1;
          return (
            <Reveal key={i} delay={i * 90} className={STEP_INDENT[i]}>
              <div className="flex gap-4 items-start rounded-xl p-4 sm:p-5 transition-colors hover:border-[var(--border-2)]"
                   style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm font-bold"
                     style={last
                       ? { background: 'var(--accent)', color: '#fff' }
                       : { background: 'var(--accent-12)', color: C.accent, border: '1px solid var(--accent-35)' }}>
                  0{i + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-base leading-snug mb-1" style={{ color: C.text1 }}>{step.action}</div>
                  <div className="text-sm leading-relaxed" style={{ color: C.text2 }}>{step.outcome}</div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

// ─── Companies ───────────────────────────────────────────────────────────────
const CompanyCard = ({ c }) => {
  const [hover, setHover] = useState(false);
  return (
    <Link to={`/questions/company/${slugify(c.name)}`}
         className="flex items-center gap-2.5 shrink-0 px-3.5 py-2.5 rounded-xl transition-all duration-200"
         onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         style={{ background: C.bg2, border: `1px solid ${hover ? c.color + '66' : C.border}`,
                  transform: hover ? 'translateY(-2px)' : 'none',
                  boxShadow: hover ? `0 8px 22px -12px ${c.color}` : 'none',
                  textDecoration: 'none' }}>
      <div className="w-8 h-8 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors"
           style={{ background: hover ? c.color : c.color + '1f', color: hover ? '#fff' : c.color }}>
        {c.initials}
      </div>
      <span className="text-sm font-medium whitespace-nowrap" style={{ color: hover ? C.text1 : C.text2 }}>{c.name}</span>
    </Link>
  );
};

const TOPIC_LINKS = [
  { label: 'System Design', href: '/questions/topic/system-design' },
  { label: 'DSA', href: '/questions/topic/dsa' },
  { label: 'Java', href: '/questions/tech/java' },
  { label: 'Python', href: '/questions/tech/python' },
  { label: 'Distributed Systems', href: '/questions/tech/distributed-systems' },
  { label: 'Kafka', href: '/questions/tech/kafka' },
  { label: 'AWS', href: '/questions/tech/aws' },
  { label: 'Spring Boot', href: '/questions/tech/spring-boot' },
  { label: 'Behavioral', href: '/questions/topic/behavioral' },
  { label: 'Trending', href: '/questions/trending' },
];

const CompaniesStrip = () => (
  <section id="companies" className="px-6 py-20" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="flex items-center justify-center gap-2 mb-10">
          <StepMark size={15} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.text3 }}>
            Questions from engineers at
          </span>
        </div>
      </Reveal>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center sm:gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {ACTIVE_COMPANIES.map(c => <CompanyCard key={c.id} c={c} />)}
      </div>

      {/* Topic / tech browse links — internal links for SEO and user navigation */}
      <Reveal>
        <div className="mt-12 pt-10" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.text3 }}>
              Browse by topic
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {TOPIC_LINKS.map(t => (
              <Link key={t.href} to={t.href}
                className="font-mono text-xs px-3 py-1.5 rounded-md border transition-colors hover:border-white/25 hover:text-zinc-50"
                style={{ borderColor: C.border, color: C.text3, textDecoration: 'none' }}>
                {t.label}
              </Link>
            ))}
            <Link to="/questions"
              className="font-mono text-xs px-3 py-1.5 rounded-md border transition-colors"
              style={{ borderColor: 'rgba(59,111,212,0.4)', color: C.accent, textDecoration: 'none' }}>
              Browse all questions →
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

// ─── Final CTA ───────────────────────────────────────────────────────────────
const FinalCTA = () => (
  <section className="px-6 py-24" style={{ borderTop: '1px solid var(--accent-35)', background: 'var(--accent-20)' }}>
    <div className="max-w-3xl mx-auto relative">
      {/* large faint steps motif — brand signature watermark */}
      <div className="absolute -top-6 right-0 opacity-[0.5] pointer-events-none hidden sm:block">
        <svg width="120" height="120" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="3"  y="17" width="6" height="8"  rx="1.5" fill="var(--accent)" opacity="0.18" />
          <rect x="11" y="11" width="6" height="14" rx="1.5" fill="var(--accent)" opacity="0.28" />
          <rect x="19" y="4"  width="6" height="21" rx="1.5" fill="var(--accent)" opacity="0.4" />
        </svg>
      </div>
      <Reveal>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: C.text1, letterSpacing: '-0.02em' }}>
          You can't improve<br />what you haven't measured.
        </h2>
        <p className="text-lg mb-9" style={{ color: C.text2 }}>
          Free to start. Takes 15 minutes. No credit card.
        </p>
        <ul className="space-y-3 mb-10">
          {[
            `${QUESTIONS.length}+ verified questions across ${ACTIVE_COMPANIES.length} companies`,
            'Readiness score from your actual assessment — not self-reported',
            'Your data stays private. We never sell it.',
          ].map(item => (
            <li key={item} className="flex items-start gap-3 text-sm" style={{ color: C.text2 }}>
              <Check size={14} className="shrink-0 mt-0.5" style={{ color: C.green }} />
              {item}
            </li>
          ))}
        </ul>
        <Link to="/app/plan" data-testid="final-cta"
          className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-lg transition-transform hover:-translate-y-0.5 text-white shadow-lg"
          style={{ background: C.accent, fontSize: '16px', boxShadow: '0 8px 24px -8px var(--accent)' }}>
          Generate my interview plan <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </Reveal>
    </div>
  </section>
);

// ─── Trust bar ───────────────────────────────────────────────────────────────
const TRUST_STATS = [
  { value: `${QUESTIONS.length}+`, label: 'Verified questions' },
  { value: `${ACTIVE_COMPANIES.length}`, label: 'Companies tracked' },
  { value: '4', label: 'Question formats' },
  { value: '15 min', label: 'To your first score' },
];
const TrustBar = () => (
  <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.bg2 }}>
    <div className="max-w-6xl mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">
      {TRUST_STATS.map(s => (
        <div key={s.label} className="text-center md:text-left">
          <div className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: C.text1 }}>{s.value}</div>
          <div className="text-xs mt-1" style={{ color: C.text3 }}>{s.label}</div>
        </div>
      ))}
    </div>
  </section>
);

// ─── Product showcase — "show the product earlier" ───────────────────────────
const ShowcaseFrame = ({ tag, children }) => (
  <div className="rounded-xl overflow-hidden transition-transform hover:-translate-y-1"
       style={{ border: `1px solid ${C.border}`, background: C.bg2 }}>
    <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ background: C.border2 }} />
        <span className="w-2 h-2 rounded-full" style={{ background: C.border2 }} />
        <span className="w-2 h-2 rounded-full" style={{ background: C.border2 }} />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] ml-1" style={{ color: C.text3 }}>{tag}</span>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const PlanPreview = () => {
  const days = [
    { d: 'Day 1', t: 'System design fundamentals', done: true },
    { d: 'Day 2', t: 'Caching & load balancing', done: true },
    { d: 'Day 3', t: 'Design a rate limiter', done: false },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: C.text1 }}>3-week plan</span>
        <span className="font-mono text-[10px]" style={{ color: C.accent }}>40% done</span>
      </div>
      <div className="space-y-2">
        {days.map(x => (
          <div key={x.d} className="flex items-center gap-2.5 rounded-md px-2.5 py-2" style={{ background: C.bg }}>
            <span className="w-4 h-4 rounded flex items-center justify-center shrink-0"
              style={{ background: x.done ? C.green : 'transparent', border: x.done ? 'none' : `1px solid ${C.border2}` }}>
              {x.done && <Check size={11} strokeWidth={3} color="#fff" />}
            </span>
            <span className="font-mono text-[10px] shrink-0" style={{ color: C.text3 }}>{x.d}</span>
            <span className="text-xs truncate" style={{ color: x.done ? C.text3 : C.text1 }}>{x.t}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: C.bg3 }}>
        <div className="h-full rounded-full" style={{ width: '40%', background: C.accent }} />
      </div>
    </div>
  );
};

const FeedbackPreview = () => (
  <div>
    <div className="flex items-end justify-between mb-3">
      <span className="text-sm font-semibold" style={{ color: C.text1 }}>AI feedback</span>
      <div className="text-right">
        <span className="font-mono text-2xl font-bold leading-none" style={{ color: C.amber }}>72</span>
        <span className="font-mono text-xs" style={{ color: C.text3 }}>/100</span>
      </div>
    </div>
    <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: C.bg3 }}>
      <div className="h-full rounded-full" style={{ width: '72%', background: C.amber }} />
    </div>
    <div className="space-y-2 text-xs">
      <div className="flex items-start gap-2" style={{ color: C.text2 }}>
        <Check size={12} className="shrink-0 mt-0.5" style={{ color: C.green }} /> Correctly identified the consistency trade-off
      </div>
      <div className="flex items-start gap-2" style={{ color: C.text2 }}>
        <X size={12} className="shrink-0 mt-0.5" style={{ color: C.red }} /> Missed the hot-partition failure mode
      </div>
      <div className="flex items-start gap-2" style={{ color: C.text2 }}>
        <Target size={12} className="shrink-0 mt-0.5" style={{ color: C.accent }} /> Tighten your write-throughput estimate
      </div>
    </div>
  </div>
);

const QuestionPreview = () => (
  <div>
    <p className="text-[15px] font-medium leading-snug mb-3" style={{ color: C.text1 }}>
      Design a rate limiter for a distributed API gateway handling 50k requests/second.
    </p>
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center flex-wrap gap-x-1.5 text-[11px]" style={{ color: C.text3 }}>
        <span style={{ color: C.text2 }} className="font-medium">Amazon</span>
        <span>·</span>
        <span>Senior SDE</span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium ml-0.5"
          style={{ border: `1px solid ${C.red}40`, background: `${C.red}10`, color: '#DD9B9B' }}>Hard</span>
        <span className="inline-flex items-center gap-0.5" style={{ color: '#7FC9A0' }}>&#10003; Verified</span>
      </div>
      <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded-[5px]"
        style={{ border: `1px solid ${C.border2}`, color: C.text2 }}>
        <ArrowUp size={12} strokeWidth={2.25} /> 24
      </span>
    </div>
  </div>
);

const SHOWCASE = [
  { tag: 'Study plan', title: 'A plan built around your gaps', desc: 'Not a generic checklist — days are generated from exactly the skills your assessment flagged.', node: <PlanPreview /> },
  { tag: 'AI feedback', title: 'Graded answers, not praise', desc: 'Calibrated scoring with specific misses and fixes — the feedback an honest interviewer would give.', node: <FeedbackPreview /> },
  { tag: 'Question bank', title: 'Real, community-verified questions', desc: 'Tagged by company, role and difficulty, with social proof on the ones that actually get asked.', node: <QuestionPreview /> },
];

const ProductShowcase = () => (
  <section className="px-6 py-24" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <Eyebrow>See exactly what you get</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 max-w-2xl" style={{ color: C.text1, letterSpacing: '-0.02em' }}>
          The product, before you sign up.
        </h2>
        <p className="text-base mb-14 max-w-xl" style={{ color: C.text2 }}>
          No vague promises. Here's the actual output — a plan, a graded answer, and a question card.
        </p>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-5">
        {SHOWCASE.map((s, i) => (
          <Reveal key={s.tag} delay={i * 120}>
            <ShowcaseFrame tag={s.tag}>{s.node}</ShowcaseFrame>
            <div className="mt-4">
              <div className="font-semibold text-sm mb-1" style={{ color: C.text1 }}>{s.title}</div>
              <div className="text-sm leading-relaxed" style={{ color: C.text2 }}>{s.desc}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

// ─── Footer ──────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="mt-auto px-6 py-10 text-sm" style={{ borderTop: `1px solid ${C.border}`, color: C.text3 }}>
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: C.text3 }}>Questions</div>
          <div className="flex flex-col gap-2">
            <a href="/questions/" className="hover:opacity-80 transition-opacity text-xs">All Questions</a>
            <a href="/questions/trending" className="hover:opacity-80 transition-opacity text-xs">Trending</a>
            <a href="/questions/company/amazon" className="hover:opacity-80 transition-opacity text-xs">Amazon</a>
            <a href="/questions/company/google" className="hover:opacity-80 transition-opacity text-xs">Google</a>
            <a href="/questions/company/tcs" className="hover:opacity-80 transition-opacity text-xs">TCS</a>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: C.text3 }}>Prepare</div>
          <div className="flex flex-col gap-2">
            <a href="/interview-process/" className="hover:opacity-80 transition-opacity text-xs">Interview Process</a>
            <a href="/companies/" className="hover:opacity-80 transition-opacity text-xs">Companies</a>
            <a href="/roles/" className="hover:opacity-80 transition-opacity text-xs">Roles</a>
            <a href="/guide/" className="hover:opacity-80 transition-opacity text-xs">Interview Guides</a>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: C.text3 }}>Topics</div>
          <div className="flex flex-col gap-2">
            <a href="/questions/topic/system-design" className="hover:opacity-80 transition-opacity text-xs">System Design</a>
            <a href="/questions/tech/java" className="hover:opacity-80 transition-opacity text-xs">Java</a>
            <a href="/questions/tech/python" className="hover:opacity-80 transition-opacity text-xs">Python</a>
            <a href="/questions/tech/distributed-systems" className="hover:opacity-80 transition-opacity text-xs">Distributed Systems</a>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: C.text3 }}>Stepkai</div>
          <div className="flex flex-col gap-2">
            <Link to="/feedback" className="hover:opacity-80 transition-opacity text-xs">Feedback</Link>
            <Link to="/privacy" className="hover:opacity-80 transition-opacity text-xs" data-testid="footer-privacy">Privacy</Link>
            <Link to="/terms" className="hover:opacity-80 transition-opacity text-xs" data-testid="footer-terms">Terms</Link>
            <a href="mailto:hi@stepkai.com" className="hover:opacity-80 transition-opacity text-xs">Contact</a>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-6" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white" style={{ background: C.accent }}>S</div>
        <span className="text-xs">Stepkai · © 2026</span>
      </div>
    </div>
  </footer>
);
