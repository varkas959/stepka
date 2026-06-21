import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Plus, Loader2, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { COMPANIES, ROLES } from '../lib/mockData';
import { moderateText } from '../lib/api';
import { submitExperience, OUTCOMES, EXP_YEARS, ROUND_TYPES_EXP } from '../lib/experiences';
import { CreatableSelect } from './CreatableSelect';

const COMPANY_OPTS = COMPANIES.map(c => ({ id: c.id, label: c.name }));
const ROLE_OPTS = ROLES.map(r => ({ id: r, label: r }));
const OUTCOME_OPTS = OUTCOMES.map(o => ({ id: o, label: o }));
const YEAR_OPTS = EXP_YEARS.map(y => ({ id: y, label: y }));
const ROUNDTYPE_OPTS = ROUND_TYPES_EXP.map(r => ({ id: r, label: r }));

const PROFILE_OPTIONS = [
  { id: 'anonymous', label: 'Remain anonymous', desc: 'Shown as "Community member"' },
  { id: 'name',      label: 'Show my name',     desc: 'Your name appears on the report' },
];

const blankRound = () => ({ type: 'Technical', difficulty: 3, topics: '', questions: [''], notes: '' });

export const ExperienceModal = ({ open, onOpenChange, onSubmitted, userId, defaultCompany, defaultRole }) => {
  const [form, setForm] = useState({
    company: defaultCompany || 'amazon',
    role: defaultRole || 'Senior SDE',
    experienceYears: '2-5 Years',
    interviewDate: '',
    outcome: 'Selected',
    difficulty: 3,
    notes: '',
  });
  const [rounds, setRounds] = useState([blankRound()]);
  const [profile, setProfile] = useState('anonymous');
  const [contributorName, setContributorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const setRound = (i, k, v) => setRounds(rs => rs.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const setRoundQuestion = (ri, qi, v) => setRounds(rs => rs.map((r, idx) =>
    idx === ri ? { ...r, questions: r.questions.map((q, j) => j === qi ? v : q) } : r));
  const addRoundQuestion = (ri) => setRounds(rs => rs.map((r, idx) => idx === ri ? { ...r, questions: [...r.questions, ''] } : r));
  const removeRoundQuestion = (ri, qi) => setRounds(rs => rs.map((r, idx) =>
    idx === ri ? { ...r, questions: r.questions.filter((_, j) => j !== qi) } : r));
  const addRound = () => setRounds(rs => [...rs, blankRound()]);
  const removeRound = (i) => setRounds(rs => rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs);

  const submit = async (e) => {
    e.preventDefault();
    if (!userId) { window.location.href = '/signin'; return; }
    const allText = [form.notes, ...rounds.flatMap(r => [r.notes, ...(r.questions || [])])].join(' \n ').trim();
    if (allText.length < 20) { toast.error('Add at least a couple of real questions or notes.'); return; }
    setSubmitting(true);
    try {
      const { ok, flagged } = await moderateText(allText);
      if (!ok) {
        const hasPii = flagged?.some(f => f.kind === 'pii');
        const hasInj = flagged?.some(f => f.kind === 'injection');
        toast.error(
          hasPii ? 'Please remove personal data (emails, phone numbers, IDs) before submitting.'
          : hasInj ? 'Remove instruction-like text — just describe the questions you were asked.'
          : 'Submission flagged by moderation. Please revise.'
        );
        setSubmitting(false);
        return;
      }

      const companyName = COMPANIES.find(c => c.id === form.company)?.name || form.company;
      const cleanRounds = rounds.map(r => ({
        type: r.type, name: r.type,
        difficulty: Number(r.difficulty) || null,
        topics: (r.topics || '').split(',').map(t => t.trim()).filter(Boolean),
        questions: (r.questions || []).map(q => q.trim()).filter(Boolean),
        notes: r.notes?.trim() || '',
      }));

      const result = await submitExperience({
        company: companyName,
        role: form.role,
        experienceYears: form.experienceYears,
        interviewDate: form.interviewDate || null,
        outcome: form.outcome,
        difficulty: Number(form.difficulty),
        notes: form.notes.trim(),
        rounds: cleanRounds,
        showName: profile === 'name',
        contributorName: contributorName.trim(),
      }, userId);

      onSubmitted?.(result);
      onOpenChange(false);
      const bits = [];
      if (result.matchedCount > 0) bits.push(`${result.matchedCount} matched to existing questions`);
      if (result.createdCount > 0) bits.push(`${result.createdCount} new question${result.createdCount > 1 ? 's' : ''} added`);
      toast.success(
        bits.length ? `Experience added — ${bits.join(', ')}.` : 'Interview experience added. Thank you for contributing.',
        { duration: 5000 }
      );
      setRounds([blankRound()]);
      setForm(s => ({ ...s, notes: '', interviewDate: '' }));
    } catch (err) {
      toast.error(err?.message || 'Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="experience-modal" className="max-w-3xl bg-zinc-950 border border-white/10 text-zinc-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} strokeWidth={2.25} style={{ color: '#7C3AED' }} />
            <DialogTitle className="text-xl font-semibold tracking-tight">Report your interview experience</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 mt-1">
            Help thousands of candidates. Your report builds real company intelligence — rounds, questions, difficulty, and outcomes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 mt-3">
          {/* Core fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CreatableSelect label="company"    value={form.company}         options={COMPANY_OPTS}  onChange={v => set('company', v)} testid="exp-company" />
            <CreatableSelect label="role"       value={form.role}            options={ROLE_OPTS}     onChange={v => set('role', v)} testid="exp-role" />
            <CreatableSelect label="experience" value={form.experienceYears} options={YEAR_OPTS}      onChange={v => set('experienceYears', v)} testid="exp-years" />
            <CreatableSelect label="outcome"    value={form.outcome}         options={OUTCOME_OPTS}  onChange={v => set('outcome', v)} testid="exp-outcome" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">interview date</div>
              <input type="date" value={form.interviewDate} onChange={e => set('interviewDate', e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-md p-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">difficulty (1–5)</div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button type="button" key={n} onClick={() => set('difficulty', n)}
                    className={`w-9 h-9 rounded-md border font-mono text-sm transition-colors ${
                      form.difficulty === n ? 'border-purple-500/60 bg-purple-500/[0.12] text-purple-300' : 'border-white/10 text-zinc-400 hover:border-white/25'
                    }`}>{n}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Rounds */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">rounds &amp; questions ({rounds.length})</div>
              <button type="button" onClick={addRound} className="inline-flex items-center gap-1 font-mono text-xs text-purple-400 hover:text-purple-300">
                <Plus size={13} /> add round
              </button>
            </div>
            <div className="space-y-3">
              {rounds.map((r, ri) => (
                <div key={ri} className="rounded-md border border-white/8 p-3" style={{ background: '#0F1117' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[11px] text-zinc-500">Round {ri + 1}</span>
                    <div className="flex-1 max-w-[220px]">
                      <CreatableSelect label="" value={r.type} options={ROUNDTYPE_OPTS} onChange={v => setRound(ri, 'type', v)} testid={`exp-round-type-${ri}`} />
                    </div>
                    {rounds.length > 1 && (
                      <button type="button" onClick={() => removeRound(ri)} className="ml-auto text-zinc-600 hover:text-red-400"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">difficulty</span>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button type="button" key={n} onClick={() => setRound(ri, 'difficulty', n)}
                        className={`w-7 h-7 rounded border font-mono text-xs transition-colors ${
                          r.difficulty === n ? 'border-purple-500/60 bg-purple-500/[0.12] text-purple-300' : 'border-white/10 text-zinc-500 hover:border-white/25'
                        }`}>{n}</button>
                    ))}
                  </div>
                  <input value={r.topics} onChange={e => setRound(ri, 'topics', e.target.value)}
                    placeholder="topics asked (comma-separated) — e.g. Promises, React Performance, System Design"
                    className="w-full mb-2 bg-zinc-900 border border-white/10 rounded-md p-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/30" />
                  <div className="space-y-1.5">
                    {r.questions.map((q, qi) => (
                      <div key={qi} className="flex items-start gap-2">
                        <textarea value={q} onChange={e => setRoundQuestion(ri, qi, e.target.value)} rows={1}
                          placeholder={`Question ${qi + 1} you were asked…`}
                          className="flex-1 bg-zinc-900 border border-white/10 rounded-md p-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-y" />
                        {r.questions.length > 1 && (
                          <button type="button" onClick={() => removeRoundQuestion(ri, qi)} className="mt-2 text-zinc-600 hover:text-red-400"><Trash2 size={13} /></button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addRoundQuestion(ri)} className="font-mono text-[11px] text-zinc-500 hover:text-zinc-300">+ add question</button>
                  </div>
                  <input value={r.notes} onChange={e => setRound(ri, 'notes', e.target.value)}
                    placeholder="round notes (optional) — vibe, format, what they focused on"
                    className="w-full mt-2 bg-zinc-900 border border-white/10 rounded-md p-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">additional notes</div>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              placeholder="Overall experience, prep advice, timeline, anything that would help the next candidate…"
              className="w-full bg-zinc-900 border border-white/10 rounded-md p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-y" />
          </div>

          {/* Attribution */}
          <div className="rounded-md border border-white/8 p-4" style={{ background: '#0F1117' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-3">attribution</div>
            <div className="space-y-2">
              {PROFILE_OPTIONS.map(opt => (
                <label key={opt.id} className="flex items-start gap-3 cursor-pointer">
                  <div className="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                    style={{ borderColor: profile === opt.id ? '#7C3AED' : 'rgba(255,255,255,0.15)', background: profile === opt.id ? 'rgba(124,58,237,0.15)' : 'transparent' }}>
                    {profile === opt.id && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#7C3AED' }} />}
                  </div>
                  <input type="radio" name="exp-profile" checked={profile === opt.id} onChange={() => setProfile(opt.id)} className="sr-only" />
                  <div>
                    <div className="text-sm text-zinc-200 font-medium">{opt.label}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {profile === 'name' && (
              <input value={contributorName} onChange={e => setContributorName(e.target.value)} placeholder="Display name"
                className="w-full mt-3 bg-zinc-900 border border-white/10 rounded-md p-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30" />
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button type="submit" data-testid="exp-submit" disabled={submitting}
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-md text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: '#7C3AED' }}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit experience'}
            </button>
            <button type="button" onClick={() => onOpenChange(false)}
              className="font-mono text-sm px-3 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">Cancel</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
