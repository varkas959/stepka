import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { COMPANIES, ROLES, TOPIC_TREE, DIFFICULTIES, ROUND_TYPES } from '../lib/mockData';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { moderateText } from '../lib/api';
import { saveUserQuestion } from '../lib/questions';
import { CreatableSelect } from './CreatableSelect';

const TOPIC_FLAT = TOPIC_TREE.flatMap(n => n.children
  ? n.children.map(c => ({ id: c.id, label: `${n.name} / ${c.name}` }))
  : [{ id: n.id, label: n.name }]);

const COMPANY_OPTS = COMPANIES.map(c => ({ id: c.id, label: c.name }));
const ROLE_OPTS = ROLES.map(r => ({ id: r, label: r }));
const DIFF_OPTS = DIFFICULTIES.map(d => ({ id: d, label: d }));
const ROUND_OPTS = ROUND_TYPES.map(r => ({ id: r, label: r }));
const EXP_OPTS = ['0â€“2 Years', '2â€“5 Years', '5â€“8 Years', '8â€“12 Years', '12+ Years'].map(e => ({ id: e, label: e }));
const SOURCE_OPTS = ['Community Report', 'My Interview', 'Glassdoor', 'LinkedIn', 'Other'].map(s => ({ id: s, label: s }));

const PROFILE_OPTIONS = [
  { id: 'anonymous', label: 'Remain anonymous',  desc: 'Your name and role are hidden' },
  { id: 'role',      label: 'Show my role only', desc: 'e.g. "Senior SDE, 5â€“8 years"' },
  { id: 'name',      label: 'Show my name',       desc: 'Your display name is visible' },
];

export const AddQuestionModal = ({ open, onOpenChange, onAdded, userId }) => {
  const [form, setForm] = useState({
    company: 'amazon', role: 'SDE2', topic: 'arrays',
    difficulty: 'Medium', round: 'Technical', body: '',
    experience: '2â€“5 Years', source: 'Community Report',
  });
  const [profile, setProfile] = useState('anonymous');
  const [submitting, setSubmitting] = useState(false);
  const [violations, setViolations] = useState([]);

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setViolations([]);
    if (form.body.trim().length < 30) {
      toast.error('Question needs at least 30 characters of detail.');
      return;
    }
    setSubmitting(true);
    try {
      // moderate the body + the custom fields
      const blob = [form.body, form.company, form.role, form.topic, form.round].join(' \n ');
      const { ok, flagged } = await moderateText(blob);
      if (!ok) {
        setViolations(flagged);
        setSubmitting(false);
        return;
      }
      // Build the new question object
      const topicLabel = TOPIC_FLAT.find(t => t.id === form.topic)?.label || form.topic;
      const newQuestion = {
        id: `user-${Date.now()}`,
        company: form.company,
        role: form.role,
        topic: form.topic,
        topicPath: topicLabel,
        difficulty: form.difficulty,
        round: form.round,
        body: form.body.trim(),
        experience: form.experience,
        source: form.source,
        contributorProfile: profile,
        verifyCount: 1,
        upvotes: 0,
        daysAgo: 0,
        asked: 1,
        tech: [],
        isUserSubmitted: true,
      };

      // Save to Supabase (fire and forget â€” show immediately regardless)
      saveUserQuestion(newQuestion, userId).then(saved => {
        if (saved?.id) newQuestion.id = saved.id;
      });

      onAdded?.(newQuestion);
      onOpenChange(false);
      toast.success('Question added! It\'s now live in the question bank. +40 XP', { duration: 4000 });
      setForm({ company: 'amazon', role: 'SDE2', topic: 'arrays', difficulty: 'Medium', round: 'Technical', body: '', experience: '2â€“5 Years', source: 'Community Report' });
      setProfile('anonymous');
    } catch (err) {
      toast.error(err?.response?.data?.detail || err.message || 'Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="add-question-modal" className="max-w-2xl bg-zinc-950 border border-white/10 text-zinc-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Plus size={16} strokeWidth={2.25} style={{ color: '#3B6FD4' }} />
            <DialogTitle className="text-xl font-semibold tracking-tight">Submit an interview question</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 mt-1">
            Help other engineers prep. Only submit questions you were actually asked. Pick from suggestions or type a custom value.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CreatableSelect label="company"    value={form.company}    options={COMPANY_OPTS} onChange={(v) => set('company', v)}    testid="aq-company" />
            <CreatableSelect label="role"       value={form.role}       options={ROLE_OPTS}    onChange={(v) => set('role', v)}       testid="aq-role" />
            <CreatableSelect label="experience" value={form.experience} options={EXP_OPTS}     onChange={(v) => set('experience', v)} testid="aq-experience" />
            <CreatableSelect label="source"     value={form.source}     options={SOURCE_OPTS}  onChange={(v) => set('source', v)}     testid="aq-source" />
            <CreatableSelect label="topic"      value={form.topic}      options={TOPIC_FLAT}   onChange={(v) => set('topic', v)}      testid="aq-topic" />
            <CreatableSelect label="round"      value={form.round}      options={ROUND_OPTS}   onChange={(v) => set('round', v)}      testid="aq-round" />
            <CreatableSelect label="difficulty" value={form.difficulty} options={DIFF_OPTS}    onChange={(v) => set('difficulty', v)} testid="aq-difficulty" />
          </div>

          {/* Contributor profile */}
          <div className="rounded-md border border-white/8 p-4" style={{ background: '#13161D' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-3">Your profile on this question</div>
            <div className="space-y-2">
              {PROFILE_OPTIONS.map(opt => (
                <label key={opt.id} className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      borderColor: profile === opt.id ? '#3B6FD4' : 'rgba(255,255,255,0.15)',
                      background: profile === opt.id ? 'rgba(59,111,212,0.15)' : 'transparent',
                    }}>
                    {profile === opt.id && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3B6FD4' }} />}
                  </div>
                  <input type="radio" name="profile" value={opt.id} checked={profile === opt.id}
                    onChange={() => setProfile(opt.id)} className="sr-only" />
                  <div>
                    <div className="text-sm text-zinc-200 font-medium">{opt.label}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">question body</div>
            <textarea
              data-testid="aq-body"
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              rows={6}
              placeholder="// Paste the question exactly as you were asked it. Include any context the interviewer gave you."
              className="w-full bg-zinc-900 border border-white/10 rounded-md p-3 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-y"
            />
            <div className="font-mono text-[11px] text-zinc-600 mt-1.5 flex justify-between">
              <span>// min 30 chars Â· no URLs Â· keep it interview-relevant</span>
              <span className={form.body.length < 30 ? 'text-red-400' : 'text-emerald-400'}>{form.body.length} chars</span>
            </div>
          </div>

          {violations.length > 0 && (
            <div className="rounded-md border border-red-500/40 bg-red-500/[0.06] p-3 animate-fade-up" data-testid="moderation-warning">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle size={13} className="text-red-400" />
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-400">Submission blocked by moderation</div>
              </div>
              <ul className="font-mono text-xs text-red-300 list-disc ml-5 space-y-0.5">
                {violations.map((v, i) => (
                  <li key={i}>
                    {v.kind === 'profanity' && <>contains a flagged word: <span className="text-red-200">"{v.match}"</span></>}
                    {v.kind === 'url' && <>links are not allowed: <span className="text-red-200">{v.match}</span></>}
                    {v.kind === 'adult_domain' && <>adult / unsafe domain detected: <span className="text-red-200">{v.match}</span></>}
                    {v.kind === 'pii' && <>remove personal data before submitting: <span className="text-red-200">{v.match}</span></>}
                    {v.kind === 'injection' && <>instruction-like text isn't allowed: <span className="text-red-200">"{v.match}"</span></>}
                  </li>
                ))}
              </ul>
              <div className="font-mono text-[11px] text-zinc-500 mt-2">Edit your submission and try again. We keep the bank professional.</div>
            </div>
          )}

          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.04] p-3 font-mono text-xs text-zinc-300">
            <span className="text-emerald-400">// reward</span> &nbsp;Your question goes live immediately â†’ earn +40 XP.
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button type="submit" data-testid="aq-submit" disabled={submitting}
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-md text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: '#3B6FD4' }}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Addingâ€¦' : 'Add question'}
            </button>
            <button type="button" onClick={() => onOpenChange(false)}
              className="font-mono text-sm px-3 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">Cancel</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
