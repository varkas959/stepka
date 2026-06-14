import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { COMPANIES, QUESTIONS } from '../lib/mockData';
import { getSession } from '../lib/auth';

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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
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
  <header className="border-b border-white/5 sticky top-0 z-30 bg-zinc-950/90 backdrop-blur">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5" data-testid="home-logo">
        <div className="w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-zinc-950 text-sm" style={{ background: '#f59e0b' }}>sk</div>
        <span className="font-mono font-semibold tracking-tight">Stepkai</span>
      </Link>
      <nav className="hidden sm:flex items-center gap-6 font-mono text-sm text-zinc-400">
        <a href="#features" className="hover:text-zinc-50 transition-colors">Features</a>
      </nav>
      <div className="flex items-center gap-2">
        {session && (
          <Link to="/app/questions" data-testid="nav-open-app"
            className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] px-3 sm:px-4 py-2 rounded-md text-zinc-950 hover:brightness-110 transition-all"
            style={{ background: '#f59e0b' }}>
            Open app <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </div>
  </header>
);

const ReadinessPreview = () => (
  <div className="relative hidden lg:block">
    <div className="rounded-xl border border-white/10 bg-zinc-900 overflow-hidden" style={{ boxShadow: '0 0 80px -24px rgba(245,158,11,0.18)' }}>
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-zinc-950/60">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        <span className="ml-3 font-mono text-[10px] text-zinc-600 tracking-wider">stepkai · readiness report</span>
      </div>

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1">Capgemini · SDET</div>
            <div className="font-mono text-[10px] text-zinc-700">assessed {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-5xl font-bold leading-none" style={{ color: '#f59e0b' }}>61</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600 mt-1">readiness</div>
          </div>
        </div>

        {/* Skill bars */}
        <div className="space-y-3 mb-6">
          {PREVIEW_SKILLS.map(s => (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs text-zinc-400">{s.name}</span>
                <span className="font-mono text-xs font-medium" style={{ color: s.color }}>{s.score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${s.score}%`, background: s.color, opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Gap alert */}
        <div className="rounded-md px-4 py-3 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-400 mb-1">2 critical gaps identified</div>
          <div className="font-mono text-sm text-zinc-300">Playwright · System Design</div>
        </div>

        {/* Phantom CTA */}
        <div className="mt-4 flex items-center gap-2 font-mono text-xs text-zinc-600">
          <span className="text-amber-500">›</span> 10-question deep-dive ready
        </div>
      </div>
    </div>
    {/* Subtle grid rule bleeding off bottom-right */}
    <div className="absolute -bottom-px -right-px w-32 h-32 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 100%, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
  </div>
);

const Hero = ({ session }) => (
  <section className="px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-20">
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      {/* Left */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900 mb-8 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          <span style={{ color: '#f59e0b' }}>›</span> {QUESTIONS.length} verified questions · {ACTIVE_COMPANIES.length} companies
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-bold leading-[0.92] tracking-tight">
          Know exactly<br />
          <span className="text-zinc-600">what to prep.</span>
        </h1>

        <p className="mt-7 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
          Paste any JD and get a focused prep plan. Real interview questions from TCS, Infosys, Wipro and Indian tech companies.
          AI graded practice built for experienced engineers switching roles.
        </p>

        <div className="mt-9 flex items-center gap-4 flex-wrap">
          <Link to="/app/questions" data-testid="hero-cta"
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-3 rounded-md text-zinc-950 hover:brightness-110 transition-all"
            style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 32px -8px rgba(245,158,11,0.5)' }}>
            Start prepping <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <span className="font-mono text-xs text-zinc-600">free · no credit card</span>
        </div>

        {/* Stats — hidden on smallest mobile */}
        <div className="hidden sm:flex items-center gap-10 mt-12 font-mono text-xs">
          <Stat value={`${QUESTIONS.length}+`} label="verified questions" />
          <Stat value={`${ACTIVE_COMPANIES.length}`} label="companies" />
          <Stat value="SRS" label="spaced repetition" />
        </div>
      </div>

      {/* Right: app preview */}
      <ReadinessPreview />
    </div>
  </section>
);

const Stat = ({ value, label }) => (
  <div>
    <div className="text-zinc-50 text-xl font-semibold">{value}</div>
    <div className="text-zinc-600 uppercase tracking-[0.18em] mt-0.5 text-[9px]">{label}</div>
  </div>
);

const FEATURES = [
  {
    label: '01',
    title: 'Real interview questions',
    text: 'Browse questions submitted by engineers who actually sat the loop. Filter by company, role, topic, round.',
  },
  {
    label: '02',
    title: 'Spaced repetition',
    text: 'Daily SRS queue with 4-rating recall scoring. The algorithm rebuilds tomorrow\'s queue from your honest signal.',
  },
  {
    label: '03',
    title: 'JD-driven study plan',
    text: 'Paste a job description. We extract requirements, map your mastery, and generate a focused two-week prep plan.',
  },
  {
    label: '04',
    title: 'AI-graded practice',
    text: 'Submit text or code answers. Graded on correctness, depth, examples, edge cases. No hand-waving.',
  },
];

const Features = () => (
  <section id="features" className="px-4 sm:px-6 py-14 sm:py-20 border-t border-white/5">
    <div className="max-w-6xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">What's in the box</div>
      <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-10 sm:mb-14">Four loops. One system.</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
        {FEATURES.map((f) => (
          <div key={f.label} className="bg-zinc-950 p-6 sm:p-8 relative">
            <div className="font-mono text-[10px] text-zinc-700 mb-4">{f.label}</div>
            <div className="text-zinc-50 font-medium text-lg mb-2">{f.title}</div>
            <p className="text-zinc-500 leading-relaxed text-sm">{f.text}</p>
            <div className="absolute left-0 top-6 bottom-6 w-px bg-amber-500/30" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CompaniesStrip = () => (
  <section className="px-4 sm:px-6 py-12 border-t border-white/5">
    <div className="max-w-6xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-5 text-center">Questions from</div>
      {/* Mobile: horizontal scroll. Desktop: centered wrap */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center sm:gap-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ACTIVE_COMPANIES.map(c => (
          <div key={c.id} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-[11px]"
                 style={{ background: c.color + '18', color: c.color, border: `1px solid ${c.color}30` }}>
              {c.initials}
            </div>
            <span className="font-mono text-sm text-zinc-400 whitespace-nowrap">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = ({ session }) => (
  <section className="px-4 sm:px-6 py-14 sm:py-24 border-t border-white/5">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">Switch companies.<br className="hidden sm:block" /> Don't guess.</h2>
      <p className="text-zinc-500 mt-4 leading-relaxed">Free to start. Real questions, real grading, real signal.</p>
      <ul className="font-mono text-sm text-zinc-400 mt-8 inline-block text-left space-y-2">
        <li className="flex items-center gap-2.5"><Check size={13} className="text-emerald-400 shrink-0" /> {QUESTIONS.length}+ questions across {ACTIVE_COMPANIES.length} companies — browse free</li>
        <li className="flex items-center gap-2.5"><Check size={13} className="text-emerald-400 shrink-0" /> Free Google / LinkedIn sign-in for full access</li>
        <li className="flex items-center gap-2.5"><Check size={13} className="text-emerald-400 shrink-0" /> No spam, no recruiter calls, no ads</li>
      </ul>
      <div className="mt-10">
        <Link to="/app/questions" data-testid="final-cta"
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-6 py-3.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
          style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 40px -10px rgba(245,158,11,0.5)' }}>
          Start prepping — it's free <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="mt-auto border-t border-white/5 px-4 sm:px-6 py-8 font-mono text-xs text-zinc-600">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-zinc-950 text-[10px]" style={{ background: '#f59e0b' }}>sk</div>
        <span>stepkai.com · © 2026</span>
      </div>
      <div className="flex items-center gap-5">
        <Link to="/feedback" className="hover:text-zinc-100 transition-colors">Feedback</Link>
        <Link to="/privacy" className="hover:text-zinc-100 transition-colors" data-testid="footer-privacy">Privacy</Link>
        <Link to="/terms" className="hover:text-zinc-100 transition-colors" data-testid="footer-terms">Terms</Link>
        <a href="mailto:hi@stepkai.com" className="hover:text-zinc-100 transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);
