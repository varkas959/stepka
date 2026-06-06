import { Link } from 'react-router-dom';
import { ArrowRight, Database, Brain, Calendar, BarChart3, Sparkles, Check } from 'lucide-react';
import { COMPANIES } from '../lib/mockData';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      <HomeNav />
      <Hero />
      <Features />
      <CompaniesStrip />
      <FinalCTA />
      <Footer />
    </div>
  );
}

const HomeNav = () => (
  <header className="border-b border-white/5 sticky top-0 z-30 bg-zinc-950/90 backdrop-blur">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5" data-testid="home-logo">
        <div className="w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-zinc-950 text-sm" style={{ background: '#f59e0b' }}>sk</div>
        <span className="font-mono font-semibold tracking-tight">Stepkai</span>
      </Link>
      <nav className="hidden sm:flex items-center gap-6 font-mono text-sm text-zinc-400">
        <a href="#features" className="hover:text-zinc-50 transition-colors">Features</a>
        <Link to="/privacy" className="hover:text-zinc-50 transition-colors">Privacy</Link>
        <Link to="/terms" className="hover:text-zinc-50 transition-colors">Terms</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/signin" data-testid="nav-signin" className="font-mono text-sm text-zinc-300 hover:text-zinc-50 px-3 py-1.5">Sign in</Link>
        <Link to="/signin" data-testid="nav-cta"
          className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] px-3 sm:px-4 py-2 rounded-md text-zinc-950 hover:brightness-110 transition-all"
          style={{ background: '#f59e0b' }}>
          Get started
        </Link>
      </div>
    </div>
  </header>
);

const Hero = () => (
  <section className="px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-20">
    <div className="max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/[0.06] mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
        <Sparkles size={11} /> built for engineers in motion
      </div>
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight">
        Real questions.<br />
        <span className="text-zinc-600">From real loops.</span>
      </h1>
      <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
        Stepkai is the question bank, study plan, and spaced-repetition rep system for engineers switching companies.
        No fluff, no filler — just signal from candidates who actually sat in the room.
      </p>
      <div className="mt-9 flex items-center gap-3 flex-wrap">
        <Link to="/signin" data-testid="hero-cta"
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-3 rounded-md text-zinc-950 hover:brightness-110 transition-all"
          style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 32px -8px rgba(245,158,11,0.6)' }}>
          Start prepping <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
        <Link to="/questions" data-testid="hero-secondary"
          className="font-mono text-sm text-zinc-300 hover:text-zinc-50 border border-white/10 hover:border-white/25 rounded-md px-4 py-3">
          Browse demo →
        </Link>
      </div>
      <div className="mt-12 flex items-center gap-8 sm:gap-12 font-mono text-xs flex-wrap">
        <Stat value="12,800+" label="verified questions" />
        <Stat value="47" label="companies tracked" />
        <Stat value="4.6/5" label="rep system rating" />
      </div>
    </div>
  </section>
);

const Stat = ({ value, label }) => (
  <div>
    <div className="text-zinc-50 text-2xl sm:text-3xl font-semibold">{value}</div>
    <div className="text-zinc-600 uppercase tracking-[0.18em] mt-1 text-[10px]">{label}</div>
  </div>
);

const FEATURES = [
  { icon: Database, title: 'Real interview questions', text: 'Browse questions submitted by engineers who actually sat the loop. Filter by company, role, topic, round.' },
  { icon: Brain, title: 'Spaced repetition rep', text: 'Daily SRS queue with 4-rating recall scoring. The algorithm rebuilds tomorrow’s queue from your honest signal.' },
  { icon: Calendar, title: 'JD-driven 14-day plan', text: 'Paste a job description. We extract requirements, map your mastery, and generate a focused two-week prep plan.' },
  { icon: BarChart3, title: 'AI-graded practice', text: 'Submit text or code answers. Gemini grades with a rubric: correctness, depth, examples, edge cases. No hand-waving.' },
];

const Features = () => (
  <section id="features" className="px-4 sm:px-6 py-14 sm:py-20 border-t border-white/5">
    <div className="max-w-5xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">What's in the box</div>
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-10 sm:mb-14">Four loops. One system.</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="relative rounded-lg border border-white/10 bg-zinc-950 p-5 sm:p-6 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#f59e0b', opacity: 0.7 }} />
              <Icon size={18} className="text-amber-500 mb-4" strokeWidth={1.75} />
              <div className="text-zinc-50 font-medium text-lg">{f.title}</div>
              <p className="text-zinc-400 mt-2 leading-relaxed">{f.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const CompaniesStrip = () => (
  <section className="px-4 sm:px-6 py-12 border-t border-white/5">
    <div className="max-w-5xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-5 text-center">Questions from</div>
      <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
        {COMPANIES.map(c => (
          <div key={c.id} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-xs"
                 style={{ background: c.color + '22', color: c.color, border: `1px solid ${c.color}44` }}>
              {c.initials}
            </div>
            <span className="font-mono text-sm text-zinc-300">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="px-4 sm:px-6 py-14 sm:py-20 border-t border-white/5">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">Switch companies. Don't guess.</h2>
      <p className="text-zinc-400 mt-4 leading-relaxed">Free to start. Real questions, real grading, real signal.</p>
      <ul className="font-mono text-sm text-zinc-300 mt-6 inline-block text-left space-y-1.5">
        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> 12 demo questions to browse without signing in</li>
        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Free Google / LinkedIn sign-in for full access</li>
        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> No spam, no recruiter calls, no ads</li>
      </ul>
      <div className="mt-9">
        <Link to="/signin" data-testid="final-cta"
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-3 rounded-md text-zinc-950 hover:brightness-110 transition-all"
          style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 32px -8px rgba(245,158,11,0.6)' }}>
          Get started — it's free <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="mt-auto border-t border-white/5 px-4 sm:px-6 py-8 font-mono text-xs text-zinc-500">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-zinc-950 text-[10px]" style={{ background: '#f59e0b' }}>sk</div>
        <span>stepkai.com · v1.0 · © 2026</span>
      </div>
      <div className="flex items-center gap-5">
        <Link to="/privacy" className="hover:text-zinc-100" data-testid="footer-privacy">Privacy</Link>
        <Link to="/terms" className="hover:text-zinc-100" data-testid="footer-terms">Terms</Link>
        <a href="mailto:hi@stepkai.com" className="hover:text-zinc-100">Contact</a>
      </div>
    </div>
  </footer>
);
