import { useState } from 'react';
import { SRS_CARDS } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { ProgressRing } from '../components/ProgressRing';
import { CompanyBadge } from '../components/CompanyBadge';
import { ChevronLeft, RotateCw, Trophy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RATING_OPTIONS = [
  { key: 1, label: 'Forgot', shortcut: '1', nextDays: 1, color: 'border-red-500/40 text-red-400 hover:bg-red-500/10', dot: 'bg-red-500' },
  { key: 2, label: 'Hard', shortcut: '2', nextDays: 3, color: 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10', dot: 'bg-amber-500' },
  { key: 3, label: 'Good', shortcut: '3', nextDays: 7, color: 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10', dot: 'bg-emerald-500' },
  { key: 4, label: 'Easy', shortcut: '4', nextDays: 14, color: 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10', dot: 'bg-blue-500' },
];

export default function DailyReview() {
  const [phase, setPhase] = useState('queue'); // queue | session | done
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState([]);
  const { state, bumpReview, addXp } = useAppState();
  const navigate = useNavigate();

  const breakdown = SRS_CARDS.reduce((acc, c) => { acc[c.kind] = (acc[c.kind] || 0) + 1; return acc; }, {});

  const startSession = () => {
    setPhase('session'); setIdx(0); setFlipped(false); setRatings([]);
  };

  const handleRate = (r) => {
    setRatings(prev => [...prev, { cardId: SRS_CARDS[idx].id, rating: r }]);
    bumpReview();
    addXp(10 + r.key * 2);

    if (idx + 1 >= SRS_CARDS.length) {
      setPhase('done');
    } else {
      setIdx(i => i + 1);
      setFlipped(false);
    }
  };

  if (phase === 'queue') {
    return (
      <div className="px-4 md:px-8 py-6 md:py-12 max-w-3xl mx-auto">
        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Daily Review</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">You have <span className="font-mono">{SRS_CARDS.length}</span> cards due today</h1>
        <p className="text-zinc-400 mt-2 text-sm">Spaced repetition. Rate each card honestly. The algorithm will rebuild your queue for tomorrow.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <StatCard label="Concept" value={breakdown.concept || 0} />
          <StatCard label="Coding" value={breakdown.coding || 0} />
          <StatCard label="STAR / Behavioral" value={breakdown.star || 0} />
        </div>

        <div className="mt-8 flex items-center gap-6 border border-white/10 bg-zinc-900/60 rounded-lg p-6">
          <ProgressRing value={state.reviewedToday} max={state.goalToday} size={92} stroke={7} label={`${state.reviewedToday}/${state.goalToday}`} sublabel="goal" />
          <div className="flex-1">
            <div className="text-sm font-medium">Daily goal</div>
            <div className="text-xs text-zinc-400 mt-1">Hit <span className="font-mono text-zinc-50">{state.goalToday}</span> cards to keep the streak alive.</div>
            <button data-testid="start-review" onClick={startSession} className="mt-4 inline-flex items-center gap-2 bg-white text-zinc-950 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors">
              Start Review →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'session') {
    const card = SRS_CARDS[idx];
    return (
      <div className="px-4 md:px-8 py-6 md:py-10 max-w-3xl mx-auto" data-testid="srs-session">
        <div className="flex items-center justify-between mb-6 text-xs">
          <button data-testid="exit-session" onClick={() => setPhase('queue')} className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-50">
            <ChevronLeft size={14} /> Exit
          </button>
          <div className="font-mono text-zinc-400">
            <span className="text-zinc-50">{idx + 1}</span> / {SRS_CARDS.length}
          </div>
        </div>

        <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-white transition-all duration-500" style={{ width: `${((idx) / SRS_CARDS.length) * 100}%` }} />
        </div>

        <div className="flip-card" style={{ height: '320px' }}>
          <div className={`flip-card-inner ${flipped ? 'is-flipped' : ''}`}>
            <div className="flip-card-face">
              <button
                onClick={() => setFlipped(true)}
                data-testid="flip-card"
                className="w-full h-full p-8 text-left rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-900/80 transition-colors flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <CompanyBadge companyId={card.company} size="sm" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{card.topic} · {card.kind}</span>
                </div>
                <div className="flex-1 flex items-center">
                  <div className="font-mono text-xl md:text-2xl leading-relaxed text-zinc-50">{card.front}</div>
                </div>
                <div className="text-xs text-zinc-500 mt-4">Click card to reveal · then rate your recall</div>
              </button>
            </div>
            <div className="flip-card-face flip-card-back">
              <div className="w-full h-full p-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col">
                <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-400 font-mono mb-3">Answer hint</div>
                <div className="font-mono text-sm md:text-base leading-relaxed text-zinc-100 flex-1">{card.back}</div>
                <button onClick={() => setFlipped(false)} className="text-xs text-zinc-400 hover:text-zinc-50 inline-flex items-center gap-1 self-start mt-2" data-testid="flip-back">
                  <RotateCw size={12} /> Flip back
                </button>
              </div>
            </div>
          </div>
        </div>

        {flipped && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 animate-fade-up">
            {RATING_OPTIONS.map(r => (
              <button
                key={r.key}
                data-testid={`rate-${r.label.toLowerCase()}`}
                onClick={() => handleRate(r)}
                className={`group p-4 rounded-md border bg-zinc-900/60 transition-colors text-left ${r.color}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${r.dot}`} />
                  <div className="font-medium text-zinc-50">{r.label}</div>
                  <div className="ml-auto font-mono text-[10px] text-zinc-500">{r.shortcut}</div>
                </div>
                <div className="font-mono text-[10px] text-zinc-500 mt-1.5">See again in {r.nextDays}d</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // done
  const xpEarned = ratings.reduce((acc, r) => acc + 10 + r.rating.key * 2, 0);
  const ratingBreakdown = ratings.reduce((acc, r) => { acc[r.rating.label] = (acc[r.rating.label] || 0) + 1; return acc; }, {});

  return (
    <div className="px-4 md:px-8 py-6 md:py-12 max-w-2xl mx-auto" data-testid="session-complete">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/30 mb-5">
          <Trophy size={26} className="text-emerald-400" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">session complete</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">Done. <span className="text-zinc-500">Streak intact.</span></h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        <StatCard label="Reviewed" value={ratings.length} />
        <StatCard label="XP Earned" value={`+${xpEarned}`} accent />
        <StatCard label="Streak" value={`${state.streak}d`} />
      </div>

      <div className="mt-6 border border-white/10 bg-zinc-900/60 rounded-lg p-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono mb-4">Rating breakdown</div>
        <div className="space-y-2">
          {RATING_OPTIONS.map(r => {
            const count = ratingBreakdown[r.label] || 0;
            const pct = ratings.length ? (count / ratings.length) * 100 : 0;
            return (
              <div key={r.key} className="flex items-center gap-3 text-xs">
                <div className={`w-2 h-2 rounded-full ${r.dot}`} />
                <div className="w-16 text-zinc-300">{r.label}</div>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${r.dot}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="w-8 text-right font-mono text-zinc-400">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button data-testid="back-to-dashboard" onClick={() => navigate('/app/progress')} className="flex-1 bg-white text-zinc-950 rounded-md py-2.5 text-sm font-medium hover:bg-zinc-200 transition-colors inline-flex items-center justify-center gap-2">
          <Zap size={14} /> See progress
        </button>
        <button onClick={() => { setPhase('queue'); }} className="flex-1 bg-zinc-900 border border-white/10 rounded-md py-2.5 text-sm hover:bg-zinc-800 transition-colors">
          Review more
        </button>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, accent }) => (
  <div className={`border rounded-lg p-4 ${accent ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-zinc-900/60'}`}>
    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">{label}</div>
    <div className={`text-2xl font-mono font-semibold mt-1 ${accent ? 'text-emerald-400' : 'text-zinc-50'}`}>{value}</div>
  </div>
);
