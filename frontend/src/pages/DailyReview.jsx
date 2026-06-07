import { useState } from 'react';
import { SRS_CARDS } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { PixelBar } from '../components/PixelBar';
import { ChevronLeft, RotateCw, Trophy, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RATING_OPTIONS = [
  { key: 1, label: 'forgot', shortcut: '1', nextDays: 1, color: '#ef4444', tone: 'red' },
  { key: 2, label: 'hard',   shortcut: '2', nextDays: 3, color: '#f59e0b', tone: 'amber' },
  { key: 3, label: 'good',   shortcut: '3', nextDays: 7, color: '#22c55e', tone: 'green' },
  { key: 4, label: 'easy',   shortcut: '4', nextDays: 14, color: '#3b82f6', tone: 'blue' },
];

const toneClass = (tone, active) => {
  const map = {
    red:   active ? 'border-red-500/50 bg-red-500/[0.08] text-red-300'       : 'border-red-500/30 text-red-400 hover:bg-red-500/[0.06]',
    amber: active ? 'border-amber-500/50 bg-amber-500/[0.08] text-amber-300' : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/[0.06]',
    green: active ? 'border-emerald-500/50 bg-emerald-500/[0.08] text-emerald-300' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/[0.06]',
    blue:  active ? 'border-blue-500/50 bg-blue-500/[0.08] text-blue-300'    : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/[0.06]',
  };
  return map[tone];
};

export default function DailyReview({ isGuest = false }) {
  const [phase, setPhase] = useState('queue');
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState([]);
  const { state, bumpReview, addXp, recordRating } = useAppState();
  const navigate = useNavigate();

  const breakdown = SRS_CARDS.reduce((acc, c) => { acc[c.kind] = (acc[c.kind] || 0) + 1; return acc; }, {});
  const startSession = () => { setPhase('session'); setIdx(0); setFlipped(false); setRatings([]); };

  const handleRate = (r) => {
    const card = SRS_CARDS[idx];
    setRatings(prev => [...prev, { cardId: card.id, rating: r }]);
    bumpReview();
    addXp(10 + r.key * 2);
    recordRating(card.id, r.key);
    if (idx + 1 >= SRS_CARDS.length) setPhase('done');
    else { setIdx(i => i + 1); setFlipped(false); }
  };

  if (phase === 'queue') return <QueueView state={state} breakdown={breakdown} total={SRS_CARDS.length} onStart={startSession} />;
  if (phase === 'session') return <SessionView idx={idx} flipped={flipped} setFlipped={setFlipped} onRate={handleRate} onExit={() => setPhase('queue')} />;
  return <DoneView ratings={ratings} state={state} onContinue={() => navigate('/app/progress')} onAgain={() => setPhase('queue')} />;
}

// ───────────── Queue ─────────────
const QueueView = ({ state, breakdown, total, onStart }) => {
  const goalPct = Math.round((state.reviewedToday / state.goalToday) * 100);
  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto">
      {isGuest && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4 flex items-center justify-between gap-3">
          <span className="font-mono text-sm text-amber-300">Sign in to save your review progress and build a streak</span>
          <a href="/signin" className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-zinc-950 hover:brightness-110" style={{ background: '#f59e0b' }}>Sign in</a>
        </div>
      )}
      <Breadcrumb segments={['daily-review', 'queue']} />
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mt-1 text-zinc-50">
        <span className="text-zinc-500">$</span> {total} cards due
        <span className="text-zinc-500"> · today</span>
      </h1>
      <p className="text-zinc-400 mt-3 text-base max-w-xl leading-relaxed">
        Spaced repetition. Rate each card honestly — the algorithm rebuilds tomorrow's queue from your signal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
        <KindCard kind="concept" value={breakdown.concept || 0} />
        <KindCard kind="coding" value={breakdown.coding || 0} />
        <KindCard kind="star" value={breakdown.star || 0} />
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-zinc-950 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3 font-mono text-xs">
          <span className="uppercase tracking-[0.18em] text-zinc-500">Daily goal</span>
          <span className="text-zinc-300">{state.reviewedToday}<span className="text-zinc-600"> / {state.goalToday}</span></span>
        </div>
        <PixelBar value={goalPct} height={14} color="#22c55e" />
        <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
          <p className="font-mono text-sm text-zinc-400">Hit <span className="text-zinc-100">{state.goalToday}</span> cards to keep the streak alive.</p>
          <button data-testid="start-review" onClick={onStart}
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
            style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 24px -8px rgba(245,158,11,0.6)' }}>
            Start review <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

const KindLabels = { concept: 'concept', coding: 'coding', star: 'star · behavioral' };
const KindCard = ({ kind, value }) => (
  <div className="rounded-md border border-white/10 bg-zinc-950 px-4 py-3">
    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">{KindLabels[kind]}</div>
    <div className="font-mono text-2xl font-semibold text-zinc-50 mt-1">{value}</div>
  </div>
);

// ───────────── Session ─────────────
const SessionView = ({ idx, flipped, setFlipped, onRate, onExit }) => {
  const card = SRS_CARDS[idx];
  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto" data-testid="srs-session">
      <Breadcrumb segments={['daily-review', `card-${idx + 1}-of-${SRS_CARDS.length}`]} />

      <div className="flex items-center justify-between mb-4 mt-2 text-xs font-mono">
        <button data-testid="exit-session" onClick={onExit} className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-50">
          <ChevronLeft size={14} /> exit
        </button>
        <span className="text-zinc-500"><span className="text-zinc-100 font-semibold">{idx + 1}</span> / {SRS_CARDS.length}</span>
      </div>

      <PixelBar value={(idx / SRS_CARDS.length) * 100} height={10} color="#22c55e" />

      <div className="flip-card mt-8" style={{ height: '340px' }}>
        <div className={`flip-card-inner ${flipped ? 'is-flipped' : ''}`}>
          <div className="flip-card-face">
            <button onClick={() => setFlipped(true)} data-testid="flip-card"
              className="relative w-full h-full p-8 text-left rounded-lg border border-white/10 bg-zinc-950 hover:border-white/20 transition-colors flex flex-col overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: '#f59e0b', opacity: 0.85 }} />
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{card.topic}</span>
                <span className="text-zinc-700">·</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{card.kind}</span>
                <span className="text-zinc-700">·</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{card.company}</span>
              </div>
              <div className="flex-1 flex items-center">
                <div className="text-zinc-50 text-xl md:text-2xl leading-relaxed" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  {card.front}
                </div>
              </div>
              <div className="font-mono text-xs text-zinc-600 mt-4">// click to reveal · then rate your recall</div>
            </button>
          </div>
          <div className="flip-card-face flip-card-back">
            <div className="relative w-full h-full p-8 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] flex flex-col overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: '#22c55e' }} />
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400 mb-3">Answer hint</div>
              <div className="text-zinc-50 text-base md:text-lg leading-relaxed flex-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                {card.back}
              </div>
              <button onClick={() => setFlipped(false)} className="font-mono text-xs text-zinc-500 hover:text-zinc-50 inline-flex items-center gap-1 self-start mt-2" data-testid="flip-back">
                <RotateCw size={12} /> flip back
              </button>
            </div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 animate-fade-up">
          {RATING_OPTIONS.map(r => (
            <button key={r.key} data-testid={`rate-${r.label}`} onClick={() => onRate(r)}
              className={`group p-4 rounded-md border bg-zinc-950 transition-colors text-left font-mono ${toneClass(r.tone, false)}`}>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium">{r.label}</span>
                <span className="ml-auto text-[10px] text-zinc-600 border border-white/10 rounded px-1.5 py-0.5">{r.shortcut}</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-2">see again in {r.nextDays}d</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ───────────── Done ─────────────
const DoneView = ({ ratings, state, onContinue, onAgain }) => {
  const xpEarned = ratings.reduce((acc, r) => acc + 10 + r.rating.key * 2, 0);
  const breakdown = ratings.reduce((acc, r) => { acc[r.rating.label] = (acc[r.rating.label] || 0) + 1; return acc; }, {});
  return (
    <div className="px-4 md:px-10 py-6 md:py-12 max-w-2xl mx-auto" data-testid="session-complete">
      <Breadcrumb segments={['daily-review', 'session-complete']} />
      <div className="text-center mt-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-md bg-emerald-500/[0.08] border border-emerald-500/30 mb-5">
          <Trophy size={24} className="text-emerald-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-50">Done. <span className="text-zinc-600">Streak intact.</span></h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8">
        <StatBox label="reviewed" value={ratings.length} />
        <StatBox label="xp earned" value={`+${xpEarned}`} accent />
        <StatBox label="streak" value={`${state.streak}d`} />
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-zinc-950 p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-4">Rating breakdown</div>
        <div className="space-y-3">
          {RATING_OPTIONS.map(r => {
            const count = breakdown[r.label] || 0;
            const pct = ratings.length ? (count / ratings.length) * 100 : 0;
            return (
              <div key={r.key} className="flex items-center gap-3 font-mono text-xs">
                <div className="w-16 text-zinc-300 shrink-0">{r.label}</div>
                <div className="flex-1 min-w-0"><PixelBar value={pct} height={10} color={r.color} dotColor={r.color} /></div>
                <div className="w-8 text-right text-zinc-400 shrink-0">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button data-testid="back-to-dashboard" onClick={onContinue}
          className="flex-1 inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
          style={{ background: '#f59e0b' }}>
          <Zap size={14} strokeWidth={2.5} /> See progress
        </button>
        <button onClick={onAgain} className="flex-1 font-mono text-sm bg-zinc-900 border border-white/10 rounded-md py-2.5 hover:bg-zinc-800 transition-colors">
          review more
        </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, accent }) => (
  <div className={`rounded-md border p-4 ${accent ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-white/10 bg-zinc-950'}`}>
    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">{label}</div>
    <div className={`font-mono text-2xl font-semibold mt-1 ${accent ? 'text-emerald-300' : 'text-zinc-50'}`}>{value}</div>
  </div>
);

const Breadcrumb = ({ segments }) => (
  <div className="font-mono text-sm text-zinc-600 mb-4">
    <span className="text-emerald-400">~</span>
    {segments.map((s, i) => (
      <span key={i}>
        <span className="mx-1.5">/</span>
        <span className={i === segments.length - 1 ? 'text-zinc-200' : 'text-zinc-400'}>{s}</span>
      </span>
    ))}
  </div>
);
