import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppState, getCurrentDay, getDayCards } from '../lib/appState';
import { gradeAnswer } from '../lib/api';
import { PixelBar } from '../components/PixelBar';
import { KaiCompanion } from '../components/KaiCompanion';
import { Loader2, ChevronLeft, Trophy, Zap, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

// Kai's reaction to each AI-graded rating (1-4, mapped from gradeAnswer's
// suggestedRating). A "forgot"-equivalent grade is deliberately met with
// encouragement rather than disappointment — the algorithm needs an honest
// answer attempt, not a withheld one, so a rough answer shouldn't feel punished.
const KAI_BY_RATING = {
  1: { mode: 'thinking',  text: "That one's tricky — it'll come back sooner so you can nail it." },
  2: { mode: 'thinking',  text: "Hard-won still counts. You'll see that one again soon." },
  3: { mode: 'happy',     text: "Nice recall! That one's sticking." },
  4: { mode: 'happy',     text: "Locked in — that one's parked for a while." },
};

export default function DailyReview() {
  const { state, bumpReview, addXp, recordRating, startDayReview, gradeReviewCard, finishDayReview } = useAppState();
  const navigate = useNavigate();

  const dayData = getCurrentDay(state.activePlan);
  const [phase, setPhase] = useState('queue'); // 'queue' | 'session' | 'results'
  const [sessionCards, setSessionCards] = useState([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [gradedThisSession, setGradedThisSession] = useState([]); // [{card, feedback}]
  const [readinessBefore, setReadinessBefore] = useState(state.readiness);

  const [kaiMode, setKaiMode] = useState('idle');
  const [kaiReaction, setKaiReaction] = useState(null);
  const kaiResetTimer = useRef(null);

  // Deliberately doesn't restate "Day N · N cards" — that's already the
  // page's own H1, right above where this bubble renders. Kai should add
  // something the page doesn't already say, not echo it back.
  const kaiGreeting = state.streak > 0
    ? `You're on a ${state.streak}-day streak — let's keep it alive.`
    : 'Answer honestly, even a rough attempt — a real answer teaches the grader more than skipping ever could.';
  const kaiMessage = kaiReaction ?? kaiGreeting;

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

  // No plan yet — Daily Review has nothing of its own to serve. It's the
  // delivery mechanism for the plan's cards, not a standalone destination
  // with a generic fallback deck.
  if (!state.activePlan?.plan || !dayData) {
    return <LockedView />;
  }

  const pendingCards = getDayCards(dayData).filter(c => c.status === 'pending');
  const currentCard = sessionCards[cardIdx];

  const startSession = () => {
    startDayReview(dayData.day); // materializes + persists this day's cards
    setSessionCards(pendingCards);
    setReadinessBefore(state.readiness);
    setCardIdx(0); setAnswer(''); setFeedback(null); setGradedThisSession([]);
    setPhase('session');
    kaiReact('happy', "Let's go — answer honestly, that's what makes this work.");
  };

  const submitAnswer = async () => {
    if (!answer.trim()) { toast.error('Write something before submitting.'); return; }
    setGrading(true);
    try {
      const fb = await gradeAnswer({ question: currentCard.question, answer, mode: 'text', isBehavioral: false, topic: dayData.focus });
      const overall = parseFloat(fb.overall);
      setFeedback(fb);
      gradeReviewCard(dayData.day, currentCard.id, { overall, suggestedRating: fb.suggestedRating });
      bumpReview();
      addXp(10 + fb.suggestedRating * 2);
      recordRating(currentCard.id, fb.suggestedRating);
      setGradedThisSession(prev => [...prev, { card: currentCard, feedback: fb }]);
      const reaction = KAI_BY_RATING[fb.suggestedRating];
      if (reaction) kaiReact(reaction.mode, reaction.text);
    } catch (e) {
      toast.error(e?.response?.data?.error || e.message || 'Grading failed. Try again.');
    } finally {
      setGrading(false);
    }
  };

  const continueNext = () => {
    if (cardIdx + 1 >= sessionCards.length) {
      finishDayReview(dayData.day);
      setPhase('results');
      kaiReact('celebrate', 'Day done — readiness just moved. Tomorrow picks up from here.', 6000);
    } else {
      setCardIdx(i => i + 1);
      setAnswer('');
      setFeedback(null);
    }
  };

  return (
    <>
      {phase === 'queue' && <QueueView state={state} day={dayData} pendingCount={pendingCards.length} onStart={startSession} />}
      {phase === 'session' && (
        <SessionView
          day={dayData} card={currentCard} idx={cardIdx} total={sessionCards.length}
          answer={answer} setAnswer={setAnswer} grading={grading} feedback={feedback}
          onSubmit={submitAnswer} onContinue={continueNext} onExit={() => setPhase('queue')}
        />
      )}
      {phase === 'results' && (
        <ResultsView
          state={state} dayNumber={dayData.day} readinessBefore={readinessBefore}
          graded={gradedThisSession} onContinue={() => navigate('/app/progress')} onBackToPlan={() => navigate('/app/plan')}
        />
      )}

      {/* Kai is desktop-only here — on mobile the docked tab's off-screen-by-design
          left offset clipped over the card instead of tucking away cleanly, and
          this screen has no room to spare for a companion anyway. */}
      <div className="hidden md:block">
        <KaiCompanion
          mode={kaiMode}
          message={kaiMessage}
          onModeChange={setKaiMode}
          onMessageChange={setKaiReaction}
          demandAttention={phase === 'results' && kaiReaction !== null}
        />
      </div>
    </>
  );
}

const LockedView = () => (
  <div className="px-4 md:px-10 py-6 md:py-10 max-w-2xl mx-auto">
    <Breadcrumb segments={['daily-review']} />
    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: C.text1 }}>
      Nothing to review yet
    </h1>
    <p className="mt-3 text-base leading-relaxed max-w-md" style={{ color: C.text2 }}>
      Daily Review runs off your study plan — start one from a job description and today's cards will show up here.
    </p>
    <Link to="/app/plan" data-testid="start-plan-cta"
      className="pressable mt-6 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity"
      style={{ background: C.accent }}>
      Start a plan <ArrowRight size={14} strokeWidth={2.5} />
    </Link>
  </div>
);

const QueueView = ({ state, day, pendingCount, onStart }) => {
  const goalPct = Math.round((state.reviewedToday / state.goalToday) * 100);
  const achievableGoal = Math.min(state.goalToday, pendingCount);
  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto">
      <Breadcrumb segments={['daily-review', `day-${day.day}`]} />
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mt-1" style={{ color: C.text1 }}>
        Day {day.day} <span style={{ color: C.text3 }}>· {day.focus}</span>
      </h1>
      <p className="mt-3 text-base max-w-xl leading-relaxed" style={{ color: C.text2 }}>
        {pendingCount > 0
          ? `${pendingCount} card${pendingCount === 1 ? '' : 's'} today — answer each honestly, the grader rebuilds tomorrow's queue from your signal.`
          : "Today's cards are done. Review again any time, or come back tomorrow for the next day."}
      </p>

      {pendingCount > 0 && (
        <div className="mt-6 rounded-lg p-5 sm:p-6" style={{ border: '1px solid ' + C.border, background: C.bg2 }}>
          <div className="flex items-center justify-between mb-3 font-mono text-xs">
            <span className="uppercase tracking-[0.18em]" style={{ color: C.text3 }}>Daily goal</span>
            <span style={{ color: C.text2 }}>{state.reviewedToday}<span style={{ color: C.text3 }}> / {state.goalToday}</span></span>
          </div>
          <PixelBar value={goalPct} height={14} color={C.green} />
          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm" style={{ color: C.text2 }}>Hit <span className="font-mono" style={{ color: C.text1 }}>{achievableGoal}</span> cards to keep the streak alive.</p>
            <button data-testid="start-review" onClick={onStart}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity"
              style={{ background: C.accent }}>
              Start Day {day.day} <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SessionView = ({ day, card, idx, total, answer, setAnswer, grading, feedback, onSubmit, onContinue, onExit }) => {
  if (!card) return null;
  const overall = feedback ? parseFloat(feedback.overall) : null;
  const overallColor = overall == null ? C.accent : overall < 2.5 ? C.red : overall < 3.8 ? C.accent : C.green;
  return (
    // Mobile: one card, full screen, no sidebar/chrome — a fixed full-viewport
    // overlay escapes the app shell's nav padding entirely, with the primary
    // action pinned to the bottom where a thumb can reach it. Desktop keeps
    // the original centered layout inside the normal app shell.
    <div className="fixed inset-0 z-50 flex flex-col md:static md:block md:px-10 md:py-10 md:max-w-2xl md:mx-auto"
         style={{ background: C.bg }} data-testid="srs-session">
      <div className="px-4 pt-4 md:px-0 md:pt-0 shrink-0">
        <Breadcrumb segments={['daily-review', `day-${day.day}`, `card-${idx + 1}-of-${total}`]} />

        <div className="flex items-center justify-between mb-4 mt-2 text-xs">
          <button data-testid="exit-session" onClick={onExit}
                  className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80 py-1"
                  style={{ color: C.text3 }}>
            <ChevronLeft size={14} /> exit
          </button>
          <span className="font-mono" style={{ color: C.text3 }}><span className="font-semibold" style={{ color: C.text1 }}>{idx + 1}</span> / {total}</span>
        </div>

        <PixelBar value={(idx / total) * 100} height={10} color={C.green} />
      </div>

      <div className="flex-1 min-h-0 px-4 md:px-0 mt-6 md:mt-8 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: C.text3 }}>{day.focus}</span>
          {card.carriedFrom && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 text-amber-400">retry from day {card.carriedFrom}</span>
          )}
        </div>
        <div className="rounded-lg p-6" style={{ border: '1px solid ' + C.border, background: C.bg2 }}>
          <div className="text-lg md:text-xl leading-relaxed" style={{ color: C.text1 }}>{card.question}</div>
        </div>

        {!feedback ? (
          <textarea
            data-testid="answer-input"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer…"
            rows={6}
            disabled={grading}
            className="w-full mt-4 rounded-lg p-4 text-sm resize-y outline-none disabled:opacity-60"
            style={{ border: '1px solid ' + C.border, background: C.bg2, color: C.text1 }}
          />
        ) : (
          <div className="mt-4 rounded-lg p-5 animate-fade-up" style={{ border: '1px solid ' + C.border, background: C.bg2 }} data-testid="feedback-panel">
            <div className="flex items-center gap-3">
              <div className="font-mono text-3xl font-semibold" style={{ color: overallColor }}>{feedback.overall}<span className="text-base" style={{ color: C.text3 }}>/5</span></div>
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] px-2 py-1 rounded border" style={{ borderColor: overallColor + '50', color: overallColor }}>{feedback.suggestedLabel}</div>
            </div>
            <div className="mt-3 space-y-2">
              {feedback.dims?.map(d => {
                const color = d.score >= 75 ? C.green : d.score >= 60 ? C.accent : C.red;
                return (
                  <div key={d.name} className="text-xs">
                    <div className="flex justify-between mb-1"><span style={{ color: C.text2 }}>{d.name}</span><span className="font-mono" style={{ color: C.text3 }}>{d.score}</span></div>
                    <PixelBar value={d.score} height={8} color={color} dotColor={color} />
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: C.text1 }}>{feedback.text}</p>
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 pb-4 md:px-0 md:pb-0 md:mt-6 pt-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {!feedback ? (
          <button data-testid="submit-answer" onClick={onSubmit} disabled={grading}
            className="pressable w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ background: C.accent }}>
            {grading && <Loader2 size={14} className="animate-spin" />}
            {grading ? 'Grading…' : 'Submit'}
          </button>
        ) : (
          <button data-testid="continue-session" onClick={onContinue}
            className="pressable w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ background: C.accent }}>
            {idx + 1 >= total ? 'Finish day' : 'Continue'} <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
};

const ResultsView = ({ state, dayNumber, readinessBefore, graded, onContinue, onBackToPlan }) => {
  const readinessAfter = state.readiness;
  const delta = readinessAfter - readinessBefore;
  const missed = graded.filter(g => parseFloat(g.feedback.overall) < 3.0);
  const tomorrow = state.activePlan?.plan?.days?.find(d => d.day === dayNumber + 1);
  const tomorrowPending = tomorrow ? getDayCards(tomorrow).filter(c => c.status === 'pending') : [];
  return (
    <div className="px-4 md:px-10 py-6 md:py-12 max-w-2xl mx-auto" data-testid="session-complete">
      <Breadcrumb segments={['daily-review', `day-${dayNumber}`, 'complete']} />
      <div className="text-center mt-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-md mb-5"
             style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <Trophy size={24} style={{ color: '#4ADE80' }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: C.text1 }}>
          Day {dayNumber} <span style={{ color: C.text3 }}>done.</span>
        </h1>
        <p className="mt-3 font-mono text-lg" style={{ color: C.text2 }}>
          Readiness {readinessBefore}% <span style={{ color: C.text3 }}>→</span>{' '}
          <span style={{ color: delta >= 0 ? C.green : C.red }}>{readinessAfter}%</span>
          {delta !== 0 && <span className="text-sm ml-1" style={{ color: C.text3 }}>({delta > 0 ? '+' : ''}{delta})</span>}
        </p>
      </div>

      {missed.length > 0 && (
        <div className="mt-6 rounded-lg p-5" style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.03)' }}>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] mb-3" style={{ color: '#F87171' }}>What you missed</div>
          <div className="space-y-2">
            {missed.map(({ card }) => (
              <div key={card.id} className="text-sm leading-relaxed" style={{ color: C.text2 }}>· {card.question}</div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: C.text3 }}>These come back tomorrow, mixed in with new cards.</p>
        </div>
      )}

      <div className="mt-6 rounded-lg p-5" style={{ border: '1px solid ' + C.border, background: C.bg2 }}>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] mb-2" style={{ color: C.text3 }}>Queued for tomorrow</div>
        {tomorrow ? (
          <>
            <div className="text-sm" style={{ color: C.text1 }}>Day {tomorrow.day} · {tomorrow.focus}</div>
            <div className="text-xs mt-1" style={{ color: C.text3 }}>
              {tomorrowPending.length} card{tomorrowPending.length === 1 ? '' : 's'}
              {missed.length > 0 ? ` · ${missed.length} carried over from today` : ''}
            </div>
          </>
        ) : (
          <div className="text-sm" style={{ color: C.text2 }}>That was the last day of your plan — nice work seeing it through.</div>
        )}
      </div>

      <div className="flex gap-2 mt-6">
        <button data-testid="back-to-dashboard" onClick={onContinue}
          className="pressable flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity"
          style={{ background: C.accent }}>
          <Zap size={14} strokeWidth={2.5} /> See progress
        </button>
        <button onClick={onBackToPlan}
          className="pressable flex-1 text-sm rounded-md py-2.5 transition-opacity hover:opacity-80"
          style={{ background: C.bg3, border: '1px solid ' + C.border, color: C.text2 }}>
          back to plan
        </button>
      </div>
    </div>
  );
};

const Breadcrumb = ({ segments }) => (
  <div className="text-sm mb-4" style={{ color: C.text3 }}>
    {segments.map((s, i) => (
      <span key={i}>
        <span className="mx-1.5">/</span>
        <span style={{ color: i === segments.length - 1 ? C.text2 : C.text3 }}>{s}</span>
      </span>
    ))}
  </div>
);
