import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Zap, FileText, Sparkles } from 'lucide-react';
import { AddQuestionModal } from './AddQuestionModal';
import { ExperienceModal } from './ExperienceModal';
import { SubmitExperienceAI } from './SubmitExperienceAI';

const MODES = [
  { id: 'paste', label: 'Paste & auto-extract', icon: Sparkles,
    desc: 'Paste a LinkedIn/Reddit post, write-up, or screenshot — AI splits it into questions.' },
  { id: 'quick', label: 'Quick question', icon: Zap,
    desc: 'Add one question you were asked. Takes 30 seconds.' },
  { id: 'full',  label: 'Full experience', icon: FileText,
    desc: 'Document your whole interview loop — rounds, outcome, questions.' },
];

// One entry point for both contribution paths. A segmented toggle picks the
// flow; the chosen form renders embedded (no nested Dialog).
export const ContributeModal = ({ open, onOpenChange, onAdded, onSubmitted, userId, defaultMode = 'quick', defaultCompany, defaultRole }) => {
  const [mode, setMode] = useState(defaultMode);
  const active = MODES.find(m => m.id === mode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="contribute-modal" className="max-w-3xl bg-zinc-950 border border-white/10 text-zinc-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">Contribute to the question bank</DialogTitle>
          <DialogDescription className="text-zinc-400 mt-1">{active.desc}</DialogDescription>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="grid grid-cols-3 gap-2 mt-3" role="tablist">
          {MODES.map(m => {
            const Icon = m.icon;
            const on = mode === m.id;
            return (
              <button
                key={m.id}
                role="tab"
                aria-selected={on}
                data-testid={`contribute-mode-${m.id}`}
                onClick={() => setMode(m.id)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-md border text-left transition-colors"
                style={on
                  ? { borderColor: 'var(--accent)', background: 'var(--accent-12)', color: 'var(--text-1)' }
                  : { borderColor: 'rgba(255,255,255,0.10)', background: 'transparent', color: 'var(--text-2)' }}
              >
                <Icon size={16} strokeWidth={2} style={{ color: on ? 'var(--accent)' : 'var(--text-3)' }} />
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chosen form (embedded — no inner Dialog) */}
        <div className="mt-1">
          {mode === 'paste' && <SubmitExperienceAI onClose={() => onOpenChange(false)} />}
          {mode === 'quick' && <AddQuestionModal embedded open onOpenChange={onOpenChange} onAdded={onAdded} userId={userId} />}
          {mode === 'full'  && <ExperienceModal embedded open onOpenChange={onOpenChange} onSubmitted={onSubmitted} userId={userId} defaultCompany={defaultCompany} defaultRole={defaultRole} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
