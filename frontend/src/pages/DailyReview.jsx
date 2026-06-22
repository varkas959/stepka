import { useState } from 'react';
import { SRS_CARDS } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { PixelBar } from '../components/PixelBar';
import { ChevronLeft, RotateCw, Trophy, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const C = {
  bg:     'var(--page)',
  bg2:    'var(--surface)',
  bg3:    'var(--surface-2)',
  border: 'var(--border)',
  border2:'var(--border-2)',
  text1:  'var(--text-1)',
  text2:  'var(--text-2)',
  text3:  'var(--text-3)',
  accent: 'var(--accent)',
  green:  '#22C55E',
  amber:  '#F59E0B',
  red:    '#EF4444',
};

const RATING_OPTIONS = [
  { key: 1, label: 'forgot', shortcut: '1', nextDays: 1,  color: C.red,    tone: 'red'   },
  { key: 2, label: 'hard',   shortcut: '2', nextDays: 3,  color: C.amber,  tone: 'amber' },
  { key: 3, label: 'good',   shortcut: '3', nextDays: 7,  color: C.green,  tone: 'green' },
  { key: 4, label: 'easy',   shortcut: '4', nextDays: 14, color: C.accent, tone: 'blue'  },
];

const toneStyle = (tone, active) => {
  const map = {
    red:   { border: '1px solid rgba(239,68,68,'  + (active ? '0.5)' : '0.3)'), background: active ? 'rgba(239,68,68,0.08)'  : 'transparent', color: active ? '#FCA5A5' : '#F87171' },
    amber: { border: '1px solid rgba(245,158,11,' + (active ? '0.5)' : '0.3)'), background: active ? 'rgba(245,158,11,0.08)' : 'transparent', color: active ? '#FCD34D' : '#FBBF24' },
    green: { border: '1px solid rgba(34,197,94,'  + (active ? '0.5)' : '0.3)'), background: active ? 'rgba(34,197,94,0.08)'  : 'transparent', color: active ? '#86EFAC' : '#4ADE80' },
    blue:  { border: '1px solid rgba(59,111,212,' + (active ? '0.5)' : '0.3)'), background: active ? 'rgba(59,111,212,0.08)' : 'transparent', color: active ? '#93C5FD' : '#7AA9F7' },
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

  if (phase === 'queue') return <QueueView state={state} breakdown={breakdown} total={SRS_CARDS.length} onStart={startSession} isGuest={isGuest} />;
  if (phase === 'session') return <SessionView idx={idx} flipped={flipped} setFlipped={setFlipped} onRate={handleRate} onExit={() => setPhase('queue')} />;
  return <DoneView ratings={ratings} state={state} onContinue={() => navigate('/app/progress')} onAgain={() => setPhase('queue')} />;
}

const QueueView = ({ state, breakdown, total, onStart, isGuest }) => {
  const goalPct = Math.round((state.reviewedToday / state.goalToday) * 100);
  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto">
      {isGuest && (
        <div className="mb-6 rounded-lg p-4 flex items-center justify-between gap-3"
             style={{ border: '1px solid rgba(59,111,212,0.3)', background: 'rgba(59,111,212,0.06)' }}>
          <span className="font-mono text-sm" style={{ color: 'rgba(59,111,212,0.85)' }}>Sign in to save your review progress and build a streak</span>
          <a href="/signin" className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity"
             style={{ background: C.accent }}>Sign in</a>
        </div>
      )}
      <Breadcrumb segments={['daily-review', 'queue']} />
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mt-1" style={{ color: C.text1 }}>
        <span style={{ color: C.text3 }}>$</span> {total} cards due
        <span style={{ color: C.text3 }}> today</span>
      </h1>
      <p className="mt-3 text-base max-w-xl leading-relaxed" style={{ color: C.text2 }}>
        Spaced repetition. Rate each card honestly the algorithm rebuilds tomorrow queue from your signal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
        <KindCard kind="concept" value={breakdown.concept || 0} />
        <KindCard kind="coding"  value={breakdown.coding  || 0} />
        <KindCard kind="star"    value={breakdown.star    || 0} />
      </div>

      <div className="mt-6 rounded-lg p-5 sm:p-6" style={{ border: '1px solid ' + C.border, background: C.bg2 }}>
        <div className="flex items-center justify-between mb-3 font-mono text-xs">
          <span className="uppercase tracking-[0.18em]" style={{ color: C.text3 }}>Daily goal</span>
          <span style={{ color: C.text2 }}>{state.reviewedToday}<span style={{ color: C.text3 }}> / {state.goalToday}</span></span>
        </div>
        <PixelBar value={goalPct} height={14} color={C.green} />
        <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
          <p className="font-mono text-sm" style={{ color: C.text2 }}>Hit <span style={{ color: C.text1 }}>{state.goalToday}</span> cards to keep the streak alive.</p>
          <button data-testid="start-review" onClick={onStart}
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity"
            style={{ background: C.accent }}>
            Start review <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

const KindLabels = { concept: 'concept', coding: 'coding', star: 'star behavioral' };
const KindCard = ({ kind, value }) => (
  <div className="rounded-md px-4 py-3" style={{ border: '1px solid ' + C.border, background: C.bg2 }}>
    <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.text3 }}>{KindLabels[kind]}</div>
    <div className="font-mono text-2xl font-semibold mt-1" style={{ color: C.text1 }}>{value}</div>
  </div>
);

const SessionView = ({ idx, flipped, setFlipped, onRate, onExit }) => {
  const card = SRS_CARDS[idx];
  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto" data-testid="srs-session">
      <Breadcrumb segments={['daily-review', 'card-' + (idx + 1) + '-of-' + SRS_CARDS.length]} />

      <div className="flex items-center justify-between mb-4 mt-2 text-xs font-mono">
        <button data-testid="exit-session" onClick={onExit}
                className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
                style={{ color: C.text3 }}>
          <ChevronLeft size={14} /> exit
        </button>
        <span style={{ color: C.text3 }}><span className="font-semibold" style={{ color: C.text1 }}>{idx + 1}</span> / {SRS_CARDS.length}</span>
      </div>

      <PixelBar value={(idx / SRS_CARDS.length) * 100} height={10} color={C.green} />

      <div className="flip-card mt-8" style={{ height: '340px' }}>
        <div className={'flip-card-inner' + (flipped ? ' is-flipped' : '')}>
          <div className="flip-card-face">
            <button onClick={() => setFlipped(true)} data-testid="flip-card"
              className="relative w-full h-full p-8 text-left rounded-lg transition-colors flex flex-col overflow-hidden"
              style={{ border: '1px solid ' + C.border, background: C.bg2 }}>
              <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: C.accent }} />
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.text3 }}>{card.topic}</span>
                <span style={{ color: C.border2 }}>.</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.text3 }}>{card.kind}</span>
                <span style={{ color: C.border2 }}>.</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.text3 }}>{card.company}</span>
              </div>
              <div className="flex-1 flex items-center">
                <div className="text-xl md:text-2xl leading-relaxed" style={{ color: C.text1 }}>
                  {card.front}
                </div>
              </div>
              <div className="font-mono text-xs mt-4" style={{ color: C.text3 }}>click to reveal then rate your recall</div>
            </button>
          </div>
          <div className="flip-card-face flip-card-back">
            <div className="relative w-full h-full p-8 rounded-lg flex flex-col overflow-hidden"
                 style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.04)' }}>
              <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: C.green }} />
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: '#4ADE80' }}>Answer hint</div>
              <div className="text-base md:text-lg leading-relaxed flex-1" style={{ color: C.text1 }}>
                {card.back}
              </div>
              <button onClick={() => setFlipped(false)} data-testid="flip-back"
                      className="font-mono text-xs inline-flex items-center gap-1 self-start mt-2 transition-opacity hover:opacity-80"
                      style={{ color: C.text3 }}>
                <RotateCw size={12} /> flip back
              </button>
            </div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 animate-fade-up">
          {RATING_OPTIONS.map(r => {
            const s = toneStyle(r.tone, false);
            return (
              <button key={r.key} data-testid={'rate-' + r.label} onClick={() => onRate(r)}
                className="p-4 rounded-md text-left font-mono transition-opacity hover:opacity-80"
                style={s}>
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium">{r.label}</span>
                  <span className="ml-auto text-[10px] rounded px-1.5 py-0.5"
                        style={{ color: C.text3, border: '1px solid ' + C.border }}>{r.shortcut}</span>
                </div>
                <div className="text-[10px] mt-2" style={{ color: C.text3 }}>see again in {r.nextDays}d</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DoneView = ({ ratings, state, onContinue, onAgain }) => {
  const xpEarned = ratings.reduce((acc, r) => acc + 10 + r.rating.key * 2, 0);
  const breakdown = ratings.reduce((acc, r) => { acc[r.rating.label] = (acc[r.rating.label] || 0) + 1; return acc; }, {});
  return (
    <div className="px-4 md:px-10 py-6 md:py-12 max-w-2xl mx-auto" data-testid="session-complete">
      <Breadcrumb segments={['daily-review', 'session-complete']} />
      <div className="text-center mt-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-md mb-5"
             style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <Trophy size={24} style={{ color: '#4ADE80' }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: C.text1 }}>
          Done. <span style={{ color: C.text3 }}>Streak intact.</span>
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8">
        <StatBox label="reviewed" value={ratings.length} />
        <StatBox label="xp earned" value={'+' + xpEarned} accent />
        <StatBox label="streak"   value={state.streak + 'd'} />
      </div>

      <div className="mt-6 rounded-lg p-6" style={{ border: '1px solid ' + C.border, background: C.bg2 }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] mb-4" style={{ color: C.text3 }}>Rating breakdown</div>
        <div className="space-y-3">
          {RATING_OPTIONS.map(r => {
            const count = breakdown[r.label] || 0;
            const pct = ratings.length ? (count / ratings.length) * 100 : 0;
            return (
              <div key={r.key} className="flex items-center gap-3 font-mono text-xs">
                <div className="w-16 shrink-0" style={{ color: C.text2 }}>{r.label}</div>
                <div className="flex-1 min-w-0"><PixelBar value={pct} height={10} color={r.color} dotColor={r.color} /></div>
                <div className="w-8 text-right shrink-0" style={{ color: C.text2 }}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button data-testid="back-to-dashboard" onClick={onContinue}
          className="flex-1 inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity"
          style={{ background: C.accent }}>
          <Zap size={14} strokeWidth={2.5} /> See progress
        </button>
        <button onClick={onAgain}
          className="flex-1 font-mono text-sm rounded-md py-2.5 transition-opacity hover:opacity-80"
          style={{ background: C.bg3, border: '1px solid ' + C.border, color: C.text2 }}>
          review more
        </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, accent }) => (
  <div className="rounded-md p-4"
       style={{
         border: accent ? '1px solid rgba(34,197,94,0.3)' : '1px solid ' + C.border,
         background: accent ? 'rgba(34,197,94,0.04)' : C.bg2,
       }}>
    <div className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: C.text3 }}>{label}</div>
    <div className="font-mono text-2xl font-semibold mt-1" style={{ color: accent ? '#4ADE80' : C.text1 }}>{value}</div>
  </div>
);

const Breadcrumb = ({ segments }) => (
  <div className="font-mono text-sm mb-4" style={{ color: C.text3 }}>
    <span style={{ color: C.accent }}>~</span>
    {segments.map((s, i) => (
      <span key={i}>
        <span className="mx-1.5">/</span>
        <span style={{ color: i === segments.length - 1 ? C.text2 : C.text3 }}>{s}</span>
      </span>
    ))}
  </div>
);
