import { useMemo, useState } from 'react';
import { ChevronRight, Search, ThumbsUp, BadgeCheck, MessageSquarePlus, X, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { QUESTIONS, COMPANIES, ROLES, TOPIC_TREE, DIFFICULTIES, ROUND_TYPES, COMPANY_BLUEPRINTS } from '../lib/mockData';
import { CompanyBadge } from '../components/CompanyBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';

const ALL = '__all';

// Flatten topic tree to {id,label} options
const TOPIC_OPTIONS = TOPIC_TREE.flatMap(n => n.children
  ? n.children.map(c => ({ id: c.id, label: `${n.name} / ${c.name}`, group: n.name }))
  : [{ id: n.id, label: n.name }]
);

const COMPANY_OPTIONS = COMPANIES.map(c => ({ id: c.id, label: c.name }));
const ROLE_OPTIONS = ROLES.map(r => ({ id: r, label: r }));
const DIFFICULTY_OPTIONS = DIFFICULTIES.map(d => ({ id: d, label: d }));
const ROUND_OPTIONS = ROUND_TYPES.map(r => ({ id: r, label: r }));

const FILTER_DEFS = [
  { key: 'company',    label: 'Company',    options: COMPANY_OPTIONS },
  { key: 'role',       label: 'Role',       options: ROLE_OPTIONS },
  { key: 'topic',      label: 'Topic',      options: TOPIC_OPTIONS, grouped: true },
  { key: 'difficulty', label: 'Difficulty', options: DIFFICULTY_OPTIONS },
  { key: 'round',      label: 'Round',      options: ROUND_OPTIONS },
];

export default function QuestionBank() {
  const [filters, setFilters] = useState({ company: ALL, role: ALL, topic: ALL, difficulty: ALL, round: ALL });
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [askedMap, setAskedMap] = useState({});
  const [upvoteMap, setUpvoteMap] = useState({});
  const [blueprintCompany, setBlueprintCompany] = useState(null);

  const filtered = useMemo(() => QUESTIONS.filter(q => {
    if (filters.company !== ALL && q.company !== filters.company) return false;
    if (filters.role !== ALL && q.role !== filters.role) return false;
    if (filters.topic !== ALL && q.topic !== filters.topic) return false;
    if (filters.difficulty !== ALL && q.difficulty !== filters.difficulty) return false;
    if (filters.round !== ALL && q.round !== filters.round) return false;
    if (search && !q.body.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [filters, search]);

  const setF = (k, v) => setFilters(s => ({ ...s, [k]: v }));
  const clearOne = (k) => setFilters(s => ({ ...s, [k]: ALL }));
  const clearAll = () => setFilters({ company: ALL, role: ALL, topic: ALL, difficulty: ALL, round: ALL });

  const activeChips = FILTER_DEFS
    .map(def => {
      const val = filters[def.key];
      if (val === ALL) return null;
      const opt = def.options.find(o => o.id === val);
      return { key: def.key, id: val, label: opt?.label ?? val };
    })
    .filter(Boolean);

  const handleAsked = (q) => {
    setAskedMap(m => ({ ...m, [q.id]: true }));
    toast.success(`Thanks! You've unlocked 10 new questions`, { description: 'Your contribution helps signal-rank this question.' });
  };
  const handleUpvote = (q) => setUpvoteMap(m => ({ ...m, [q.id]: !m[q.id] }));

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-[1200px] mx-auto">
      {/* Heading */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Question Bank</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">Real interview questions</h1>
        <p className="text-zinc-400 mt-2 text-sm max-w-xl">Browse {QUESTIONS.length} verified questions from engineers at top companies. Filter, tag what you've been asked, and we'll bias your study plan.</p>
      </div>

      {/* Filter bar */}
      <div className="mb-3 flex items-stretch gap-2 overflow-x-auto pb-1 scrollbar-thin md:overflow-visible" data-testid="filter-bar">
        <div className="relative shrink-0 w-full max-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            data-testid="question-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full bg-zinc-900 border border-white/10 rounded-md pl-9 pr-3 py-1.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors font-mono"
          />
        </div>

        {FILTER_DEFS.map(def => (
          <FilterDropdown
            key={def.key}
            def={def}
            value={filters[def.key]}
            onChange={(v) => setF(def.key, v)}
          />
        ))}

        <div className="hidden md:flex items-center ml-auto text-xs text-zinc-500 font-mono shrink-0">
          <span className="text-zinc-300">{filtered.length}</span>
          <span>&nbsp;/ {QUESTIONS.length}</span>
        </div>
      </div>

      {/* Active chips row */}
      {activeChips.length > 0 && (
        <div className="mb-5 flex items-center gap-2 flex-wrap text-xs animate-fade-up" data-testid="active-chips">
          <span className="text-zinc-500 font-mono">Showing:</span>
          {activeChips.map((c, i) => (
            <span key={c.key + c.id} className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/15 text-zinc-100 rounded-md pl-2 pr-1 py-1 font-mono"
                  data-testid={`active-chip-${c.key}`}>
              {c.label}
              <button onClick={() => clearOne(c.key)} className="text-zinc-400 hover:text-zinc-50 hover:bg-white/10 rounded p-0.5"
                      data-testid={`chip-clear-${c.key}`} aria-label={`Remove ${c.label}`}>
                <X size={12} />
              </button>
              {i < activeChips.length - 1 && <span className="text-zinc-700 ml-1">|</span>}
            </span>
          ))}
          <button onClick={clearAll} data-testid="clear-filters" className="ml-1 text-zinc-400 hover:text-zinc-50 underline-offset-2 hover:underline font-mono">
            Clear all
          </button>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-3" data-testid="question-feed">
        {filtered.length === 0 && (
          <div className="border border-white/10 rounded-md p-10 text-center text-zinc-400">No questions match your filters.</div>
        )}
        {filtered.map(q => {
          const isExpanded = expandedId === q.id;
          const isVerified = q.verifyCount >= 3;
          const company = COMPANIES.find(c => c.id === q.company);
          const upvoted = upvoteMap[q.id];
          const asked = askedMap[q.id];
          return (
            <article key={q.id} data-testid={`question-card-${q.id}`}
              className="border border-white/10 rounded-lg bg-zinc-900 hover:bg-zinc-900/80 hover:border-white/20 transition-colors animate-fade-up shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_-12px_rgba(0,0,0,0.6)]">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <button onClick={() => setBlueprintCompany(q.company)} data-testid={`open-blueprint-${q.company}`}>
                    <CompanyBadge companyId={q.company} size="md" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-zinc-400">
                      <span className="text-zinc-50 font-medium">{company?.name}</span>
                      <ChevronRight size={12} className="text-zinc-600" />
                      <span>{q.role}</span>
                      <ChevronRight size={12} className="text-zinc-600" />
                      <span className="font-mono">{q.topicPath}</span>
                      <span className={`ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        q.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                        : q.difficulty === 'Medium' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5'
                        : 'border-red-500/30 text-red-400 bg-red-500/5'
                      }`}>{q.difficulty}</span>
                    </div>

                    <p className={`mt-3 text-sm leading-relaxed font-mono text-zinc-200 ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {q.body}
                    </p>
                    {q.body.length > 180 && (
                      <button onClick={() => setExpandedId(isExpanded ? null : q.id)} className="text-xs text-zinc-400 hover:text-zinc-50 mt-2" data-testid={`expand-${q.id}`}>
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}

                    <div className="flex items-center flex-wrap gap-3 mt-4 text-xs text-zinc-500">
                      <span className="font-mono">Reported {q.daysAgo}d ago</span>
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <BadgeCheck size={12} /> verified
                        </span>
                      )}
                      <span className="font-mono">{q.round}</span>
                      <span className="font-mono ml-auto">{q.asked + (asked ? 1 : 0)} engineers asked this</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <button
                    data-testid={`upvote-${q.id}`}
                    onClick={() => handleUpvote(q)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-colors ${
                      upvoted ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/10 hover:bg-white/5 text-zinc-300'
                    }`}
                  >
                    <ThumbsUp size={12} /> <span className="font-mono">{q.upvotes + (upvoted ? 1 : 0)}</span>
                  </button>
                  <button
                    data-testid={`asked-${q.id}`}
                    onClick={() => handleAsked(q)}
                    disabled={asked}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors ${
                      asked ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                            : 'bg-white text-zinc-950 hover:bg-zinc-200'
                    }`}
                  >
                    <MessageSquarePlus size={12} />
                    {asked ? 'Marked' : 'I was asked this'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <BlueprintModal companyId={blueprintCompany} onClose={() => setBlueprintCompany(null)} />
    </div>
  );
}

const FilterDropdown = ({ def, value, onChange }) => {
  const active = value !== ALL;
  const opt = def.options.find(o => o.id === value);

  // For grouped (topic), group items under their group label
  const grouped = def.grouped
    ? def.options.reduce((acc, o) => {
        const g = o.group || 'Other';
        (acc[g] ||= []).push(o);
        return acc;
      }, {})
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-testid={`filter-trigger-${def.key}`}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors whitespace-nowrap ${
            active
              ? 'bg-white/[0.07] border-white/20 text-zinc-50'
              : 'bg-zinc-900 border-white/10 text-zinc-300 hover:bg-zinc-900/80 hover:border-white/20'
          }`}
        >
          <span className="text-zinc-500">{def.label}</span>
          {active && <span className="text-zinc-50 font-medium">· {opt?.label}</span>}
          <ChevronDown size={14} className={`transition-transform ${active ? 'text-zinc-300' : 'text-zinc-500'}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[220px] max-h-[60vh] overflow-y-auto bg-zinc-950 border border-white/10 text-zinc-50">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.14em] text-zinc-600 font-medium">
          {def.label}
        </DropdownMenuLabel>
        <DropdownMenuItem
          data-testid={`filter-option-${def.key}-all`}
          onSelect={() => onChange(ALL)}
          className={`cursor-pointer ${value === ALL ? 'bg-white/[0.06] text-zinc-50' : 'text-zinc-300'}`}
        >
          <span className="flex-1">All</span>
          {value === ALL && <Check size={14} className="text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5" />

        {!grouped && def.options.map(o => (
          <DropdownMenuItem
            key={o.id}
            data-testid={`filter-option-${def.key}-${o.id}`}
            onSelect={() => onChange(o.id)}
            className={`cursor-pointer ${value === o.id ? 'bg-white/[0.06] text-zinc-50' : 'text-zinc-300'}`}
          >
            {def.key === 'company' && <CompanyBadge companyId={o.id} size="sm" testIdPrefix={`opt-badge-${def.key}`} />}
            <span className="flex-1">{o.label}</span>
            {value === o.id && <Check size={14} className="text-emerald-400" />}
          </DropdownMenuItem>
        ))}

        {grouped && Object.entries(grouped).map(([g, items]) => (
          <div key={g}>
            <div className="px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-600">{g}</div>
            {items.map(o => (
              <DropdownMenuItem
                key={o.id}
                data-testid={`filter-option-${def.key}-${o.id}`}
                onSelect={() => onChange(o.id)}
                className={`cursor-pointer ${value === o.id ? 'bg-white/[0.06] text-zinc-50' : 'text-zinc-300'}`}
              >
                <span className="flex-1">{o.label.includes('/') ? o.label.split(' / ')[1] : o.label}</span>
                {value === o.id && <Check size={14} className="text-emerald-400" />}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const BlueprintModal = ({ companyId, onClose }) => {
  if (!companyId) return null;
  const bp = COMPANY_BLUEPRINTS[companyId];
  const company = COMPANIES.find(c => c.id === companyId);
  if (!bp) return null;
  const maxCount = Math.max(...bp.heatmap.map(h => h.count));

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-testid="blueprint-modal" className="max-w-2xl bg-zinc-950 border border-white/10 text-zinc-50">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <CompanyBadge companyId={companyId} size="lg" testIdPrefix="blueprint-badge" />
            <div>
              <DialogTitle className="text-2xl font-semibold tracking-tight">{company.name} Interview Blueprint</DialogTitle>
              <DialogDescription className="text-zinc-400 mt-1">Structure, common rounds, and topic frequency from recent loops.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono mb-3">Interview Rounds</div>
            <div className="space-y-1.5">
              {bp.rounds.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="font-mono text-xs text-zinc-500 w-6">{(i + 1).toString().padStart(2, '0')}</div>
                  <div className="text-zinc-200">{r}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono mb-3">Topic Frequency</div>
            <div className="space-y-2">
              {bp.heatmap.map(h => (
                <div key={h.topic} className="flex items-center gap-3 text-xs">
                  <div className="w-32 text-zinc-300 font-mono truncate">{h.topic}</div>
                  <div className="flex-1 h-2 rounded-sm bg-white/5 overflow-hidden">
                    <div className="h-full rounded-sm transition-all" style={{ width: `${(h.count / maxCount) * 100}%`, background: company.color }} />
                  </div>
                  <div className="w-8 text-right font-mono text-zinc-400">{h.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono mb-3">Common Question Types</div>
            <div className="flex flex-wrap gap-1.5">
              {bp.questionTypes.map(t => (
                <span key={t} className="font-mono text-xs px-2 py-1 rounded border border-white/10 bg-white/5 text-zinc-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
