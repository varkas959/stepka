import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, Clock } from 'lucide-react';
import { COMPANIES, QUESTIONS } from '../lib/mockData';
import { getSession } from '../lib/auth';

const C = {
  bg:      '#0C0E14',
  bg2:     '#181B24',
  bg3:     '#1C2030',
  border:  '#262B3A',
  border2: '#343A4D',
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
    <div className="hidden md:flex flex-col rounded-xl overflow-hidden"
         style={{ border: `1px solid ${C.border}`, background: C.bg2, minWidth: 0 }}>

      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between"
           style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.text3 }}>Readiness Report</span>
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
  <section className="px-6 pt-14 pb-20">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

      {/* Left */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: C.text3 }}>
          {QUESTIONS.length}+ questions · {ACTIVE_COMPANIES.length} companies
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-tight"
            style={{ color: C.text1, letterSpacing: '-0.03em' }}>
          Stop preparing<br />
          everything.<br />
          <span style={{ color: C.text3 }}>Prepare what the<br />interview actually<br />requires.</span>
        </h1>

        <p className="mt-6 text-base leading-relaxed max-w-md" style={{ color: C.text2 }}>
          Upload a job description, discover your skill gaps, and get a personalised preparation plan based on your target role.
        </p>

        <div className="flex items-center gap-4 mt-9 flex-wrap">
          <Link to="/app/plan" data-testid="hero-cta"
            className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-opacity hover:opacity-90 text-white"
            style={{ background: C.accent, fontSize: '15px' }}>
            Start Free Assessment <ArrowRight size={15} strokeWidth={2.5} />
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

      {/* Right — rotating report card */}
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
