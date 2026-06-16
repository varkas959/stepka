import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, Clock } from 'lucide-react';
import { COMPANIES, QUESTIONS } from '../lib/mockData';
import { getSession } from '../lib/auth';

const C = {
  bg:      '#0C0E14',
  bg2:     '#141720',
  bg3:     '#1C2030',
  border:  '#272B3F',
  border2: '#323752',
  text1:   '#F2F2F4',
  text2:   '#8B8FA8',
  text3:   '#4B5270',
  accent:  '#3B6FD4',
  green:   '#22C55E',
  amber:   '#F59E0B',
  red:     '#EF4444',
};

const ACTIVE_COMPANY_IDS = new Set(QUESTIONS.map(q => q.company));
const ACTIVE_COMPANIES = COMPANIES.filter(c => ACTIVE_COMPANY_IDS.has(c.id));

const REPORT_STRENGTHS = [
  { name: 'Java',            score: 84 },
  { name: 'SQL',             score: 71 },
  { name: 'Data Structures', score: 68 },
];
const REPORT_GAPS = [
  { name: 'System Design',       score: 19 },
  { name: 'Distributed Systems', score: 24 },
  { name: 'Kafka / Streams',     score: 38 },
];

export default function Home() {
  const [session, setSession] = useState(null);
  useEffect(() => { getSession().then(setSession); }, []);
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text1 }}>
      <HomeNav session={session} />
      <Hero />
      <HowItWorks />
      <CompaniesStrip />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
const HomeNav = ({ session }) => (
  <header className="sticky top-0 z-30 backdrop-blur-sm" style={{ borderBottom: `1px solid ${C.border}`, background: `${C.bg}E6` }}>
    <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5" data-testid="home-logo">
        <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white" style={{ background: C.accent }}>S</div>
        <span className="font-semibold text-sm tracking-tight" style={{ color: C.text1 }}>Stepkai</span>
      </Link>
      <nav className="hidden sm:flex items-center gap-6 text-sm" style={{ color: C.text2 }}>
        <a href="#how-it-works" className="hover:opacity-80 transition-opacity">How it works</a>
        <a href="#companies" className="hover:opacity-80 transition-opacity">Companies</a>
      </nav>
      <div className="flex items-center gap-3">
        {session ? (
          <Link to="/app/questions" data-testid="nav-open-app"
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

// ─── Report card ─────────────────────────────────────────────────────────────
const ReadinessReport = () => (
  <div className="hidden lg:flex flex-col rounded-xl overflow-hidden"
       style={{ border: `1px solid ${C.border}`, background: C.bg2 }}>
    {/* Report header */}
    <div className="px-5 py-3 flex items-center justify-between"
         style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.text3 }}>Readiness Report</span>
      <span className="font-mono text-[10px]" style={{ color: C.text3 }}>
        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    </div>

    {/* Candidate + role */}
    <div className="px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold" style={{ color: C.text1 }}>Amazon</div>
          <div className="font-mono text-xs mt-0.5" style={{ color: C.text3 }}>SDE2 · Technical loop</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-4xl font-semibold leading-none" style={{ color: C.amber }}>61<span className="text-xl">%</span></div>
          <div className="font-mono text-[10px] mt-1 uppercase tracking-[0.15em]" style={{ color: C.amber }}>Interview Ready</div>
        </div>
      </div>
      {/* Score gauge */}
      <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: C.bg3 }}>
        <div className="h-full rounded-full" style={{ width: '61%', background: C.amber }} />
      </div>
      <div className="font-mono text-[10px] mt-2" style={{ color: C.text3 }}>
        3 gaps to close before loop
      </div>
    </div>

    {/* Strengths + Gaps */}
    <div className="grid grid-cols-2 flex-1">
      <div className="px-5 py-4" style={{ borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: C.green }}>Strengths</div>
        <div className="space-y-2.5">
          {REPORT_STRENGTHS.map(s => (
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
          {REPORT_GAPS.map(s => (
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
    <div className="px-5 py-3 flex items-center justify-between" style={{ background: C.bg }}>
      <div className="flex items-center gap-2">
        <Clock size={11} style={{ color: C.text3 }} />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: C.text3 }}>Estimated Preparation</div>
          <div className="font-mono text-sm font-semibold mt-0.5" style={{ color: C.text1 }}>3 weeks · 45 min/day</div>
        </div>
      </div>
      <Link to="/app/plan" className="font-mono text-xs hover:opacity-80 transition-opacity" style={{ color: C.accent }}>
        Start assessment →
      </Link>
    </div>
  </div>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────
const STEPS = [
  'Paste a JD.',
  'Identify gaps.',
  'Practice what matters.',
  'Track readiness over time.',
];

const Hero = () => (
  <section className="px-6 pt-16 pb-20">
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
      <div className="lg:pt-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: C.text3 }}>
          {QUESTIONS.length}+ questions · {ACTIVE_COMPANIES.length} companies
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight"
            style={{ color: C.text1, letterSpacing: '-0.03em' }}>
          Measure your<br />
          readiness<br />
          <span style={{ color: C.text3 }}>for any role.</span>
        </h1>

        <div className="mt-8 space-y-2 pl-4" style={{ borderLeft: `2px solid ${C.border2}` }}>
          {STEPS.map((line, i) => (
            <div key={i} className="text-base" style={{ color: i < 2 ? C.text2 : C.text3 }}>{line}</div>
          ))}
        </div>

        {/* Mobile-only score snapshot */}
        <div className="lg:hidden mt-8 rounded-lg p-4 flex items-center justify-between"
             style={{ border: `1px solid ${C.border}`, background: C.bg2 }}>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: C.text3 }}>Example · Amazon SDE2</div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-semibold" style={{ color: C.amber }}>61%</span>
              <span className="text-xs" style={{ color: C.text3 }}>3 gaps to close</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: C.green }}>✓ Java, SQL</div>
            <div className="text-xs mt-0.5" style={{ color: C.red }}>✗ System Design</div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-10 flex-wrap">
          <Link to="/app/plan" data-testid="hero-cta"
            className="inline-flex items-center gap-2 font-medium px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90 text-white"
            style={{ background: C.accent, fontSize: '15px' }}>
            Assess your readiness <ArrowRight size={15} strokeWidth={2} />
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
          <Stat value="30q" label="Per assessment" />
        </div>
      </div>

      <ReadinessReport />
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

const HowItWorks = () => (
  <section id="how-it-works" className="px-6 py-20" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-6xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: C.text3 }}>How it works</div>
      <h2 className="text-3xl font-bold tracking-tight mb-14" style={{ color: C.text1, letterSpacing: '-0.02em' }}>
        Assessment before practice.
      </h2>
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        {PROCESS.map((step, i) => (
          <div key={i} className="flex gap-8 sm:gap-12 py-6 items-start"
               style={{ borderBottom: i < PROCESS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div className="font-mono text-xs shrink-0 w-6 mt-0.5" style={{ color: C.text3 }}>0{i + 1}</div>
            <div className="w-44 sm:w-56 shrink-0">
              <div className="font-semibold text-sm leading-snug" style={{ color: C.text1 }}>{step.action}</div>
            </div>
            <div className="text-sm leading-relaxed" style={{ color: C.text2 }}>{step.outcome}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Companies ───────────────────────────────────────────────────────────────
const CompaniesStrip = () => (
  <section id="companies" className="px-6 py-16" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-6xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-8 text-center" style={{ color: C.text3 }}>
        Questions from engineers at
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center sm:gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {ACTIVE_COMPANIES.map(c => (
          <div key={c.id} className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg"
               style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
            <div className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center"
                 style={{ background: c.color + '20', color: c.color }}>
              {c.initials[0]}
            </div>
            <span className="text-sm whitespace-nowrap" style={{ color: C.text2 }}>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Final CTA ───────────────────────────────────────────────────────────────
const FinalCTA = () => (
  <section className="px-6 py-24" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: C.text1, letterSpacing: '-0.02em' }}>
        You can't improve<br />what you haven't measured.
      </h2>
      <p className="text-lg mb-10" style={{ color: C.text2 }}>
        Free to start. Takes 15 minutes. No credit card.
      </p>
      <ul className="space-y-3 mb-10">
        {[
          `${QUESTIONS.length}+ verified questions across ${ACTIVE_COMPANIES.length} companies`,
          'Readiness score calculated from your actual assessment — not self-reported',
          'Your data stays private. We never sell it.',
        ].map(item => (
          <li key={item} className="flex items-start gap-3 text-sm" style={{ color: C.text2 }}>
            <Check size={14} className="shrink-0 mt-0.5" style={{ color: C.green }} />
            {item}
          </li>
        ))}
      </ul>
      <Link to="/app/plan" data-testid="final-cta"
        className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-lg transition-opacity hover:opacity-90 text-white"
        style={{ background: C.accent, fontSize: '15px' }}>
        Start the assessment <ArrowRight size={15} strokeWidth={2} />
      </Link>
    </div>
  </section>
);

// ─── Footer ──────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="mt-auto px-6 py-8 text-sm" style={{ borderTop: `1px solid ${C.border}`, color: C.text3 }}>
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white" style={{ background: C.accent }}>S</div>
        <span>Stepkai · © 2026</span>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/feedback" className="hover:opacity-80 transition-opacity">Feedback</Link>
        <Link to="/privacy" className="hover:opacity-80 transition-opacity" data-testid="footer-privacy">Privacy</Link>
        <Link to="/terms" className="hover:opacity-80 transition-opacity" data-testid="footer-terms">Terms</Link>
        <a href="mailto:hi@stepkai.com" className="hover:opacity-80 transition-opacity">Contact</a>
      </div>
    </div>
  </footer>
);
