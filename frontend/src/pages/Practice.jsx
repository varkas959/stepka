import { useEffect, useState } from 'react';
import { QUESTIONS, COMPANIES } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { Loader2, Code2, FileText, Timer, RotateCw, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { gradeAnswer } from '../lib/api';
import { PixelBar } from '../components/PixelBar';

const BEHAVIORAL_TOPICS = ['behavioral'];
const SAMPLE_CODE = `// two-sum O(n)
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return null;
}`;

const ACC = '#3B6FD4';
function SignInPrompt() {
  return (
    <div className="mb-6 rounded-lg p-4 flex items-center justify-between gap-3"
         style={{ border: '1px solid rgba(59,111,212,0.3)', background: 'rgba(59,111,212,0.06)' }}>
      <span className="font-mono text-sm" style={{ color: 'rgba(59,111,212,0.85)' }}>Sign in to submit answers and get AI grading</span>
      <a href="/signin" className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity"
         style={{ background: ACC }}>Sign in</a>
    </div>
  );
}

export default function Practice({ isGuest = false }) {
  const [qIdx, setQIdx] = useState(() => Math.floor(Math.random() * QUESTIONS.length));
  const q = QUESTIONS[qIdx];
  const isBehavioral = BEHAVIORAL_TOPICS.includes(q.topic);
  const [mode, setMode] = useState(isBehavioral ? 'text' : 'code');
  const [answer, setAnswer] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const { addXp } = useAppState();
  const company = COMPANIES.find(c => c.id === q.company);

  useEffect(() => {
    setMode(isBehavioral ? 'text' : 'code');
    setAnswer(''); setSeconds(0); setFeedback(null);
  }, [qIdx, isBehavioral]);

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
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-7xl mx-auto" data-testid="practice-page">
      {isGuest && <SignInPrompt />}
      <Breadcrumb segments={['practice', `${q.company}-${q.role.toLowerCase()}`, `q-${qIdx + 1}`]} />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 mt-1">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: '#F2F2F4' }}>
            <span style={{ color: '#4B5270' }}>$</span> practice · ai graded
          </h1>
          <p className="font-mono text-sm mt-2" style={{ color: '#8B8FA8' }}>Submit → 1.5s grade → rubric. Honest, specific, no fluff.</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <button onClick={() => setQIdx(i => (i - 1 + QUESTIONS.length) % QUESTIONS.length)}
            className="border border-white/10 rounded-md px-2.5 py-1.5 text-zinc-300 hover:bg-white/5" data-testid="prev-question">← prev</button>
          <span className="text-zinc-500">{qIdx + 1} / {QUESTIONS.length}</span>
          <button onClick={() => setQIdx(i => (i + 1) % QUESTIONS.length)}
            className="border border-white/10 rounded-md px-2.5 py-1.5 text-zinc-300 hover:bg-white/5" data-testid="next-question">next →</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Question */}
        <section className="rounded-lg border border-white/10 bg-zinc-950 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 font-mono text-xs">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] border" style={{ borderColor: 'rgba(59,111,212,0.35)', background: 'rgba(59,111,212,0.07)', color: '#7AA9F7' }}>{company?.name}</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] border border-white/10 bg-white/[0.03] text-zinc-300">{q.role}</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] border border-white/10 bg-white/[0.03] text-zinc-300">{q.difficulty}</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-zinc-400">
              <Timer size={13} /> <span>{formatTime(seconds)}</span>
            </span>
          </div>
          <div className="p-5">
            <div className="text-zinc-100 text-base md:text-lg leading-relaxed" style={{ fontFamily: 'inherit' }}>
              {q.body}
            </div>
            <div className="mt-4 font-mono text-xs text-zinc-500">{q.topicPath} · {q.round} round</div>
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
                style={mode === 'text' ? { background: ACC, color: '#fff', fontWeight: 600 } : { color: '#8B8FA8' }}>
                <FileText size={11} /> text
              </button>
              <button data-testid="mode-code" onClick={() => setMode('code')}
                className="px-2 py-1 rounded-sm text-[11px] inline-flex items-center gap-1 transition-colors"
                style={mode === 'code' ? { background: ACC, color: '#fff', fontWeight: 600 } : { color: '#8B8FA8' }}>
                <Code2 size={11} /> code
              </button>
            </div>
          </div>
          <textarea
            data-testid="answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={mode === 'code' ? SAMPLE_CODE : '// type your answer. numbers and structure beat adjectives.'}
            rows={12}
            disabled={!!feedback}
            className={`flex-1 w-full bg-transparent border-0 p-5 text-sm focus:outline-none resize-y ${mode === 'code' ? 'font-mono' : 'font-mono'} text-zinc-100 placeholder:text-zinc-700 disabled:opacity-60`}
          />
          <div className="border-t border-white/5 p-4 flex items-center gap-3">
            {!feedback ? (
              <button data-testid="submit-answer" onClick={submit} disabled={submitting}
                className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-md text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: ACC }}>
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? 'Grading…' : <>Submit <ArrowRight size={14} strokeWidth={2.5} /></>}
              </button>
            ) : (
              <button data-testid="try-again" onClick={reset}
                className="inline-flex items-center gap-2 font-mono text-sm px-3.5 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
                <RotateCw size={13} /> Try again
              </button>
            )}
            <div className="ml-auto font-mono text-xs text-zinc-500">{answer.length} chars</div>
          </div>
        </section>
      </div>

      {feedback && <FeedbackPanel feedback={feedback} />}
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
                <div key={d.name} className="font-mono text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-300">{d.name}</span>
                    <span className="text-zinc-400">{d.score}</span>
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
            <div className="font-mono text-xs" style={{ color: '#F2F2F4' }}>
              Suggested SRS rating: <span style={{ color: '#7AA9F7' }}>"{feedback.suggestedLabel} ({feedback.suggestedRating})"</span>
            </div>
            <button data-testid="apply-srs" onClick={applyToSrs}
              className="ml-auto inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity"
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
  <div className="font-mono text-sm mb-4" style={{ color: '#4B5270' }}>
    <span style={{ color: ACC }}>~</span>
    {segments.map((s, i) => (
      <span key={i}>
        <span className="mx-1.5">/</span>
        <span style={{ color: i === segments.length - 1 ? '#8B8FA8' : '#4B5270' }}>{s}</span>
      </span>
    ))}
  </div>
);
