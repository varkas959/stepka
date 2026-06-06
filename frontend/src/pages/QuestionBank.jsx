import { useMemo, useState } from 'react';
import { Plus, X, ChevronDown, ArrowUp, DollarSign, Check, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { QUESTIONS, COMPANIES, ROLES, TOPIC_TREE, DIFFICULTIES, ROUND_TYPES, COMPANY_BLUEPRINTS } from '../lib/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { PixelBar } from '../components/PixelBar';

const ALL = '__all';
const SORTS = [
  { id: 'recent',    label: 'recent' },
  { id: 'popular',   label: 'popular' },
  { id: 'asked',     label: 'most asked' },
];

const TOPIC_OPTIONS = TOPIC_TREE.flatMap(n => n.children
  ? n.children.map(c => ({ id: c.id, label: c.name, group: n.name }))
  : [{ id: n.id, label: n.name }]);

const FILTER_DEFS = [
  { key: 'company',    label: 'company',    options: COMPANIES.map(c => ({ id: c.id, label: c.name.toLowerCase() })) },
  { key: 'role',       label: 'role',       options: ROLES.map(r => ({ id: r, label: r.toLowerCase() })) },
  { key: 'topic',      label: 'topic',      options: TOPIC_OPTIONS, grouped: true },
  { key: 'difficulty', label: 'difficulty', options: DIFFICULTIES.map(d => ({ id: d, label: d.toLowerCase() })) },
  { key: 'round',      label: 'round',      options: ROUND_TYPES.map(r => ({ id: r, label: r.toLowerCase() })) },
];

// Accent color per question (left edge)
const accentForQ = (q) => {
  if (q.difficulty === 'Hard') return '#ef4444';
  if (q.difficulty === 'Easy') return '#22c55e';
  return '#f59e0b';
};

export default function QuestionBank() {
  const [filters, setFilters] = useState({ company: ALL, role: ALL, topic: ALL, difficulty: ALL, round: ALL });
  const [sortBy, setSortBy] = useState('recent');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [askedMap, setAskedMap] = useState({});
  const [upvoteMap, setUpvoteMap] = useState({});
  const [blueprintCompany, setBlueprintCompany] = useState(null);

  const filtered = useMemo(() => {
    let list = QUESTIONS.filter(q => {
      if (filters.company !== ALL && q.company !== filters.company) return false;
      if (filters.role !== ALL && q.role !== filters.role) return false;
      if (filters.topic !== ALL && q.topic !== filters.topic) return false;
      if (filters.difficulty !== ALL && q.difficulty !== filters.difficulty) return false;
      if (filters.round !== ALL && q.round !== filters.round) return false;
      if (search && !q.body.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortBy === 'popular') list = [...list].sort((a, b) => b.upvotes - a.upvotes);
    if (sortBy === 'asked')   list = [...list].sort((a, b) => b.asked - a.asked);
    if (sortBy === 'recent')  list = [...list].sort((a, b) => a.daysAgo - b.daysAgo);
    return list;
  }, [filters, search, sortBy]);

  const setF = (k, v) => setFilters(s => ({ ...s, [k]: v }));
  const clearOne = (k) => setFilters(s => ({ ...s, [k]: ALL }));

  const handleAsked = (q) => {
    setAskedMap(m => ({ ...m, [q.id]: true }));
    toast.success(`Thanks! You've unlocked 10 new questions`);
  };
  const handleUpvote = (q) => setUpvoteMap(m => ({ ...m, [q.id]: !m[q.id] }));

  const breadcrumbParts = [
    filters.company !== ALL ? filters.company : null,
    filters.role !== ALL ? filters.role.toLowerCase() : null,
  ].filter(Boolean);
  const breadcrumbPath = breadcrumbParts.length ? breadcrumbParts.join('-') : 'all';

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <div className="font-mono text-sm text-zinc-600 mb-4" data-testid="breadcrumb">
        <span className="text-emerald-400">~</span>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-400">{breadcrumbPath}</span>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-200">question-bank</span>
      </div>

      {/* Heading + Add Question */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-50">Real interview questions</h1>
          <p className="text-zinc-400 mt-3 text-base max-w-xl leading-relaxed">
            Browse <span className="text-zinc-200 font-medium">{QUESTIONS.length} verified questions</span> from engineers at top companies. Tag what you've been asked.
          </p>
        </div>
        <button
          data-testid="add-question"
          onClick={() => toast('Submission flow coming soon — drop us a note in the meantime.')}
          className="shrink-0 inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 hover:border-white/20 text-zinc-100 transition-colors"
        >
          <Plus size={14} strokeWidth={2.25} /> Add Question
        </button>
      </div>

      {/* CLI search */}
      <div className="mb-3 border border-white/10 bg-zinc-950 rounded-md px-4 py-3.5 flex items-center gap-2 focus-within:border-emerald-500/40 transition-colors">
        <span className="font-mono text-emerald-400 text-base select-none">&gt;</span>
        <input
          data-testid="question-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`search ${filters.company !== ALL ? filters.company : 'amazon'} questions_`}
          className="flex-1 bg-transparent border-0 outline-none font-mono text-sm text-zinc-100 placeholder:text-zinc-600"
        />
        {!search && <span className="font-mono text-emerald-400 animate-pulse-soft text-base hidden">_</span>}
      </div>

      {/* CLI-style filter chip row */}
      <div className="flex items-center gap-2 flex-wrap mb-6" data-testid="filter-row">
        {FILTER_DEFS.map(def => (
          <FilterChip key={def.key} def={def} value={filters[def.key]} onChange={(v) => setF(def.key, v)} onClear={() => clearOne(def.key)} />
        ))}
        <SortChip value={sortBy} onChange={setSortBy} />
      </div>

      {/* Count */}
      <div className="font-mono text-sm mb-4">
        <span className="text-zinc-50 font-semibold">{filtered.length}</span>
        <span className="text-zinc-500"> of {QUESTIONS.length} questions</span>
      </div>

      {/* Cards */}
      <div className="space-y-4" data-testid="question-feed">
        {filtered.length === 0 && (
          <div className="border border-white/10 rounded-md p-10 text-center text-zinc-400 font-mono text-sm">// no questions match your filters</div>
        )}
        {filtered.map(q => (
          <QuestionCard
            key={q.id}
            q={q}
            expanded={expandedId === q.id}
            onToggleExpand={() => setExpandedId(expandedId === q.id ? null : q.id)}
            upvoted={!!upvoteMap[q.id]}
            asked={!!askedMap[q.id]}
            onUpvote={() => handleUpvote(q)}
            onAsked={() => handleAsked(q)}
            onCompanyClick={() => setBlueprintCompany(q.company)}
          />
        ))}
      </div>

      {/* Submit CTA */}
      <button
        data-testid="submit-unlock"
        onClick={() => toast('Submission flow coming soon.')}
        className="w-full text-left mt-6 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] bg-zinc-950 rounded-md p-5 flex items-center gap-4 transition-colors group"
      >
        <Plus size={18} className="text-emerald-400 shrink-0" strokeWidth={2.25} />
        <div className="flex-1 font-mono text-sm text-zinc-400">
          Been interviewed recently? Submit a question and unlock <span className="text-zinc-100 font-semibold">10 more</span>.
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400 inline-flex items-center gap-1 shrink-0">
          submit <ArrowUpRight size={14} strokeWidth={2.25} />
          <span className="hidden sm:inline">· unlock</span>
        </span>
      </button>

      <BlueprintModal companyId={blueprintCompany} onClose={() => setBlueprintCompany(null)} />
    </div>
  );
}

// ───────────────────── Filter chips ─────────────────────
const FilterChip = ({ def, value, onChange, onClear }) => {
  const active = value !== ALL;
  const opt = def.options.find(o => o.id === value);
  const label = opt ? opt.label : def.label;
  const grouped = def.grouped
    ? def.options.reduce((acc, o) => { (acc[o.group || 'Other'] ||= []).push(o); return acc; }, {})
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-testid={`filter-chip-${def.key}`}
          className={`group inline-flex items-center gap-1.5 font-mono text-sm px-3 py-1.5 rounded-md border transition-colors ${
            active
              ? 'border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-400'
              : 'border-white/10 bg-transparent text-zinc-500 hover:border-white/25 hover:text-zinc-300'
          }`}
        >
          {!active && <span className="opacity-80">+</span>}
          <span className={active ? '' : 'lowercase'}>{label}</span>
          {active ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClear(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); e.preventDefault(); onClear(); } }}
              className="ml-0.5 -mr-0.5 p-0.5 rounded hover:bg-emerald-500/15 cursor-pointer"
              data-testid={`chip-clear-${def.key}`}
              aria-label={`Remove ${label}`}
            >
              <X size={12} strokeWidth={2.5} />
            </span>
          ) : (
            <ChevronDown size={12} className="text-zinc-600" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px] max-h-[60vh] overflow-y-auto bg-zinc-950 border border-white/10 text-zinc-50">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.14em] text-zinc-600 font-medium font-mono">{def.label}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        {!grouped && def.options.map(o => (
          <DropdownMenuItem key={o.id} data-testid={`filter-option-${def.key}-${o.id}`}
            onSelect={() => onChange(o.id)}
            className={`cursor-pointer font-mono text-sm ${value === o.id ? 'bg-emerald-500/[0.08] text-emerald-400' : 'text-zinc-300'}`}>
            <span className="flex-1">{o.label}</span>
            {value === o.id && <Check size={14} className="text-emerald-400" />}
          </DropdownMenuItem>
        ))}
        {grouped && Object.entries(grouped).map(([g, items]) => (
          <div key={g}>
            <div className="px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-600 font-mono">{g}</div>
            {items.map(o => (
              <DropdownMenuItem key={o.id} data-testid={`filter-option-${def.key}-${o.id}`}
                onSelect={() => onChange(o.id)}
                className={`cursor-pointer font-mono text-sm ${value === o.id ? 'bg-emerald-500/[0.08] text-emerald-400' : 'text-zinc-300'}`}>
                <span className="flex-1">{o.label}</span>
                {value === o.id && <Check size={14} className="text-emerald-400" />}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SortChip = ({ value, onChange }) => {
  const opt = SORTS.find(s => s.id === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button data-testid="filter-chip-sort"
          className="inline-flex items-center gap-1.5 font-mono text-sm px-3 py-1.5 rounded-md border border-white/10 bg-transparent text-zinc-500 hover:border-white/25 hover:text-zinc-300 transition-colors">
          <span className="opacity-80">+</span>
          <span>sort: <span className="text-zinc-200">{opt?.label}</span></span>
          <ChevronDown size={12} className="text-zinc-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px] bg-zinc-950 border border-white/10 text-zinc-50">
        {SORTS.map(s => (
          <DropdownMenuItem key={s.id} data-testid={`sort-option-${s.id}`}
            onSelect={() => onChange(s.id)}
            className={`cursor-pointer font-mono text-sm ${value === s.id ? 'bg-emerald-500/[0.08] text-emerald-400' : 'text-zinc-300'}`}>
            <span className="flex-1">{s.label}</span>
            {value === s.id && <Check size={14} className="text-emerald-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ───────────────────── Card ─────────────────────
const TAG_PALETTE = {
  company: { border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.07)', text: '#fbbf24' },
  default: { border: 'rgba(255,255,255,0.12)', bg: 'rgba(255,255,255,0.03)', text: '#a1a1aa' },
  Easy:    { border: 'rgba(34,197,94,0.35)',  bg: 'rgba(34,197,94,0.07)',  text: '#4ade80' },
  Medium:  { border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.07)', text: '#fbbf24' },
  Hard:    { border: 'rgba(239,68,68,0.35)',  bg: 'rgba(239,68,68,0.07)',  text: '#f87171' },
  verified:{ border: 'rgba(34,197,94,0.35)',  bg: 'rgba(34,197,94,0.07)',  text: '#4ade80' },
};

const TagPill = ({ children, kind = 'default', testid }) => {
  const p = TAG_PALETTE[kind] || TAG_PALETTE.default;
  return (
    <span data-testid={testid}
      className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-[4px] whitespace-nowrap"
      style={{ border: `1px solid ${p.border}`, background: p.bg, color: p.text }}
    >
      {children}
    </span>
  );
};

const QuestionCard = ({ q, expanded, onToggleExpand, upvoted, asked, onUpvote, onAsked, onCompanyClick }) => {
  const accent = accentForQ(q);
  const isVerified = q.verifyCount >= 3;
  const company = COMPANIES.find(c => c.id === q.company);
  const topicLabels = q.topicPath.split(' / ');
  const popularity = Math.min(100, q.asked * 2); // 0-100 visual scale

  return (
    <article
      data-testid={`question-card-${q.id}`}
      className="relative rounded-lg border border-white/10 bg-zinc-950 hover:border-white/20 transition-colors animate-fade-up overflow-hidden"
      style={{ boxShadow: '0 8px 24px -16px rgba(0,0,0,0.6)' }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accent, opacity: 0.85 }} />
      <div className="pl-6 pr-6 py-5">
        {/* tags row */}
        <div className="flex items-center flex-wrap gap-1.5 mb-4">
          <button onClick={onCompanyClick} data-testid={`open-blueprint-${q.company}`}>
            <TagPill kind="company">{company?.name}</TagPill>
          </button>
          <TagPill>{q.role}</TagPill>
          {topicLabels.map(t => <TagPill key={t}>{t}</TagPill>)}
          <TagPill kind={q.difficulty}>{q.difficulty}</TagPill>
          {isVerified && <TagPill kind="verified">✓ Verified</TagPill>}
        </div>

        {/* Body */}
        <p className={`text-zinc-100 text-lg leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}
           style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {q.body}
        </p>
        {q.body.length > 180 && (
          <button onClick={onToggleExpand} className="font-mono text-sm text-emerald-400 hover:text-emerald-300 mt-3" data-testid={`expand-${q.id}`}>
            {expanded ? '− show less' : '+ show more'}
          </button>
        )}

        {/* divider */}
        <div className="my-4 border-t border-white/5" />

        {/* meta row */}
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-zinc-500">
          <span><span className="text-zinc-600">reported</span> <span className="text-zinc-300">{q.daysAgo}d ago</span></span>
          <span><span className="text-zinc-600">{q.round}</span> <span className="text-zinc-400">round</span></span>
          <span className="inline-flex items-center gap-2">
            <span className="text-zinc-600">Popularity:</span>
            <PixelBar value={popularity} width={70} height={12} color="#22c55e" />
            <span className="text-zinc-300">{q.asked + (asked ? 1 : 0)}</span>
          </span>
        </div>

        {/* buttons */}
        <div className="flex items-center gap-2 mt-4">
          <button
            data-testid={`upvote-${q.id}`}
            onClick={onUpvote}
            className={`inline-flex items-center gap-1.5 font-mono text-sm px-3 py-1.5 rounded-md border transition-colors ${
              upvoted ? 'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400' : 'border-white/10 text-zinc-300 hover:bg-white/5'
            }`}
          >
            <ArrowUp size={13} strokeWidth={2.25} />
            <span>{q.upvotes + (upvoted ? 1 : 0)}</span>
          </button>
          <button
            data-testid={`asked-${q.id}`}
            onClick={onAsked}
            disabled={asked}
            className={`inline-flex items-center gap-1.5 font-mono text-sm px-3 py-1.5 rounded-md transition-colors ${
              asked
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-emerald-500/[0.08] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
            }`}
          >
            <DollarSign size={13} strokeWidth={2.25} />
            <span>{asked ? 'marked' : 'i-was-asked-this'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

// ───────────────────── Blueprint modal ─────────────────────
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
            <div className="w-10 h-10 rounded-md flex items-center justify-center font-mono font-bold text-sm"
                 style={{ background: company.color + '22', color: company.color, border: `1px solid ${company.color}44` }}>
              {company.initials}
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold tracking-tight">{company.name} interview blueprint</DialogTitle>
              <DialogDescription className="text-zinc-400 mt-1 font-mono text-xs">rounds · topic frequency · question types</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-600 font-mono mb-3">Interview rounds</div>
            <div className="space-y-1.5">
              {bp.rounds.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="font-mono text-xs text-zinc-600 w-6">{(i + 1).toString().padStart(2, '0')}</div>
                  <div className="text-zinc-200">{r}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-600 font-mono mb-3">Topic frequency</div>
            <div className="space-y-2">
              {bp.heatmap.map(h => (
                <div key={h.topic} className="flex items-center gap-3 text-xs">
                  <div className="w-32 text-zinc-300 font-mono truncate">{h.topic}</div>
                  <PixelBar value={(h.count / maxCount) * 100} height={10} color={company.color} dotColor={company.color} />
                  <div className="w-8 text-right font-mono text-zinc-400">{h.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-600 font-mono mb-3">Common question types</div>
            <div className="flex flex-wrap gap-1.5">
              {bp.questionTypes.map(t => <TagPill key={t}>{t}</TagPill>)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
