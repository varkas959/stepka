import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Loader2, Send, Check, X, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { depthProbe } from '../lib/api';
import { DEPTH_LEVELS, depthScore, depthColor, describeDepth } from '../lib/depthIntelligence';

// "Challenge My Understanding" — walks one skill down the 5-level depth ladder,
// escalating only while answers hold up, and records the deepest level passed.
export const DepthChallenge = ({ open, onOpenChange, skill, company, role, onComplete }) => {
  const [transcript, setTranscript] = useState([]);
  const [current, setCurrent] = useState(null);     // { level, question }
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [deepest, setDeepest] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null); // { passed, text }
  const [result, setResult] = useState(null);       // { deepest, verdict, weakness }
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTranscript([]); setAnswer(''); setDeepest(0); setLastFeedback(null); setResult(null); setCurrent(null);
    setLoading(true);
    depthProbe({ company, role, skill, transcript: [] })
      .then(r => setCurrent({ level: r.nextLevel, question: r.nextQuestion }))
      .catch(() => toast.error('Could not start the challenge. Try again.'))
      .finally(() => setLoading(false));
  }, [open, skill, company, role]);

  const submit = async () => {
    if (!answer.trim() || loading || !current) return;
    const t = [...transcript, { q: current.question, a: answer.trim(), level: current.level }];
    setTranscript(t); setAnswer(''); setLoading(true);
    try {
      const r = await depthProbe({ company, role, skill, transcript: t });
      setDeepest(r.deepestPassed);
      setLastFeedback({ passed: r.lastAnswerPassed, text: r.feedback });
      if (r.done) { setResult({ deepest: r.deepestPassed, verdict: r.verdict, weakness: r.weakness }); setCurrent(null); }
      else { setCurrent({ level: r.nextLevel, question: r.nextQuestion }); }
    } catch {
      toast.error('Probe failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const finish = () => { onComplete?.(result?.deepest ?? deepest); onOpenChange(false); };
  const score = depthScore(result ? result.deepest : deepest);
  const { strength, weakness } = describeDepth(skill, result ? result.deepest : deepest);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="depth-challenge" className="max-w-xl bg-zinc-950 border border-white/10 text-zinc-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">Challenge my understanding · {skill}</DialogTitle>
          <DialogDescription className="text-zinc-400 mt-1">
            One question at a time, each level deeper. We stop when you can't go further — and record how deep you got.
          </DialogDescription>
        </DialogHeader>

        {/* Depth ladder */}
        <div className="flex items-stretch gap-1.5 mt-3 mb-1">
          {DEPTH_LEVELS.map(l => {
            const passed = (result ? result.deepest : deepest) >= l.level;
            const active = current?.level === l.level;
            return (
              <div key={l.level} className="flex-1 text-center">
                <div className="h-1.5 rounded-full mb-1.5 transition-colors"
                  style={{ background: passed ? 'var(--diff-easy)' : active ? 'var(--accent)' : 'var(--border-2)' }} />
                <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: passed ? 'var(--diff-easy)' : active ? 'var(--accent)' : 'var(--text-3)' }}>
                  {l.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Last-answer feedback */}
        {lastFeedback && (
          <div className="flex items-start gap-2 text-sm mt-2 rounded-md px-3 py-2"
            style={{ background: lastFeedback.passed ? 'rgba(34,197,94,0.06)' : 'rgba(225,128,128,0.06)' }}>
            {lastFeedback.passed
              ? <Check size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--diff-easy)' }} />
              : <X size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--diff-hard)' }} />}
            <span style={{ color: 'var(--text-2)' }}>{lastFeedback.text}</span>
          </div>
        )}

        {/* Active question */}
        {current && !result && (
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>
              Level {current.level} · {DEPTH_LEVELS.find(l => l.level === current.level)?.name}
            </div>
            <p className="text-[15px] font-medium leading-snug mb-3" style={{ color: 'var(--text-1)' }}>{current.question}</p>
            <textarea
              ref={inputRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
              rows={4}
              placeholder="Answer in your own words — explain it, don't just name it…"
              className="w-full bg-zinc-900 border border-white/10 rounded-md p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-y"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>⌘/Ctrl + Enter to submit</span>
              <button onClick={submit} disabled={loading || !answer.trim()}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-md text-white disabled:opacity-50"
                style={{ background: 'var(--accent)' }}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Answer
              </button>
            </div>
          </div>
        )}

        {loading && !current && !result && (
          <div className="flex items-center gap-2 text-sm py-6" style={{ color: 'var(--text-3)' }}>
            <Loader2 size={14} className="animate-spin" /> Preparing the first question…
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-4">
            <div className="flex items-center gap-4 rounded-xl p-4 mb-4" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="text-center shrink-0">
                <div className="font-mono text-4xl font-bold leading-none" style={{ color: depthColor(score) }}>{score}<span className="text-lg">%</span></div>
                <div className="font-mono text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-3)' }}>Depth</div>
              </div>
              <div className="text-sm">
                <div className="font-medium mb-1" style={{ color: 'var(--text-1)' }}>
                  Reached <span style={{ color: depthColor(score) }}>Level {result.deepest}</span> of 5
                  {result.deepest < 5 && <span style={{ color: 'var(--text-3)' }}> — depth floor</span>}
                </div>
                {result.verdict && <div style={{ color: 'var(--text-2)' }}>{result.verdict}</div>}
              </div>
            </div>

            <div className="space-y-2.5 text-sm mb-4">
              {strength && <div className="flex items-start gap-2" style={{ color: 'var(--text-2)' }}><Check size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--diff-easy)' }} /><span><b style={{ color: 'var(--text-1)' }}>Strength.</b> {strength}</span></div>}
              {weakness && <div className="flex items-start gap-2" style={{ color: 'var(--text-2)' }}><ArrowDown size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--diff-hard)' }} /><span><b style={{ color: 'var(--text-1)' }}>Where you stop.</b> {weakness}</span></div>}
            </div>

            <button onClick={finish} className="w-full text-sm font-semibold px-4 py-2.5 rounded-md text-white" style={{ background: 'var(--accent)' }}>
              Save depth score
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
