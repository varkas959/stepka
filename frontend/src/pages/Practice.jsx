import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QUESTIONS, COMPANIES, CATEGORY_MAP } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { Loader2, Code2, FileText, Timer, RotateCw, ArrowRight, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { gradeAnswer } from '../lib/api';
import { PixelBar } from '../components/PixelBar';
import { DepthChallenge } from '../components/DepthChallenge';
import { useIsMobile } from '../lib/useIsMobile';

// Only DSA questions are genuinely "write a function" — System Design,
// Behavioral, Security, and everything else in this bank are scenario or
// discussion-style prompts, so they default to the text editor instead of
// dropping a coding question into a text box or a scenario into a code editor.
const deriveCategory = (q) => CATEGORY_MAP[q.topic] || (q.round === 'System Design' ? 'System Design' : q.round === 'HR' ? 'Behavioral' : 'Technical');
const isCodingQuestion = (q) => deriveCategory(q) === 'DSA';
const CODE_HINT = '// Pseudocode is fine — outline your approach, then refine.';

const ACC = 'var(--accent)';

export default function Practice({ isGuest = false }) {
  const location = useLocation();
  const pinned = location.state?.question ?? null;
  const [qIdx, setQIdx] = useState(() => Math.floor(Math.random() * QUESTIONS.length));
  const [pinnedQ, setPinnedQ] = useState(pinned);

  const q = pinnedQ ?? QUESTIONS[qIdx];
  const isBehavioral = deriveCategory(q) === 'Behavioral';
  // Code editing on a phone keyboard is a bad experience, so mobile defaults
  // to text even for coding questions — those get a "continue on desktop"
  // nudge instead of a cramped editor.
  const isMobile = useIsMobile();
  const [mode, setMode] = useState((isCodingQuestion(q) && !isMobile) ? 'code' : 'text');
  const [answer, setAnswer] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [depthOpen, setDepthOpen] = useState(false);
  const { addXp } = useAppState();
  const company = COMPANIES.find(c => c.id === q.company);
  const probeSkill = q.topicPath || q.topic || q.role;

  const navTo = (newIdx) => { setPinnedQ(null); setQIdx(newIdx); };

  useEffect(() => {
    setMode((isCodingQuestion(q) && !isMobile) ? 'code' : 'text');
    setAnswer(''); setSeconds(0); setFeedback(null);
  }, [q, isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (feedback) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [feedback]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const submit = () => {
    if (isGuest) { window.location.href = '/signin'; return; }
    if (!answer.trim()) { toast.error('Write something before submitting.'); return; }
    setSubmitting(true);
    (async () => {
      try {
        const fb = await gradeAnswer({ question: q.body, answer, mode, isBehavioral, topic: q.topicPath });
        setFeedback(fb);
        addXp(80);
      } catch (e) {
        toast.error(e?.response?.data?.detail || e.message || 'Grading failed. Try again.');
      } finally { setSubmitting(false); }
    })();
  };

  const reset = () => { setFeedback(null); setAnswer(''); setSeconds(0); };

  return (
    <div className="px-4 md:px-10 py-4 md:py-6 max-w-7xl mx-auto" data-testid="practice-page">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
            practice · ai graded
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-2)' }}>Submit → 1.5s grade → rubric. Honest, specific, no fluff.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => navTo((qIdx - 1 + QUESTIONS.length) % QUESTIONS.length)}
            className="border border-white/10 rounded-md px-2.5 py-1.5 text-zinc-300 hover:bg-white/5" data-testid="prev-question">← prev</button>
          {/* No absolute position shown — "526 / 1095" implies a sequence or
              plan that doesn't exist; these are shuffled, not ordered. */}
          <span className="text-zinc-500">shuffled practice</span>
          <button onClick={() => navTo((qIdx + 1) % QUESTIONS.length)}
            className="border border-white/10 rounded-md px-2.5 py-1.5 text-zinc-300 hover:bg-white/5" data-testid="next-question">next →</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Question */}
        <section className="rounded-lg border border-white/10 bg-zinc-950 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 text-xs">
            <span className="text-[11px] px-2 py-0.5 rounded-[4px] border" style={{ borderColor: 'rgba(59,111,212,0.35)', background: 'rgba(59,111,212,0.07)', color: '#7AA9F7' }}>{company?.name}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-[4px] border border-white/10 bg-white/[0.03] text-zinc-300">{q.role}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-[4px] border border-white/10 bg-white/[0.03] text-zinc-300">{q.difficulty}</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-zinc-400" title="Time spent — not scored, no limit">
              <Timer size={13} /> <span>{formatTime(seconds)}</span>
              <span className="text-zinc-600 hidden sm:inline">· not scored</span>
            </span>
          </div>
          <div className="p-5">
            <div className="text-zinc-100 text-base md:text-lg leading-relaxed" style={{ fontFamily: 'inherit' }}>
              {q.body}
            </div>
            <div className="mt-4 text-xs text-zinc-500">{q.topicPath} · {q.round} round</div>
          </div>
        </section>

        {/* Answer */}
        <section className="rounded-lg border border-white/10 bg-zinc-950 overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2 font-mono text-xs">
            <span className="text-emerald-400">&gt;</span>
            <span className="text-zinc-500">your-answer</span>
            <div className="ml-auto inline-flex items-center gap-0.5 border border-white/10 rounded-md p-0.5">
              <button data-testid="mode-text" onClick={() => setMode('text')}
                className="px-2 py-1 rounded-sm text-[11px] inline-flex items-center gap-1 transition-colors"
                style={mode === 'text' ? { background: ACC, color: '#fff', fontWeight: 600 } : { color: 'var(--text-2)' }}>
                <FileText size={11} /> text
              </button>
              {!(isMobile && isCodingQuestion(q)) && (
                <button data-testid="mode-code" onClick={() => setMode('code')}
                  className="px-2 py-1 rounded-sm text-[11px] inline-flex items-center gap-1 transition-colors"
                  style={mode === 'code' ? { background: ACC, color: '#fff', fontWeight: 600 } : { color: 'var(--text-2)' }}>
                  <Code2 size={11} /> code
                </button>
              )}
            </div>
          </div>
          {isMobile && isCodingQuestion(q) && (
            <div className="px-5 pt-3 text-xs" style={{ color: 'var(--text-3)' }}>
              Coding questions are easier with a real keyboard — continue on desktop for the code editor, or outline your approach in text here.
            </div>
          )}
          <textarea
            data-testid="answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={mode === 'code' ? CODE_HINT : '// type your answer. numbers and structure beat adjectives.'}
            rows={12}
            disabled={!!feedback}
            className={`flex-1 w-full bg-transparent border-0 p-5 text-sm focus:outline-none resize-y ${mode === 'code' ? 'font-mono' : ''} text-zinc-100 placeholder:text-zinc-700 disabled:opacity-60`}
          />
          <div className="border-t border-white/5 p-4 flex items-center gap-3">
            {!feedback ? (
              <button data-testid="submit-answer" onClick={submit} disabled={submitting}
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-md text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: ACC }}>
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? 'Grading…' : <>Submit <ArrowRight size={14} strokeWidth={2.5} /></>}
              </button>
            ) : (
              <button data-testid="try-again" onClick={reset}
                className="inline-flex items-center gap-2 text-sm px-3.5 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
                <RotateCw size={13} /> Try again
              </button>
            )}
            <div className="ml-auto font-mono text-xs text-zinc-500">{answer.length} chars</div>
          </div>
        </section>
      </div>

      {feedback && <FeedbackPanel feedback={feedback} />}

      {/* Interviewer probing — the question doesn't end at one answer */}
      {feedback && (
        <button data-testid="go-deeper" onClick={() => { if (isGuest) { window.location.href = '/signin'; return; } setDepthOpen(true); }}
          className="mt-4 w-full rounded-lg p-5 flex items-center gap-4 text-left transition-colors hover:bg-white/[0.02]"
          style={{ border: '1px solid var(--accent-35)', background: 'var(--accent-12)' }}>
          <ArrowDown size={18} className="shrink-0" style={{ color: 'var(--accent)' }} />
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>The interviewer follows up</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
              Defend <span style={{ color: 'var(--text-1)' }}>{probeSkill}</span> through escalating "why?" follow-ups — see how deep you really go.
            </div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] shrink-0" style={{ color: 'var(--accent)' }}>Go deeper →</span>
        </button>
      )}

      <DepthChallenge open={depthOpen} onOpenChange={setDepthOpen}
        skill={probeSkill} company={company?.name} role={q.role}
        onComplete={(lvl) => { addXp(40); toast.success(`Reached depth Level ${lvl}/5`); }} />
    </div>
  );
}

const FeedbackPanel = ({ feedback }) => {
  const applyToSrs = () => toast.success(`Applied "${feedback.suggestedLabel}" to SRS. Next review in 7d.`);
  const overall = parseFloat(feedback.overall);
  const overallColor = overall < 2.5 ? '#ef4444' : overall < 3.8 ? ACC : '#22c55e';
  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-zinc-950 p-6 animate-fade-up" data-testid="feedback-panel">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-4">Ai feedback</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Overall</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="font-mono text-5xl font-semibold" style={{ color: overallColor }}>{feedback.overall}</div>
            <div className="font-mono text-zinc-600">/ 5</div>
          </div>
          <div className="mt-5 space-y-2.5">
            {feedback.dims.map(d => {
              const color = d.score >= 75 ? '#22c55e' : d.score >= 60 ? ACC : '#ef4444';
              return (
                <div key={d.name} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-300">{d.name}</span>
                    <span className="font-mono text-zinc-400">{d.score}</span>
                  </div>
                  <PixelBar value={d.score} height={9} color={color} dotColor={color} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Notes</div>
          <p className="mt-2 text-zinc-100 leading-relaxed" style={{ fontFamily: 'inherit' }}>{feedback.text}</p>

          <div className="mt-5 rounded-md p-4 flex items-center gap-4"
               style={{ border: '1px solid rgba(59,111,212,0.3)', background: 'rgba(59,111,212,0.04)' }}>
            <div className="text-xs" style={{ color: 'var(--text-1)' }}>
              Suggested SRS rating: <span className="font-mono" style={{ color: '#7AA9F7' }}>"{feedback.suggestedLabel} ({feedback.suggestedRating})"</span>
            </div>
            <button data-testid="apply-srs" onClick={applyToSrs}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity"
              style={{ background: ACC }}>
              Apply to SRS
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Breadcrumb = ({ segments }) => (
  <div className="text-sm mb-4" style={{ color: 'var(--text-3)' }}>
    {segments.map((s, i) => (
      <span key={i}>
        <span className="mx-1.5">/</span>
        <span style={{ color: i === segments.length - 1 ? 'var(--text-2)' : 'var(--text-3)' }}>{s}</span>
      </span>
    ))}
  </div>
);
