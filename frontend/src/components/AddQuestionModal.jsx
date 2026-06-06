import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { COMPANIES, ROLES, TOPIC_TREE, DIFFICULTIES, ROUND_TYPES } from '../lib/mockData';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TOPIC_FLAT = TOPIC_TREE.flatMap(n => n.children
  ? n.children.map(c => ({ id: c.id, label: `${n.name} / ${c.name}` }))
  : [{ id: n.id, label: n.name }]);

export const AddQuestionModal = ({ open, onOpenChange }) => {
  const [form, setForm] = useState({
    company: 'amazon', role: 'SDE2', topic: 'arrays',
    difficulty: 'Medium', round: 'Technical', body: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (form.body.trim().length < 30) {
      toast.error('Question needs at least 30 characters of detail.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
      toast.success('Thanks! Your question is in review. You unlocked 10 new questions.', { duration: 4500 });
      setForm({ company: 'amazon', role: 'SDE2', topic: 'arrays', difficulty: 'Medium', round: 'Technical', body: '' });
    }, 1100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="add-question-modal" className="max-w-2xl bg-zinc-950 border border-white/10 text-zinc-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Plus size={16} className="text-amber-500" strokeWidth={2.25} />
            <DialogTitle className="text-xl font-semibold tracking-tight">Submit an interview question</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 mt-1">
            Help other engineers prep. Only submit questions you were actually asked. We'll review for quality before publishing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="company"   value={form.company}   onChange={(v) => set('company', v)}   options={COMPANIES.map(c => ({ id: c.id, label: c.name }))} testid="aq-company" />
            <Select label="role"      value={form.role}      onChange={(v) => set('role', v)}      options={ROLES.map(r => ({ id: r, label: r }))} testid="aq-role" />
            <Select label="topic"     value={form.topic}     onChange={(v) => set('topic', v)}     options={TOPIC_FLAT} testid="aq-topic" />
            <Select label="round"     value={form.round}     onChange={(v) => set('round', v)}     options={ROUND_TYPES.map(r => ({ id: r, label: r }))} testid="aq-round" />
            <Select label="difficulty" value={form.difficulty} onChange={(v) => set('difficulty', v)} options={DIFFICULTIES.map(d => ({ id: d, label: d }))} testid="aq-difficulty" />
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">question body</div>
            <textarea
              data-testid="aq-body"
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              rows={6}
              placeholder="// Paste the question exactly as you were asked it. Include any context the interviewer gave you (constraints, follow-ups, hints)."
              className="w-full bg-zinc-900 border border-white/10 rounded-md p-3 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-y"
            />
            <div className="font-mono text-[11px] text-zinc-600 mt-1.5 flex justify-between">
              <span>// min 30 chars · be specific</span>
              <span className={form.body.length < 30 ? 'text-red-400' : 'text-emerald-400'}>{form.body.length} chars</span>
            </div>
          </div>

          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.04] p-3 font-mono text-xs text-zinc-300">
            <span className="text-emerald-400">// reward</span> &nbsp;Submit one verified question → unlock 10 new questions and +40 XP.
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button type="submit" data-testid="aq-submit" disabled={submitting}
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-md text-zinc-950 hover:brightness-110 transition-all disabled:opacity-50"
              style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 24px -8px rgba(245,158,11,0.6)' }}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
            <button type="button" onClick={() => onOpenChange(false)}
              className="font-mono text-sm px-3 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">Cancel</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Select = ({ label, value, onChange, options, testid }) => (
  <label className="block">
    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">{label}</div>
    <select data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-white/30">
      {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </label>
);
