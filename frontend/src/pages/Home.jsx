import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, TrendingUp, AlertCircle } from 'lucide-react';
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

const PREVIEW_SKILLS = [
  { name: 'Selenium',      score: 84, status: 'strong' },
  { name: 'Java',          score: 71, status: 'ready' },
  { name: 'SQL',           score: 55, status: 'moderate' },
  { name: 'Playwright',    score: 28, status: 'critical' },
  { name: 'System Design', score: 19, status: 'critical' },
];

const scoreColor = (s) => s >= 75 ? C.green : s >= 50 ? C.amber : C.red;
const bandLabel  = (s) => s >= 75 ? 'Strong' : s >= 50 ? 'Moderate' : 'Gap';

export default function Home() {
  const [session, setSession] = useState(null);
  useEffect(() => { getSession().then(setSession); }, []);
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text1 }}>
      <HomeNav session={session} />
      <Hero />
      <Features />
      <CompaniesStrip />
      <FinalCTA />
      <Footer />
    </div>
  );
}

const HomeNav = ({ session }) => (
  <header className="sticky top-0 z-30 backdrop-blur-sm" style={{ borderBottom: `1px solid ${C.border}`, background: `${C.bg}E6` }}>
    <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5" data-testid="home-logo">
        <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold" style={{ background: C.accent, color: '#fff' }}>S</div>
        <span className="font-semibold text-sm tracking-tight" style={{ color: C.text1 }}>Stepkai</span>
      </Link>
      <nav className="hidden sm:flex items-center gap-6 text-sm" style={{ color: C.text2 }}>
        <a href="#features" className="hover:opacity-80 transition-opacity">Features</a>
        <a href="#companies" className="hover:opacity-80 transition-opacity">Companies</a>
      </nav>
      <div className="flex items-center gap-3">
        {session ? (
          <Link to="/app/questions" data-testid="nav-open-app"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-md transition-opacity hover:opacity-90"
            style={{ background: C.accent, color: '#fff' }}>
            Open app <ArrowRight size={13} strokeWidth={2} />
          </Link>
        ) : (
          <Link to="/app/questions"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-md transition-opacity hover:opacity-90"
            style={{ background: C.accent, color: '#fff' }}>
            Get started
          </Link>
        )}
      </div>
    </div>
  </header>
);

const DiagnosticCard = () => (
  <div className="hidden lg:block rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}`, background: C.bg2 }}>
    {/* Card header */}
    <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium" style={{ color: C.text1 }}>Readiness Report</div>
          <div className="text-xs mt-0.5" style={{ color: C.text3 }}>
            Capgemini · SDET · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl font-semibold leading-none" style={{ color: C.amber }}>61</div>
          <div className="text-xs mt-1 font-medium" style={{ color: C.amber }}>Interview Ready</div>
        </div>
      </div>
    </div>

    {/* Skill rows */}
    <div className="px-5 py-3">
      {PREVIEW_SKILLS.map((s, i) => (
        <div key={s.name} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < PREVIEW_SKILLS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
          <div className="w-28 text-sm shrink-0" style={{ color: C.text2 }}>{s.name}</div>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.bg3 }}>
            <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: scoreColor(s.score) }} />
          </div>
          <div className="font-mono text-xs w-6 text-right shrink-0" style={{ color: scoreColor(s.score) }}>{s.score}</div>
          <div className="text-xs w-16 text-right shrink-0" style={{ color: C.text3 }}>{bandLabel(s.score)}</div>
        </div>
      ))}
    </div>

    {/* Card footer */}
    <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}>
      <div className="flex items-center gap-1.5 text-xs" style={{ color: C.red }}>
        <AlertCircle size={12} />
        2 critical gaps identified
      </div>
      <div className="text-xs" style={{ color: C.accent }}>10-question deep-dive →</div>
    </div>
  </div>
);

const Hero = () => (
  <section className="px-6 pt-16 pb-20">
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8"
             style={{ background: `${C.accent}18`, color: C.accent, border: `1px solid ${C.accent}30` }}>
          <TrendingUp size={11} />
          {QUESTIONS.length}+ questions · {ACTIVE_COMPANIES.length} companies tracked
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight mb-5" style={{ color: C.text1, letterSpacing: '-0.03em' }}>
          Know exactly<br />
          <span style={{ color: C.text3 }}>what to prep.</span>
        </h1>

        <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: C.text2 }}>
          Paste a job description. Get your readiness score across every required skill. Build a focused prep plan — not a guess.
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/app/questions" data-testid="hero-cta"
            className="inline-flex items-center gap-2 font-medium px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: C.accent, color: '#fff', fontSize: '15px' }}>
            Start prepping free <ArrowRight size={15} strokeWidth={2} />
          </Link>
          <span className="text-sm" style={{ color: C.text3 }}>No credit card required</span>
        </div>

        <div className="flex items-center gap-8 mt-12 pt-8" style={{ borderTop: `1px solid ${C.border}` }}>
          <Stat value={`${QUESTIONS.length}+`} label="Verified questions" />
          <Stat value={`${ACTIVE_COMPANIES.length}`} label="Companies" />
          <Stat value="SRS" label="Spaced repetition" />
        </div>
      </div>

      <DiagnosticCard />
    </div>
  </section>
);

const Stat = ({ value, label }) => (
  <div>
    <div className="font-mono text-xl font-semibold" style={{ color: C.text1 }}>{value}</div>
    <div className="text-xs mt-0.5" style={{ color: C.text3 }}>{label}</div>
  </div>
);

const FEATURES = [
  { title: 'Real interview questions', text: 'Browse questions submitted by engineers who actually sat the loop. Filter by company, role, topic, and round type.' },
  { title: 'Spaced repetition system', text: 'Daily review queue using SM-2 recall scoring. The algorithm surfaces weak spots before they become interview failures.' },
  { title: 'JD-driven study plan', text: 'Paste a job description, get a 14-day focused plan mapped to your actual skill gaps — not a generic prep guide.' },
  { title: 'AI-graded practice', text: 'Submit answers and get scored on correctness, depth, examples, and edge cases. Calibrated feedback, not encouragement.' },
];

const Features = () => (
  <section id="features" className="px-6 py-20" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-6xl mx-auto">
      <div className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: C.text3, letterSpacing: '0.12em' }}>Platform</div>
      <h2 className="text-3xl font-bold tracking-tight mb-14" style={{ color: C.text1, letterSpacing: '-0.02em' }}>
        Everything you need.<br />Nothing you don't.
      </h2>
      <div className="divide-y" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        {FEATURES.map((f, i) => (
          <div key={i} className="flex gap-12 py-6 items-start">
            <div className="font-mono text-xs w-6 shrink-0 mt-0.5" style={{ color: C.text3 }}>0{i + 1}</div>
            <div className="w-56 shrink-0">
              <div className="font-semibold text-sm" style={{ color: C.text1 }}>{f.title}</div>
            </div>
            <div className="text-sm leading-relaxed" style={{ color: C.text2 }}>{f.text}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CompaniesStrip = () => (
  <section id="companies" className="px-6 py-16" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-6xl mx-auto">
      <div className="text-xs font-medium uppercase tracking-widest mb-8 text-center" style={{ color: C.text3, letterSpacing: '0.12em' }}>Questions from engineers at</div>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center sm:gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {ACTIVE_COMPANIES.map(c => (
          <div key={c.id} className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
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

const FinalCTA = () => (
  <section className="px-6 py-24" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: C.text1, letterSpacing: '-0.02em' }}>
        Ready to close your gaps?
      </h2>
      <p className="text-lg mb-8" style={{ color: C.text2 }}>
        Free to start. No spam, no recruiter calls.
      </p>
      <ul className="space-y-3 mb-10">
        {[
          `${QUESTIONS.length}+ questions across ${ACTIVE_COMPANIES.length} companies — browse free`,
          'Google / LinkedIn sign-in, no password needed',
          'Your progress is private — we never sell your data',
        ].map(item => (
          <li key={item} className="flex items-center gap-3 text-sm" style={{ color: C.text2 }}>
            <Check size={14} className="shrink-0" style={{ color: C.green }} />
            {item}
          </li>
        ))}
      </ul>
      <Link to="/app/questions" data-testid="final-cta"
        className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-lg transition-opacity hover:opacity-90"
        style={{ background: C.accent, color: '#fff', fontSize: '15px' }}>
        Get started — it's free <ArrowRight size={15} strokeWidth={2} />
      </Link>
    </div>
  </section>
);

const Footer = () => (
  <footer className="mt-auto px-6 py-8 text-sm" style={{ borderTop: `1px solid ${C.border}`, color: C.text3 }}>
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center" style={{ background: C.accent, color: '#fff' }}>S</div>
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
