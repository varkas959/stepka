import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { COMPANIES, QUESTIONS } from '../lib/mockData';
import { getSession } from '../lib/auth';

// ── Palette ───────────────────────────────────────────────────
const C = {
  bg:      '#080B18',
  bg2:     '#0E1225',
  bg3:     '#141830',
  lime:    '#B8FF3C',
  text1:   '#E8E8F0',
  text2:   '#6B7099',
  text3:   '#3A3F5C',
  border:  'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.08)',
};

const ACTIVE_COMPANY_IDS = new Set(QUESTIONS.map(q => q.company));
const ACTIVE_COMPANIES = COMPANIES.filter(c => ACTIVE_COMPANY_IDS.has(c.id));

const PREVIEW_SKILLS = [
  { name: 'Selenium',      score: 84, color: '#22c55e' },
  { name: 'Java',          score: 71, color: '#22c55e' },
  { name: 'SQL',           score: 55, color: '#f59e0b' },
  { name: 'Playwright',    score: 28, color: '#ef4444' },
  { name: 'System Design', score: 19, color: '#ef4444' },
];

export default function Home() {
  const [session, setSession] = useState(null);
  useEffect(() => { getSession().then(setSession); }, []);
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text1 }}>
      <HomeNav session={session} />
      <Hero session={session} />
      <Features />
      <CompaniesStrip />
      <FinalCTA session={session} />
      <Footer />
    </div>
  );
}

const HomeNav = ({ session }) => (
  <header className="sticky top-0 z-30 backdrop-blur" style={{ borderBottom: `1px solid ${C.border}`, background: `rgba(8,11,24,0.88)` }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5" data-testid="home-logo">
        <div className="w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-sm" style={{ background: C.lime, color: C.bg }}>sk</div>
        <span className="font-mono font-semibold tracking-tight" style={{ color: C.text1 }}>Stepkai</span>
      </Link>
      <nav className="hidden sm:flex items-center gap-6 font-mono text-sm" style={{ color: C.text2 }}>
        <a href="#features" className="transition-colors hover:opacity-80">Features</a>
      </nav>
      <div className="flex items-center gap-2">
        {session && (
          <Link to="/app/questions" data-testid="nav-open-app"
            className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] px-3 sm:px-4 py-2 rounded-md transition-all hover:brightness-110"
            style={{ background: C.lime, color: C.bg }}>
            Open app <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </div>
  </header>
);

// ── Engineering grid — the signature element ──────────────────
const Grid = () => (
  <div className="absolute inset-0 pointer-events-none" style={{
    backgroundImage: `linear-gradient(${C.text3}18 1px, transparent 1px), linear-gradient(90deg, ${C.text3}18 1px, transparent 1px)`,
    backgroundSize: '72px 72px',
  }} />
);

const ReadinessPreview = () => (
  <div className="relative hidden lg:block">
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border2}`, background: C.bg2, boxShadow: `0 0 80px -20px ${C.lime}28` }}>
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: `1px solid ${C.border}`, background: `${C.bg}80` }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.text3 }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.text3 }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.text3 }} />
        <span className="ml-3 font-mono text-[10px] tracking-wider" style={{ color: C.text3 }}>stepkai · readiness report</span>
      </div>

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: C.text2 }}>Capgemini · SDET</div>
            <div className="font-mono text-[10px]" style={{ color: C.text3 }}>
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-5xl font-bold leading-none" style={{ color: C.lime }}>61</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: C.text3 }}>readiness</div>
          </div>
        </div>

        {/* Skill bars */}
        <div className="space-y-3 mb-6">
          {PREVIEW_SKILLS.map(s => (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs" style={{ color: C.text2 }}>{s.name}</span>
                <span className="font-mono text-xs font-medium" style={{ color: s.color }}>{s.score}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: C.bg3 }}>
                <div className="h-1.5 rounded-full" style={{ width: `${s.score}%`, background: s.color, opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Gap alert */}
        <div className="rounded-md px-4 py-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-400 mb-1">2 critical gaps</div>
          <div className="font-mono text-sm" style={{ color: C.text1 }}>Playwright · System Design</div>
        </div>

        <div className="mt-4 flex items-center gap-2 font-mono text-xs" style={{ color: C.text3 }}>
          <span style={{ color: C.lime }}>›</span> 10-question deep-dive ready
        </div>
      </div>
    </div>
  </div>
);

const Hero = ({ session }) => (
  <section className="relative px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-20 overflow-hidden">
    <Grid />
    <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded mb-8 font-mono text-[10px] uppercase tracking-[0.18em]"
             style={{ border: `1px solid ${C.border2}`, background: C.bg2, color: C.text2 }}>
          <span style={{ color: C.lime }}>›</span> {QUESTIONS.length} verified questions · {ACTIVE_COMPANIES.length} companies
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-bold leading-[0.92] tracking-tight" style={{ color: C.text1 }}>
          Know exactly<br />
          <span style={{ color: C.text3 }}>what to prep.</span>
        </h1>

        <p className="mt-7 text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: C.text2 }}>
          Paste any JD and get a focused prep plan. Real interview questions from TCS, Infosys, Wipro and Indian tech companies. AI graded practice built for experienced engineers switching roles.
        </p>

        <div className="mt-9 flex items-center gap-4 flex-wrap">
          <Link to="/app/questions" data-testid="hero-cta"
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-3 rounded-md transition-all hover:brightness-110"
            style={{ background: C.lime, color: C.bg, boxShadow: `0 0 0 1px ${C.lime}50, 0 0 32px -8px ${C.lime}40` }}>
            Start prepping <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <span className="font-mono text-xs" style={{ color: C.text3 }}>free · no credit card</span>
        </div>

        <div className="hidden sm:flex items-center gap-10 mt-12 font-mono text-xs">
          <Stat value={`${QUESTIONS.length}+`} label="verified questions" />
          <Stat value={`${ACTIVE_COMPANIES.length}`} label="companies" />
          <Stat value="SRS" label="spaced repetition" />
        </div>
      </div>

      <ReadinessPreview />
    </div>
  </section>
);

const Stat = ({ value, label }) => (
  <div>
    <div className="text-xl font-semibold" style={{ color: C.text1 }}>{value}</div>
    <div className="uppercase tracking-[0.18em] mt-0.5 text-[9px]" style={{ color: C.text3 }}>{label}</div>
  </div>
);

const FEATURES = [
  { label: '01', title: 'Real interview questions', text: 'Browse questions submitted by engineers who actually sat the loop. Filter by company, role, topic, round.' },
  { label: '02', title: 'Spaced repetition', text: "Daily SRS queue with 4-rating recall scoring. The algorithm rebuilds tomorrow's queue from your honest signal." },
  { label: '03', title: 'JD-driven study plan', text: 'Paste a job description. We extract requirements, map your mastery, and generate a focused two-week prep plan.' },
  { label: '04', title: 'AI-graded practice', text: 'Submit text or code answers. Graded on correctness, depth, examples, edge cases. No hand-waving.' },
];

const Features = () => (
  <section id="features" className="px-4 sm:px-6 py-14 sm:py-20" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-6xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: C.text3 }}>What's in the box</div>
      <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-10 sm:mb-14" style={{ color: C.text1 }}>Four loops. One system.</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        {FEATURES.map((f, i) => (
          <div key={f.label} className="relative p-6 sm:p-8"
               style={{ background: C.bg2, borderRight: i % 2 === 0 ? `1px solid ${C.border}` : 'none', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
            <div className="absolute left-0 top-6 bottom-6 w-px" style={{ background: `${C.lime}60` }} />
            <div className="font-mono text-[10px] mb-4" style={{ color: C.text3 }}>{f.label}</div>
            <div className="font-medium text-lg mb-2" style={{ color: C.text1 }}>{f.title}</div>
            <p className="leading-relaxed text-sm" style={{ color: C.text2 }}>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CompaniesStrip = () => (
  <section className="px-4 sm:px-6 py-12" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-6xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] mb-5 text-center" style={{ color: C.text3 }}>Questions from</div>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center sm:gap-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ACTIVE_COMPANIES.map(c => (
          <div key={c.id} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-[11px]"
                 style={{ background: c.color + '18', color: c.color, border: `1px solid ${c.color}30` }}>
              {c.initials}
            </div>
            <span className="font-mono text-sm whitespace-nowrap" style={{ color: C.text2 }}>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = ({ session }) => (
  <section className="relative px-4 sm:px-6 py-14 sm:py-24 overflow-hidden" style={{ borderTop: `1px solid ${C.border}` }}>
    <Grid />
    <div className="relative max-w-3xl mx-auto text-center">
      <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight" style={{ color: C.text1 }}>
        Switch companies.<br className="hidden sm:block" /> Don't guess.
      </h2>
      <p className="mt-4 leading-relaxed" style={{ color: C.text2 }}>Free to start. Real questions, real grading, real signal.</p>
      <ul className="font-mono text-sm mt-8 inline-block text-left space-y-2" style={{ color: C.text2 }}>
        <li className="flex items-center gap-2.5"><Check size={13} className="text-emerald-400 shrink-0" /> {QUESTIONS.length}+ questions across {ACTIVE_COMPANIES.length} companies — browse free</li>
        <li className="flex items-center gap-2.5"><Check size={13} className="text-emerald-400 shrink-0" /> Free Google / LinkedIn sign-in for full access</li>
        <li className="flex items-center gap-2.5"><Check size={13} className="text-emerald-400 shrink-0" /> No spam, no recruiter calls, no ads</li>
      </ul>
      <div className="mt-10">
        <Link to="/app/questions" data-testid="final-cta"
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-6 py-3.5 rounded-md transition-all hover:brightness-110"
          style={{ background: C.lime, color: C.bg, boxShadow: `0 0 0 1px ${C.lime}50, 0 0 40px -10px ${C.lime}40` }}>
          Start prepping — it's free <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="mt-auto px-4 sm:px-6 py-8 font-mono text-xs" style={{ borderTop: `1px solid ${C.border}`, color: C.text3 }}>
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px]" style={{ background: C.lime, color: C.bg }}>sk</div>
        <span>stepkai.com · © 2026</span>
      </div>
      <div className="flex items-center gap-5">
        <Link to="/feedback" className="transition-colors hover:opacity-80">Feedback</Link>
        <Link to="/privacy" className="transition-colors hover:opacity-80" data-testid="footer-privacy">Privacy</Link>
        <Link to="/terms" className="transition-colors hover:opacity-80" data-testid="footer-terms">Terms</Link>
        <a href="mailto:hi@stepkai.com" className="transition-colors hover:opacity-80">Contact</a>
      </div>
    </div>
  </footer>
);
