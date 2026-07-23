import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Check, Trophy, ArrowUpRight, Play } from 'lucide-react';
import { useAppState } from '../lib/appState';
import { JAVA_CONCEPTS, getConceptById, getRelatedQuestions } from '../lib/javaConcepts';
import { QUESTIONS } from '../lib/mockData';
import { Mascot } from '../components/Mascot';
import { playCorrect, playIncorrect, playCelebrate } from '../lib/sound';

const ACC = 'var(--accent)';
const IDLE_TIMEOUT_MS = 30000;

function ProgressRing({ done, total }) {
  const size = 44, stroke = 4, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ACC} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold" style={{ color: 'var(--text-1)' }}>
        {done}/{total}
      </div>
    </div>
  );
}

function RunOutput({ output }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const running = revealedCount > 0 && revealedCount < output.length;

  const run = () => {
    setRevealedCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealedCount(i);
      if (i >= output.length) clearInterval(id);
    }, 500);
  };

  return (
    <div>
      <button
        onClick={run}
        disabled={running}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg mb-2 disabled:opacity-60"
        style={{ border: '1px solid var(--border-2)', color: 'var(--text-2)' }}
      >
        <Play size={11} /> Run this code
      </button>
      {revealedCount > 0 && (
        <div className="rounded-lg p-3 font-mono text-xs space-y-1" style={{ background: '#0c0c0f', border: '1px solid var(--border)' }}>
          {output.slice(0, revealedCount).map((line, i) => (
            <div key={i} style={{ color: line.startsWith('✓') ? 'var(--diff-easy)' : '#d4d4d8' }}>
              {line.startsWith('✓') ? line : `> ${line}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedQuestions({ concept }) {
  const matches = getRelatedQuestions(concept.id, QUESTIONS);
  return (
    <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2 mt-3" style={{ color: 'var(--text-3)' }}>
        Seen in real interview questions
      </div>
      {matches.length > 0 ? (
        <div className="space-y-2">
          {matches.map(q => (
            <Link
              key={q.id}
              to={`/app/question/${q.id}`}
              className="flex items-start justify-between gap-2 text-sm px-3 py-2.5 rounded-lg transition-colors hover:bg-white/[0.03]"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              <span className="leading-snug">{q.body.length > 110 ? q.body.slice(0, 110) + '…' : q.body}</span>
              <ArrowUpRight size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--text-3)' }} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>No exact match yet for this one —</p>
      )}
      <Link to="/app/questions" className="inline-flex items-center gap-1 text-xs font-medium mt-2.5" style={{ color: ACC }}>
        Browse all Java interview questions <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}

export default function JavaConceptsSimple() {
  const { state, addXp, setJavaLearnProgress } = useAppState();
  const completed = state.javaLearn?.completedConceptIds || [];
  const lastConceptId = state.javaLearn?.lastConceptId;
  const lastConcept = lastConceptId ? getConceptById(lastConceptId) : null;
  const allDone = completed.length >= JAVA_CONCEPTS.length;

  const [openId, setOpenId] = useState(lastConceptId || JAVA_CONCEPTS[0].id);
  const [mascotActive, setMascotActive] = useState(true);
  const [mode, setMode] = useState('idle');
  const [message, setMessage] = useState(
    lastConcept
      ? `Welcome back! You were on ${lastConcept.title} last time — want to pick up where you left off?`
      : "Hi, I'm Taaza! Let's make Java concepts simple. Pick one below to get started."
  );
  const [activeQuiz, setActiveQuiz] = useState(null); // { conceptId, question }
  const [feedback, setFeedback] = useState(null);
  const [hintText, setHintText] = useState(null);
  const [hintEligible, setHintEligible] = useState(false); // true only during a wrong-quiz-answer window
  const [claim, setClaim] = useState(null); // { text, isCorrect, whyRight } — Taaza's "teach me" moment

  const idleTimer = useRef(null);
  const perfectRun = useRef(true); // stays true only if every quiz so far was correct on the first try
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const openIdRef = useRef(openId);
  useEffect(() => { openIdRef.current = openId; }, [openId]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      // Never interrupt an active quiz/feedback moment with a yawn.
      if (modeRef.current === 'idle' || modeRef.current === 'look') {
        setMode('sleepy');
        setMessage('*yawn* Still there? Take your time.');
      }
    }, IDLE_TIMEOUT_MS);
  }, []);

  // Idle-yawn timer — resets on any click or scroll, and wakes Taaza back up
  useEffect(() => {
    resetIdleTimer();
    const onActivity = () => {
      if (modeRef.current === 'sleepy') {
        setMode('idle');
        setMessage("Oh, welcome back!");
      }
      resetIdleTimer();
    };
    window.addEventListener('click', onActivity);
    window.addEventListener('scroll', onActivity, { passive: true });
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('scroll', onActivity);
    };
  }, [resetIdleTimer]);

  // Scroll → Taaza glances at the content, only when just idly sitting there
  useEffect(() => {
    let lookTimeout;
    const onScroll = () => {
      setMode(m => (m === 'idle' ? 'look' : m));
      clearTimeout(lookTimeout);
      lookTimeout = setTimeout(() => setMode(m => (m === 'look' ? 'idle' : m)), 1200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(lookTimeout); };
  }, []);

  const openConcept = (concept) => {
    const willOpen = openId !== concept.id;
    setOpenId(willOpen ? concept.id : null);
    if (willOpen) {
      setMascotActive(true);
      setMode('surprise');
      setMessage(concept.expandReaction);
      setFeedback(null);
      setHintText(null);
      setHintEligible(false);
      setClaim(null);
    }
  };

  const startQuiz = (concept) => {
    setActiveQuiz({ conceptId: concept.id, question: concept.quiz[0] });
    setFeedback(null);
    setHintText(null);
    setHintEligible(false);
    setClaim(null);
    setMode('quiz');
    setMascotActive(true);
  };

  const answerQuiz = (optionIndex) => {
    const { conceptId, question } = activeQuiz;
    const correct = optionIndex === question.correctIndex;
    setJavaLearnProgress(conceptId);

    // Play immediately, synchronously within the click handler — browsers tie
    // audio playback permission to the user gesture, not to a later timeout.
    if (correct) playCorrect(); else playIncorrect();

    // Brief "let me check that" pause before revealing the result.
    setMode('thinking');
    setFeedback(null);
    setMessage('Hmm, let me check that…');
    setTimeout(() => {
      if (correct) {
        addXp(10);
        const justFinishedAll = completed.includes(conceptId)
          ? completed.length >= JAVA_CONCEPTS.length
          : completed.length + 1 >= JAVA_CONCEPTS.length;

        if (justFinishedAll && perfectRun.current) {
          playCelebrate();
          setHintEligible(false);
          setMode('celebrate');
          setMessage(null);
          setFeedback({ correct: true, text: "You've mastered every concept, and got every single one right on the first try. Incredible run! 🎉" });
          toast.success('Perfect run — all concepts mastered!');
        } else if (justFinishedAll) {
          playCelebrate();
          setHintEligible(false);
          setMode('graduate');
          setMessage(null);
          setFeedback({ correct: true, text: "That's all 7 concepts done! You've got the OOP foundation locked in." });
          toast.success("You've completed Java Concepts Simply! 🎓");
        } else {
          setHintEligible(false);
          setMode('happy');
          setFeedback({ correct: true, text: `Nice answer! ${question.explainCorrect}` });
          toast.success('Nice answer! +10 XP');

          // A beat later, Taaza tries to "teach back" what it just learned —
          // sometimes right, sometimes wrong — and the user corrects it.
          const concept = getConceptById(conceptId);
          if (concept?.taazaClaim) {
            setTimeout(() => {
              // Skip if the user already moved on to a different concept card.
              if (openIdRef.current !== conceptId) return;
              setFeedback(null);
              setClaim(concept.taazaClaim);
            }, 1800);
          }
        }
      } else {
        perfectRun.current = false;
        setHintEligible(true);
        setMode('thinking');
        setFeedback({ correct: false, text: `Close! ${question.explainIncorrect}` });
        toast("Not quite — Taaza has a hint if you want one.");
      }
    }, 550);
  };

  const requestHint = () => {
    setHintText(activeQuiz.question.hint);
  };

  const retryQuiz = () => {
    setFeedback(null);
    setHintText(null);
    setHintEligible(false);
    setMode('quiz');
  };

  const answerClaim = (saidTrue) => {
    const gotItRight = saidTrue === claim.isCorrect;
    const { whyRight } = claim;
    setClaim(null);
    if (gotItRight) playCorrect(); else playIncorrect();
    setMode(gotItRight ? 'happy' : 'surprise');
    setFeedback({ correct: gotItRight, text: gotItRight ? `Nice catch! ${whyRight}` : `Actually... ${whyRight}` });
  };

  return (
    <div className="px-4 md:px-10 py-4 md:py-6 max-w-3xl mx-auto" data-testid="java-concepts-page">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Java Concepts, Explained Simply
          </h1>
          {allDone && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'var(--accent-12)', color: ACC, border: '1px solid var(--accent-35)' }}>
              <Trophy size={13} /> All concepts mastered
            </span>
          )}
        </div>
        <ProgressRing done={completed.length} total={JAVA_CONCEPTS.length} />
      </div>
      <p className="font-mono text-sm mt-2" style={{ color: 'var(--text-2)' }}>
        Every concept as an analogy a 5th grader would get — then the real code.
      </p>

      <div className="mt-6 space-y-2.5">
        {JAVA_CONCEPTS.map((concept) => {
          const isOpen = openId === concept.id;
          const isDone = completed.includes(concept.id);
          return (
            <div key={concept.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <button
                onClick={() => openConcept(concept)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                {isOpen ? <ChevronDown size={16} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />}
                <span className="text-xl">{concept.analogy.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-[15px]" style={{ color: 'var(--text-1)' }}>{concept.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>{concept.tagline}</div>
                </div>
                {isDone && (
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--diff-easy)', opacity: 0.9 }}>
                    <Check size={13} color="#fff" strokeWidth={3} />
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-5 pt-1 space-y-4">
                  <div className="rounded-lg p-4 text-sm leading-relaxed" style={{ background: 'var(--accent-12)', color: 'var(--text-1)', border: '1px solid var(--accent-35)' }}>
                    {concept.analogy.text}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{concept.explainer}</p>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-3)' }}>{concept.codeExample.label}</div>
                    <pre className="rounded-lg p-4 text-xs overflow-x-auto font-mono mb-3" style={{ background: 'var(--inset)', color: 'var(--text-1)', border: '1px solid var(--border)' }}>
                      {concept.codeExample.code}
                    </pre>
                    {concept.codeExample.output && <RunOutput key={concept.id} output={concept.codeExample.output} />}
                  </div>
                  <button
                    onClick={() => startQuiz(concept)}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white"
                    style={{ background: ACC }}
                  >
                    Quick check — am I getting this?
                  </button>

                  <RelatedQuestions concept={concept} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Mascot
        active={mascotActive}
        mode={mode}
        message={message}
        question={mode === 'quiz' ? activeQuiz?.question : null}
        onAnswer={answerQuiz}
        feedback={feedback}
        hintAvailable={hintEligible}
        hintText={hintText}
        onRequestHint={requestHint}
        onDismiss={() => setMascotActive(false)}
        onRetry={retryQuiz}
        claim={claim}
        onClaimAnswer={answerClaim}
      />
    </div>
  );
}
