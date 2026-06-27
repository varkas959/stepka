import { useEffect, useState } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { loadTrends } from '../lib/trends';

// Compact "Interview Intelligence" strip — trending skills / tech / hot topics
// from the nightly aggregation. Collapsed to one line; expand for the rest.
export const TrendsPanel = () => {
  const [trends, setTrends] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { loadTrends().then(setTrends).catch(() => {}); }, []);

  if (!trends) return null;
  const skills = trends.trending_skill || [];
  const tech   = trends.trending_tech || [];
  const topics = trends.hot_topic || [];
  if (!skills.length && !tech.length && !topics.length) return null;

  const Chip = ({ label, count }) => (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] leading-none px-2 py-1 rounded-[5px]"
      style={{ border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', color: 'var(--chip-text)' }}>
      {label}{count != null && <span style={{ color: 'var(--text-3)' }}>{count}</span>}
    </span>
  );

  const row = (title, items) => items.length > 0 && (
    <div className="flex items-start gap-2 mt-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] shrink-0 w-14 pt-1" style={{ color: 'var(--text-3)' }}>{title}</span>
      <div className="flex flex-wrap gap-1.5">{items.slice(0, 10).map((x, i) => <Chip key={i} label={x.label} count={x.count} />)}</div>
    </div>
  );

  return (
    <div className="mb-4 rounded-lg p-3" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }} data-testid="trends-panel">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2">
        <TrendingUp size={13} style={{ color: 'var(--accent)' }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-3)' }}>Interview intelligence · this month</span>
        <div className="flex flex-wrap gap-1.5 ml-1 overflow-hidden flex-1 min-w-0" style={{ maxHeight: open ? 'none' : 22 }}>
          {!open && skills.slice(0, 5).map((x, i) => <Chip key={i} label={x.label} count={x.count} />)}
        </div>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-3)' }} />
      </button>
      {open && (
        <div className="mt-1">
          {row('Skills', skills)}
          {row('Tech', tech)}
          {row('Topics', topics)}
        </div>
      )}
    </div>
  );
};
