import { useCallback, useEffect, useRef, useState } from 'react';
import { SRS_CARDS } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { PixelBar } from '../components/PixelBar';
import { KaiCompanion } from '../components/KaiCompanion';
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

const shuffle = (a) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
};

// Kai's reaction to each honest self-rating. A "forgot" is deliberately met
// with encouragement rather than disappointment — rating honestly is the
// behaviour the SRS algorithm actually needs, so it shouldn't feel punished.
const KAI_BY_RATING = {
  1: { mode: 'thinking',  text: "That one's tricky — it'll come back sooner so you can nail it." },
  2: { mode: 'thinking',  text: "Hard-won still counts. You'll see that one again soon." },
  3: { mode: 'happy',     text: "Nice recall! That one's sticking." },
  4: { mode: 'happy',     text: "Locked in — that one's parked for a while." },
};

export default function DailyReview() {
  const [phase, setPhase] = useState('queue');
  const [idx, setIdx] = useState(0);
  const [order, setOrder] = useState(() => SRS_CARDS.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState([]);
  const { state, bumpReview, addXp, recordRating } = useAppState();
  const navigate = useNavigate();

  const [kaiMode, setKaiMode] = useState('idle');
  // Null means "no reaction showing" — the greeting below is then derived
  // fresh on every render. A lazy useState initialiser would have frozen the
  // greeting at mount, before the async Supabase progress load lands, so a
  // signed-in user's streak would never be mentioned.
  const [kaiReaction, setKaiReaction] = useState(null);
  const kaiResetTimer = useRef(null);

  // Deliberately doesn't restate "N cards due today" — that's already the
  // page's own H1, right above where this bubble renders. Kai should add
  // something the page doesn't already say, not echo it back.
  const kaiGreeting = state.streak > 0
    ? `You're on a ${state.streak}-day streak — let's keep it alive.`
    : "Rate honestly, even when it's tempting to say you knew it — that's what actually improves tomorrow's queue.";
  const kaiMessage = kaiReaction ?? kaiGreeting;

  // Show a reaction, then drift back to idle so the ambient behaviour
  // (glancing on scroll, eventually yawning) can resume. Mode and message are
  // cleared together — resetting only the mode left the bubble showing stale
  // reaction text under a neutral face.
  const kaiReact = useCallback((mode, text, holdMs = 3500) => {
    setKaiMode(mode);
    setKaiReaction(text);
    if (kaiResetTimer.current) clearTimeout(kaiResetTimer.current);
    kaiResetTimer.current = setTimeout(() => {
      setKaiMode('idle');
      setKaiReaction(null);
    }, holdMs);
  }, []);
  useEffect(() => () => { if (kaiResetTimer.current) clearTimeout(kaiResetTimer.current); }, []);

  const breakdown = SRS_CARDS.reduce((acc, c) => { acc[c.kind] = (acc[c.kind] || 0) + 1; return acc; }, {});
  const startSession = () => {
    setOrder(shuffle(SRS_CARDS.map((_, i) => i)));
    setPhase('session'); setIdx(0); setFlipped(false); setRatings([]);
    kaiReact('happy', "Here we go — rate each one honestly, that's what makes this work.");
  };

  const handleRate = (r) => {
    const card = SRS_CARDS[order[idx]];
    const entry = { cardId: card.id, rating: r };
    const nextRatings = [...ratings, entry];
    // Functional update so a double-tap in a single batch can't drop an entry;
    // `nextRatings` is only used for the local end-of-session check below.
    setRatings(prev => [...prev, entry]);
    bumpReview();
    addXp(10 + r.key * 2);
    recordRating(card.id, r.key);

    if (idx + 1 >= SRS_CARDS.length) {
      setPhase('done');
      // Only a session with nothing forgotten earns the full celebration —
      // otherwise the celebrate animation stops meaning anything. "hard" still
      // counts as recalled, so the bar is `key > 1` (i.e. not "forgot").
      const noneForgotten = nextRatings.every(x => x.rating.key > 1);
      if (noneForgotten) {
        kaiReact('celebrate', "Clean sweep — nothing forgotten. Streak's safe. 🎉", 6000);
      } else {
        kaiReact('graduate', "Session done, streak intact. The shaky ones come back sooner — that's the point.", 6000);
      }
    } else {
      const reaction = KAI_BY_RATING[r.key];
      if (reaction) kaiReact(reaction.mode, reaction.text);
      setIdx(i => i + 1);
      setFlipped(false);
    }
  };

  return (
    <>
      {phase === 'queue' && <QueueView state={state} breakdown={breakdown} total={SRS_CARDS.length} onStart={startSession} />}
      {phase === 'session' && <SessionView card={SRS_CARDS[order[idx]]} idx={idx} flipped={flipped} setFlipped={setFlipped} onRate={handleRate} onExit={() => setPhase('queue')} />}
      {phase === 'done' && <DoneView ratings={ratings} state={state} onContinue={() => navigate('/app/progress')} onAgain={() => setPhase('queue')} />}

      <KaiCompanion
        mode={kaiMode}
        message={kaiMessage}
        onModeChange={setKaiMode}
        onMessageChange={setKaiReaction}
        // The end-of-session celebration is the one moment worth surfacing
        // even to someone who tucked Kai away. It's scoped to the reaction
        // window, so he slides back to his tab once it's over.
        demandAttention={phase === 'done' && kaiReaction !== null}
      />
    </>
  );
}

const QueueView = ({ state, breakdown, total, onStart }) => {
  const goalPct = Math.round((state.reviewedToday / state.goalToday) * 100);
  // The daily goal target and "cards due" are two different numbers by
  // design (goal is a personal target, due is today's actual queue size),
  // but stating a goal larger than what's actually available today is a
  // real contradiction, not just confusing copy — you can't hit a goal of
  // 10 when only 8 cards exist to review. Cap what we tell the user to what
  // they can actually achieve today.
  const achievableGoal = Math.min(state.goalToday, total);
  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto">
      <Breadcrumb segments={['daily-review', 'queue']} />
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mt-1" style={{ color: C.text1 }}>
        {total} cards due
        <span style={{ color: C.text3 }}> today</span>
      </h1>
      <p className="mt-3 text-base max-w-xl leading-relaxed" style={{ color: C.text2 }}>
        Spaced repetition. Rate each card honestly — the algorithm rebuilds tomorrow's queue from your signal.
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
          <p className="font-mono text-sm" style={{ color: C.text2 }}>Hit <span style={{ color: C.text1 }}>{achievableGoal}</span> cards to keep the streak alive.</p>
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

const SessionView = ({ card, idx, flipped, setFlipped, onRate, onExit }) => {
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
