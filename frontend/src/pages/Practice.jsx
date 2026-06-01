import { useEffect, useState } from 'react';
import { QUESTIONS } from '../lib/mockData';
import { CompanyBadge } from '../components/CompanyBadge';
import { useAppState } from '../lib/appState';
import { Loader2, Code2, FileText, Timer, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

const BEHAVIORAL_TOPICS = ['behavioral'];
const SAMPLE_CODE = `// Two-Sum O(n)
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return null;
}`;

export default function Practice() {
  const [qIdx, setQIdx] = useState(0);
  const q = QUESTIONS[qIdx];
  const isBehavioral = BEHAVIORAL_TOPICS.includes(q.topic);
  const [mode, setMode] = useState(isBehavioral ? 'text' : 'code');
  const [answer, setAnswer] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const { addXp } = useAppState();

  useEffect(() => {
    setMode(isBehavioral ? 'text' : 'code');
    setAnswer('');
    setSeconds(0);
    setFeedback(null);
  }, [qIdx, isBehavioral]);

  useEffect(() => {
    if (feedback) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [feedback]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const submit = () => {
    if (!answer.trim()) {
      toast.error('Write something before submitting.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const isBeh = isBehavioral;
      const overall = (3.4 + Math.random() * 1.3).toFixed(1);
      const dims = isBeh
        ? [
            { name: 'STAR structure', score: 78 },
            { name: 'Relevance', score: 84 },
            { name: 'Outcome clarity', score: 62 },
            { name: 'Conciseness', score: 71 },
          ]
        : [
            { name: 'Correctness', score: 82 },
            { name: 'Depth', score: 68 },
            { name: 'Examples', score: 74 },
            { name: 'Edge cases', score: 55 },
          ];
      const fb = {
        overall,
        dims,
        suggestedRating: 3,
        suggestedLabel: 'Good',
        text: isBeh
          ? "Strong start with a clear Situation. Task framing is concise. Action gets technical enough to be credible but could highlight one concrete metric. Result section ends abruptly — quantify the outcome (latency reduction, retention lift, revenue) and tie it back to the original problem. Watch for over-explaining the technology choice; interviewer wants impact, not implementation tour."
          : "Correctness is solid for the happy path. Time/space complexity is mentioned but not derived rigorously. Missing edge cases: empty input, single element, duplicates, overflow on large ints. Suggested next: walk through one degenerate case explicitly. Depth on the recursion-to-iteration transformation is shallow — explain why the stack frame mapping works."
      };
      setFeedback(fb);
      addXp(80);
      setSubmitting(false);
    }, 1500);
  };

  const reset = () => { setFeedback(null); setAnswer(''); setSeconds(0); };

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto" data-testid="practice-page">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Practice · AI Graded</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">Submit. Get scored.</h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => setQIdx(i => (i - 1 + QUESTIONS.length) % QUESTIONS.length)} className="border border-white/10 rounded-md px-2.5 py-1.5 text-zinc-300 hover:bg-white/5" data-testid="prev-question">← Prev</button>
          <span className="font-mono text-zinc-500">{qIdx + 1} / {QUESTIONS.length}</span>
          <button onClick={() => setQIdx(i => (i + 1) % QUESTIONS.length)} className="border border-white/10 rounded-md px-2.5 py-1.5 text-zinc-300 hover:bg-white/5" data-testid="next-question">Next →</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Question panel */}
        <section className="border border-white/10 rounded-lg bg-zinc-900/60 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CompanyBadge companyId={q.company} size="md" />
            <div className="text-xs text-zinc-400">
              <div className="text-zinc-50 font-medium">{q.topicPath}</div>
              <div className="font-mono">{q.role} · {q.round} · {q.difficulty}</div>
            </div>
            <div className="ml-auto inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Timer size={14} /> {formatTime(seconds)}
            </div>
          </div>
          <div className="font-mono text-sm md:text-base leading-relaxed text-zinc-100">{q.body}</div>
        </section>

        {/* Answer panel */}
        <section className="border border-white/10 rounded-lg bg-zinc-900/60 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Your answer</div>
            <div className="flex items-center gap-1 border border-white/10 rounded-md p-0.5">
              <button data-testid="mode-text" onClick={() => setMode('text')} className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 ${mode === 'text' ? 'bg-white text-zinc-950' : 'text-zinc-400'}`}>
                <FileText size={12} /> Text
              </button>
              <button data-testid="mode-code" onClick={() => setMode('code')} className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 ${mode === 'code' ? 'bg-white text-zinc-950' : 'text-zinc-400'}`}>
                <Code2 size={12} /> Code
              </button>
            </div>
          </div>

          <textarea
            data-testid="answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={mode === 'code' ? SAMPLE_CODE : 'Type your answer. Be specific. Numbers and structure beat adjectives.'}
            rows={12}
            disabled={!!feedback}
            className={`w-full bg-zinc-950 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:border-white/30 transition-colors resize-y ${mode === 'code' ? 'font-mono' : ''} disabled:opacity-60`}
          />

          <div className="flex items-center gap-2 mt-4">
            {!feedback ? (
              <button data-testid="submit-answer" onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 bg-white text-zinc-950 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                {submitting ? 'Grading…' : 'Submit for AI grading'}
              </button>
            ) : (
              <button data-testid="try-again" onClick={reset} className="inline-flex items-center gap-2 bg-zinc-900 border border-white/10 px-4 py-2 rounded-md text-sm hover:bg-zinc-800 transition-colors">
                <RotateCw size={14} /> Try again
              </button>
            )}
            <div className="text-xs text-zinc-500 ml-auto font-mono">
              {answer.length} chars
            </div>
          </div>
        </section>
      </div>

      {feedback && <FeedbackPanel feedback={feedback} />}
    </div>
  );
}

const FeedbackPanel = ({ feedback }) => {
  const applyToSrs = () => toast.success(`Applied "${feedback.suggestedLabel}" to SRS. Next review in 7 days.`);
  return (
    <section className="mt-4 border border-white/10 rounded-lg bg-zinc-900/60 p-6 animate-fade-up" data-testid="feedback-panel">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Overall</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="font-mono text-5xl font-semibold tracking-tight text-zinc-50">{feedback.overall}</div>
            <div className="text-zinc-500 font-mono">/ 5</div>
          </div>
          <div className="mt-4 space-y-2">
            {feedback.dims.map(d => (
              <div key={d.name} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-300 font-mono">{d.name}</span>
                  <span className="font-mono text-zinc-400">{d.score}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.score >= 75 ? '#10b981' : d.score >= 60 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Feedback</div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200 font-mono">{feedback.text}</p>

          <div className="mt-5 border border-amber-500/30 bg-amber-500/5 rounded-md p-4 flex items-center gap-4">
            <div className="text-xs text-zinc-300">
              We suggest rating this <span className="font-mono text-amber-400">"{feedback.suggestedLabel} ({feedback.suggestedRating})"</span> in SRS.
            </div>
            <button data-testid="apply-srs" onClick={applyToSrs} className="ml-auto bg-white text-zinc-950 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-zinc-200 transition-colors">Apply to SRS</button>
          </div>
        </div>
      </div>
    </section>
  );
};
