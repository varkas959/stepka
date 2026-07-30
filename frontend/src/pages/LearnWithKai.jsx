import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Check, Trophy, ArrowUpRight, Play } from 'lucide-react';
import { useAppState } from '../lib/appState';
import { TECH_TRACKS, getTrack, getConceptById, getRelatedQuestions, getConceptsByTier } from '../lib/techConcepts';
import { QUESTIONS } from '../lib/mockData';
import { KaiCompanion } from '../components/KaiCompanion';
import { playCorrect, playIncorrect, playCelebrate } from '../lib/sound';

const ACC = 'var(--accent)';

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

function RelatedQuestions({ trackId, trackName, concept }) {
  const matches = getRelatedQuestions(trackId, concept.id, QUESTIONS);
  return (
    <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] mb-2 mt-3" style={{ color: 'var(--text-3)' }}>
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
      <Link to={`/app/questions?tech=${encodeURIComponent(trackName)}`} className="inline-flex items-center gap-1 text-xs font-medium mt-2.5" style={{ color: ACC }}>
        Browse all {trackName} interview questions <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}

function InterviewChallenge({ questions }) {
  if (!questions?.length) return null;
  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] mb-2.5" style={{ color: '#ef4444' }}>
        🔴 Can you answer this in an interview?
      </div>
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="text-sm leading-relaxed flex gap-2" style={{ color: 'var(--text-2)' }}>
            <span style={{ color: '#ef4444' }}>•</span> {q}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TierHeader({ emoji, label, done, total, isFirst }) {
  return (
    <div className={`flex items-center gap-2.5 mb-3 ${isFirst ? 'mt-0' : 'mt-10'}`}>
      <span className="text-lg leading-none">{emoji}</span>
      <h2 className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-2)' }}>{label}</h2>
      <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>{done}/{total}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

export default function LearnWithKai() {
  const { state, addXp, setConceptProgress } = useAppState();

  const [activeTrackId, setActiveTrackId] = useState(() => {
    // Resume whichever track was most recently touched, default to Java.
    const cl = state.conceptsLearn;
    if (!cl) return 'java';
    const withProgress = TECH_TRACKS.find(t => cl[t.id]?.lastConceptId);
    return withProgress?.id || 'java';
  });
  const track = getTrack(activeTrackId);
  const trackProgress = state.conceptsLearn?.[activeTrackId] || { lastConceptId: null, completedConceptIds: [] };
  const completed = trackProgress.completedConceptIds || [];
  const lastConceptId = trackProgress.lastConceptId;
  const lastConcept = lastConceptId ? getConceptById(activeTrackId, lastConceptId) : null;
  const allDone = completed.length >= track.concepts.length;

  const [openId, setOpenId] = useState(lastConceptId || track.concepts[0].id);
  const [mode, setMode] = useState('idle');
  const [message, setMessage] = useState(
    lastConcept
      ? `Welcome back! You were on ${lastConcept.title} last time — want to pick up where you left off?`
      : `Hi, I'm Kai! Let's make ${track.name} concepts simple. Pick one below to get started.`
  );
  const [activeQuiz, setActiveQuiz] = useState(null); // { conceptId, question }
  const [feedback, setFeedback] = useState(null);
  const [hintText, setHintText] = useState(null);
  const [hintEligible, setHintEligible] = useState(false); // true only during a wrong-quiz-answer window
  const [claim, setClaim] = useState(null); // { text, isCorrect, whyRight } — Kai's "teach me" moment

  const perfectRun = useRef(true); // stays true only if every quiz so far was correct on the first try
  const openIdRef = useRef(openId);
  useEffect(() => { openIdRef.current = openId; }, [openId]);

  // A resolved feedback message (quiz answered right, a "teach-back" claim
  // settled) is a one-off reaction, not a permanent state — without this it
  // sits there forever, so dismissing/re-opening Kai or scrolling just
  // re-shows the same "Nice catch!" indefinitely. `mode === 'thinking'` means
  // the wrong-answer state (retry/hint still pending), which should NOT
  // auto-clear out from under the user.
  useEffect(() => {
    if (!feedback || mode === 'thinking') return undefined;
    const id = setTimeout(() => {
      setFeedback(null);
      setClaim(null);
      setMode('idle');
      setMessage(`Whenever you're ready, pick another ${track.name} concept below.`);
    }, 5000);
    return () => clearTimeout(id);
  }, [feedback, mode, track.name]);

  const switchTrack = (trackId) => {
    if (trackId === activeTrackId) return;
    const nextTrack = getTrack(trackId);
    const nextProgress = state.conceptsLearn?.[trackId] || { lastConceptId: null, completedConceptIds: [] };
    setActiveTrackId(trackId);
    setOpenId(nextProgress.lastConceptId || nextTrack.concepts[0].id);
    setActiveQuiz(null);
    setFeedback(null);
    setHintText(null);
    setHintEligible(false);
    setClaim(null);
    perfectRun.current = true;
    setMode('idle');
    setMessage(
      nextProgress.lastConceptId
        ? `Switching to ${nextTrack.name}! You were on ${getConceptById(trackId, nextProgress.lastConceptId)?.title} last time.`
        : `Let's do ${nextTrack.name}! Pick a concept below to get started.`
    );
  };

  const openConcept = (concept) => {
    const willOpen = openId !== concept.id;
    setOpenId(willOpen ? concept.id : null);
    if (willOpen) {
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
  };

  const answerQuiz = (optionIndex) => {
    const { conceptId, question } = activeQuiz;
    const correct = optionIndex === question.correctIndex;
    setConceptProgress(activeTrackId, conceptId);

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
          ? completed.length >= track.concepts.length
          : completed.length + 1 >= track.concepts.length;

        if (justFinishedAll && perfectRun.current) {
          playCelebrate();
          setHintEligible(false);
          setMode('celebrate');
          setMessage(null);
          setFeedback({ correct: true, text: `You've mastered every ${track.name} concept, and got every single one right on the first try. Incredible run! 🎉` });
          toast.success('Perfect run — all concepts mastered!');
        } else if (justFinishedAll) {
          playCelebrate();
          setHintEligible(false);
          setMode('graduate');
          setMessage(null);
          setFeedback({ correct: true, text: `That's all ${track.concepts.length} ${track.name} concepts done! You've got the foundation locked in.` });
          toast.success(`You've completed ${track.name} with Kai! 🎓`);
        } else {
          setHintEligible(false);
          setMode('happy');
          setFeedback({ correct: true, text: `Nice answer! ${question.explainCorrect}` });
          toast.success('Nice answer! +10 XP');

          // A beat later, Kai tries to "teach back" what it just learned —
          // sometimes right, sometimes wrong — and the user corrects it.
          const concept = getConceptById(activeTrackId, conceptId);
          if (concept?.kaiClaim) {
            setTimeout(() => {
              // Skip if the user already moved on to a different concept card.
              if (openIdRef.current !== conceptId) return;
              setFeedback(null);
              setClaim(concept.kaiClaim);
            }, 1800);
          }
        }
      } else {
        perfectRun.current = false;
        setHintEligible(true);
        setMode('thinking');
        setFeedback({ correct: false, text: `Close! ${question.explainIncorrect}` });
        toast("Not quite — Kai has a hint if you want one.");
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

  // DefinedTermSet schema: an accurate structured-data description of what's
  // actually on this page (a glossary of programming concepts with plain-
  // language definitions), built from the same data the UI renders — not a
  // separate hand-maintained list that could drift out of sync.
  const definedTermSetLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Learn with Kai — Programming Concepts Explained Simply',
    description: 'Java, Python, and React concepts explained with 5th-grade analogies, real code, and interview-ready follow-up questions.',
    url: 'https://www.stepkai.com/app/learn',
    hasDefinedTerm: TECH_TRACKS.flatMap(t => t.concepts.map(c => ({
      '@type': 'DefinedTerm',
      name: c.title,
      description: c.analogy.text,
      inDefinedTermSet: 'https://www.stepkai.com/app/learn',
    }))),
  };

  return (
    <div className="px-4 md:px-10 py-4 md:py-6 max-w-3xl mx-auto" data-testid="learn-with-kai-page">
      <Helmet>
        <title>Learn Java, Python & React Simply — Analogies + Code | Stepkai</title>
        <meta
          name="description"
          content="75+ programming concepts explained with 5th-grade analogies, real code, and quizzes — Java, Python, React, from OOP basics to JVM internals. Free, no signup required to start."
        />
        <meta property="og:title" content="Learn Java, Python & React Simply — Analogies + Code | Stepkai" />
        <meta
          property="og:description"
          content="75+ programming concepts explained with 5th-grade analogies, real code, and quizzes — Java, Python, React, from OOP basics to JVM internals."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.stepkai.com/app/learn" />
        <script type="application/ld+json">{JSON.stringify(definedTermSetLd)}</script>
      </Helmet>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
        Learn with Kai
      </h1>
      <p className="text-sm mt-1.5" style={{ color: 'var(--text-2)' }}>
        Every concept as an analogy a 5th grader would get — then the real code.
      </p>

      {/* Track selector — jump between courses */}
      <div className="flex items-center gap-2 mt-5 mb-5">
        {TECH_TRACKS.map(t => {
          const active = t.id === activeTrackId;
          const tProgress = state.conceptsLearn?.[t.id]?.completedConceptIds?.length || 0;
          return (
            <button
              key={t.id}
              onClick={() => switchTrack(t.id)}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
              style={{
                background: active ? ACC : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-2)',
                border: `1px solid ${active ? ACC : 'var(--border)'}`,
              }}
            >
              <span>{t.icon}</span> {t.name}
              <span className="font-mono text-[11px] opacity-80">{tProgress}/{t.concepts.length}</span>
            </button>
          );
        })}
      </div>

      {/* Course hero card — mirrors a course-overview page: badge, title,
          description, real progress, and the topics actually covered. */}
      <div className="rounded-xl p-5 md:p-6" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--accent-12)', color: ACC, border: '1px solid var(--accent-35)' }}>
                <span>{track.icon}</span> {track.name}
              </span>
              {allDone && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--accent-12)', color: ACC, border: '1px solid var(--accent-35)' }}>
                  <Trophy size={12} /> Mastered
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
              {track.name} Concepts
            </h2>
            {track.description && (
              <p className="text-sm mt-1.5 leading-relaxed max-w-xl" style={{ color: 'var(--text-2)' }}>{track.description}</p>
            )}
          </div>
          <ProgressRing done={completed.length} total={track.concepts.length} />
        </div>

        {track.highlights?.length > 0 && (
          <div className="mt-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-3)' }}>What you'll learn</div>
            <div className="flex flex-wrap gap-2">
              {track.highlights.map(h => (
                <span key={h} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>{h}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>
            <span>Your progress</span>
            <span className="font-mono">{completed.length}/{track.concepts.length} concepts</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--inset)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${track.concepts.length > 0 ? Math.round((completed.length / track.concepts.length) * 100) : 0}%`, background: ACC, transition: 'width 0.4s ease' }}
            />
          </div>
        </div>
      </div>

      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] mt-8 mb-1" style={{ color: 'var(--text-3)' }}>Course content</h3>

      {(() => {
        const tierGroups = getConceptsByTier(activeTrackId);

        const renderConcept = (concept) => {
          const isOpen = openId === concept.id;
          const isDone = completed.includes(concept.id);
          const num = track.concepts.findIndex(c => c.id === concept.id) + 1;
          const isCurrent = !isDone && concept.id === (lastConceptId || track.concepts[0]?.id);
          return (
            <div key={concept.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <button
                onClick={() => openConcept(concept)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono text-xs font-semibold"
                  style={isDone
                    ? { background: 'var(--diff-easy)', color: '#fff' }
                    : isCurrent
                      ? { background: 'var(--accent-12)', color: ACC, border: `1px solid ${ACC}` }
                      : { background: 'var(--inset)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
                >
                  {isDone ? <Check size={13} strokeWidth={3} /> : num}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px] truncate" style={{ color: 'var(--text-1)' }}>{concept.analogy.emoji} {concept.title}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{concept.tagline}</div>
                </div>
                <span className="font-mono text-[11px] shrink-0 px-2 py-1 rounded-full" style={{ background: 'var(--inset)', color: 'var(--text-3)' }}>+10 XP</span>
                {isOpen ? <ChevronDown size={16} className="shrink-0" style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={16} className="shrink-0" style={{ color: 'var(--text-3)' }} />}
              </button>

              {isOpen && (
                <div className="px-4 pb-5 pt-1 space-y-4">
                  <div className="rounded-lg p-4 text-sm leading-relaxed" style={{ background: 'var(--accent-12)', color: 'var(--text-1)', border: '1px solid var(--accent-35)' }}>
                    {concept.analogy.text}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{concept.explainer}</p>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-3)' }}>{concept.codeExample.label}</div>
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

                  <RelatedQuestions trackId={activeTrackId} trackName={track.name} concept={concept} />

                  <InterviewChallenge questions={concept.interviewChallenge} />
                </div>
              )}
            </div>
          );
        };

        if (tierGroups) {
          return tierGroups.map((group, i) => (
            <div key={group.id}>
              <TierHeader
                emoji={group.emoji}
                label={group.label}
                done={group.concepts.filter(c => completed.includes(c.id)).length}
                total={group.concepts.length}
                isFirst={i === 0}
              />
              <div className="space-y-2.5">{group.concepts.map(renderConcept)}</div>
            </div>
          ));
        }

        return <div className="mt-6 space-y-2.5">{track.concepts.map(renderConcept)}</div>;
      })()}

      <KaiCompanion
        mode={mode}
        message={message}
        onModeChange={setMode}
        onMessageChange={setMessage}
        question={mode === 'quiz' ? activeQuiz?.question : null}
        onAnswer={answerQuiz}
        feedback={feedback}
        hintAvailable={hintEligible}
        hintText={hintText}
        onRequestHint={requestHint}
        onRetry={retryQuiz}
        claim={claim}
        onClaimAnswer={answerClaim}
      />
    </div>
  );
}
