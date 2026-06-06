import { Link } from 'react-router-dom';
import QuestionBank from './QuestionBank';
import { ArrowRight } from 'lucide-react';

// Public-facing question bank: no sidebar, home-style top nav, sign-in modal gates interactive actions.
export default function PublicQuestions() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/5 sticky top-0 z-30 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" data-testid="public-home-logo">
            <div className="w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-zinc-950 text-sm" style={{ background: '#f59e0b' }}>sk</div>
            <span className="font-mono font-semibold tracking-tight">Stepkai</span>
          </Link>
          <div className="font-mono text-xs text-zinc-500 hidden sm:block">
            <span className="text-emerald-400">$</span> browsing as guest · sign in to unlock progress
          </div>
          <div className="flex items-center gap-2">
            <Link to="/signin" data-testid="public-signin" className="font-mono text-sm text-zinc-300 hover:text-zinc-50 px-3 py-1.5">Sign in</Link>
            <Link to="/signin" data-testid="public-cta"
              className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] px-3 sm:px-4 py-2 rounded-md text-zinc-950 hover:brightness-110 transition-all"
              style={{ background: '#f59e0b' }}>
              Get started <ArrowRight size={12} className="inline -mt-0.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>
      <QuestionBank isGuest={true} />
    </div>
  );
}
