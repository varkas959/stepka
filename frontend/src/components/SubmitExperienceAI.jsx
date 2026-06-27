import { useState, useRef } from 'react';
import { Loader2, Sparkles, Upload, Check, CornerDownRight } from 'lucide-react';
import { toast } from 'sonner';
import { extractInterview } from '../lib/pipeline';

const SOURCES = [
  { id: 'text',     label: 'Text' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'reddit',   label: 'Reddit' },
  { id: 'manual',   label: 'Manual' },
];

const diffColor = d => d === 'Hard' ? 'var(--diff-hard)' : d === 'Easy' ? 'var(--diff-easy)' : 'var(--diff-medium)';

// On-device OCR (self-hosted engine — see public/tesseract). No upload, no LLM cost.
const MAX_SHOTS = 3;

export const SubmitExperienceAI = ({ onClose }) => {
  const [source, setSource] = useState('text');
  const [raw, setRaw] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [shots, setShots] = useState(0);
  const fileRef = useRef(null);

  const runOcr = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const take = files.slice(0, MAX_SHOTS - shots);
    if (!take.length) { toast.error(`Up to ${MAX_SHOTS} screenshots.`); return; }
    if (take.some(f => f.size > 6 * 1024 * 1024)) { toast.error('Each image under 6 MB.'); return; }
    setOcrBusy(true); setOcrProgress(0);
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, {
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract/tesseract-core-simd-lstm.wasm.js',
        langPath: '/tesseract', workerBlobURL: false,
        logger: m => { if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100)); },
      });
      let text = '';
      for (const f of take) { const { data } = await worker.recognize(f); text += (data?.text || '') + '\n\n'; }
      await worker.terminate();
      const clean = text.replace(/\n{3,}/g, '\n\n').trim();
      if (clean.length < 40) toast.error('Could not read enough text — try a sharper screenshot.');
      else { setRaw(prev => (prev ? prev.trim() + '\n\n' : '') + clean); setShots(s => s + take.length); setSource('screenshot_ocr'); }
    } catch (err) { console.error('[OCR]', err); toast.error('Could not read the image. Paste the text instead.'); }
    finally { setOcrBusy(false); }
  };

  const extract = async () => {
    if (raw.trim().length < 40) { toast.error('Paste a bit more of the interview experience.'); return; }
    setBusy(true);
    try {
      const r = await extractInterview({ rawText: raw, sourceType: source, sourceMeta: {} });
      setResult(r);
      toast.success(`Extracted ${r.count} question${r.count === 1 ? '' : 's'} — saved as a draft for review.`);
    } catch (e) { toast.error(e.message || 'Extraction failed.'); }
    finally { setBusy(false); }
  };

  if (result) {
    const m = result.metadata || {};
    return (
      <div className="mt-3">
        <div className="flex items-center gap-2 text-sm mb-3">
          <Check size={15} style={{ color: 'var(--diff-easy)' }} />
          <span style={{ color: 'var(--text-2)' }}>Extracted and saved as a <b style={{ color: 'var(--text-1)' }}>draft</b> — it enters the review queue, not the live bank yet.</span>
        </div>
        {(m.company || m.role || m.experience || m.outcome) && (
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-[12px] mb-4" style={{ color: 'var(--text-3)' }}>
            {m.company && <span style={{ color: 'var(--text-2)' }}>{m.company}</span>}
            {m.role && <><span>·</span><span>{m.role}</span></>}
            {m.experience && <><span>·</span><span>{m.experience}</span></>}
            {m.outcome && <><span>·</span><span>{m.outcome}</span></>}
          </div>
        )}
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {result.questions.map((q, i) => (
            <div key={i} className="py-3 flex items-start gap-2.5">
              {q.followUp && <CornerDownRight size={13} className="shrink-0 mt-1" style={{ color: 'var(--text-3)' }} />}
              <div className="min-w-0">
                <p className="text-[14px] leading-snug mb-1.5" style={{ color: 'var(--text-1)' }}>{q.body}</p>
                <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-[11px]" style={{ color: 'var(--text-3)' }}>
                  <span>{q.round}</span><span>·</span><span>{q.topic}</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium"
                    style={{ border: `1px solid ${diffColor(q.difficulty)}55`, color: diffColor(q.difficulty) }}>{q.difficulty}</span>
                  {q.category && <span>· {q.category}</span>}
                  {typeof q.confidence === 'number' && <span>· {Math.round(q.confidence * 100)}% conf</span>}
                </div>
                {q.duplicate && q.duplicate.similarity >= 0.8 && (
                  <div className="mt-1.5 text-[11px] rounded px-2 py-1 leading-snug"
                    style={{ background: 'rgba(217,162,74,0.08)', border: '1px solid rgba(217,162,74,0.25)', color: 'var(--diff-medium)' }}>
                    Likely duplicate · {Math.round(q.duplicate.similarity * 100)}% — “{q.duplicate.body.length > 90 ? q.duplicate.body.slice(0, 89) + '…' : q.duplicate.body}”
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-5">
          <button onClick={() => { setResult(null); setRaw(''); setShots(0); }}
            className="text-sm font-semibold px-4 py-2 rounded-md text-white" style={{ background: 'var(--accent)' }}>
            Submit another
          </button>
          <button onClick={() => onClose?.()} className="text-sm px-3 py-2 rounded-md border" style={{ borderColor: 'var(--border-2)', color: 'var(--text-2)' }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* Source */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {SOURCES.map(s => {
          const on = source === s.id || (s.id === 'text' && source === 'screenshot_ocr');
          return (
            <button key={s.id} onClick={() => setSource(s.id)}
              className="font-mono text-xs px-2.5 py-1 rounded-md border transition-colors"
              style={on ? { borderColor: 'var(--accent)', background: 'var(--accent-12)', color: 'var(--text-1)' }
                        : { borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-3)' }}>
              {s.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={raw} onChange={e => setRaw(e.target.value)} rows={9}
        placeholder={"Paste the whole interview experience — a LinkedIn/Reddit post, your own write-up, or a screenshot's text.\n\nAI splits it into individual questions with topic, difficulty and skills."}
        className="w-full rounded-md p-3 text-sm leading-relaxed resize-y focus:outline-none"
        style={{ border: '1px solid var(--border)', background: 'var(--inset)', color: 'var(--text-1)' }} />

      <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={runOcr} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={ocrBusy || shots >= MAX_SHOTS}
            className="inline-flex items-center gap-2 font-mono text-xs px-3 py-2 rounded-md border transition-colors hover:bg-white/[0.04] disabled:opacity-50"
            style={{ borderColor: 'var(--border-2)', color: 'var(--text-2)' }}>
            {ocrBusy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {ocrBusy ? `Reading… ${ocrProgress}%` : 'Screenshot'}
          </button>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>{raw.length} chars</span>
        </div>
        <button onClick={extract} disabled={busy || raw.trim().length < 40}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-md text-white disabled:opacity-50"
          style={{ background: 'var(--accent)' }}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {busy ? 'Extracting…' : 'Extract with AI'}
        </button>
      </div>
    </div>
  );
};
