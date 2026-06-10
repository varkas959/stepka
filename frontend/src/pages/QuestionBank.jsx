import { useMemo, useState, useEffect, useRef } from 'react';
import { Plus, X, ArrowUp, DollarSign, ArrowUpRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { QUESTIONS, COMPANIES, ROLES, TOPIC_TREE, DIFFICULTIES, ROUND_TYPES, COMPANY_BLUEPRINTS, TECH_STACK } from '../lib/mockData';
import { loadUserQuestions } from '../lib/questions';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const ACTIVE_COMPANIES = COMPANIES.filter(c => QUESTIONS.some(q => q.company === c.id));
const TOPIC_LABELS = TOPIC_TREE.flatMap(n => n.children ? n.children : [n]);
const ACTIVE_TOPICS = TOPIC_LABELS.filter(t => QUESTIONS.some(q => q.topic === t.id));
const ACTIVE_TECHS = ['Selenium', 'Playwright', 'Java', 'Python', 'Docker', 'Jenkins', 'System Design', 'Spring Boot']
  .filter(t => QUESTIONS.some(q => (q.tech || []).includes(t)));
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '../components/ui/dropdown-menu';
import { PixelBar } from '../components/PixelBar';
import { SearchableFilterChip } from '../components/SearchableFilterChip';
import { SignInRequiredModal } from '../components/SignInRequiredModal';
import { AddQuestionModal } from '../components/AddQuestionModal';
import { Check, ChevronDown } from 'lucide-react';

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
  { key: 'company',    label: 'company',    options: COMPANIES.map(c => ({ id: c.id, label: c.name })) },
  { key: 'role',       label: 'role',       options: ROLES.map(r => ({ id: r, label: r })) },
  { key: 'topic',      label: 'topic',      options: TOPIC_OPTIONS },
  { key: 'tech',       label: 'technology', options: TECH_STACK.map(t => ({ id: t, label: t })) },
  { key: 'difficulty', label: 'difficulty', options: DIFFICULTIES.map(d => ({ id: d, label: d })) },
  { key: 'round',      label: 'round',      options: ROUND_TYPES.map(r => ({ id: r, label: r })) },
];

// Accent color per question (left edge)
const accentForQ = (q) => {
  if (q.difficulty === 'Hard') return '#ef4444';
  if (q.difficulty === 'Easy') return '#22c55e';
  return '#f59e0b';
};


export default function QuestionBank({ isGuest = false, userId }) {
  const [filters, setFilters] = useState({ company: ALL, role: ALL, topic: ALL, tech: ALL, difficulty: ALL, round: ALL });
  const [sortBy, setSortBy] = useState('recent');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [askedMap, setAskedMap] = useState({});
  const [upvoteMap, setUpvoteMap] = useState({});
  const [blueprintCompany, setBlueprintCompany] = useState(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInAction, setSignInAction] = useState('continue');
  const [userQuestions, setUserQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(true);

  // Load persisted user-submitted questions from Supabase on mount
  useEffect(() => {
    loadUserQuestions()
      .then(qs => setUserQuestions(qs))
      .finally(() => setLoadingQ(false));
  }, []);

  const allQuestions = useMemo(() => [...userQuestions, ...QUESTIONS], [userQuestions]);

  const handleQuestionAdded = (newQ) => {
    setUserQuestions(prev => [newQ, ...prev]);
    setExpandedId(newQ.id);
  };
  const [addOpen, setAddOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const promptSignIn = (action) => { setSignInAction(action); setSignInOpen(true); };

  const filtered = useMemo(() => {
    let list = allQuestions.filter(q => {
      if (filters.company !== ALL && q.company !== filters.company) return false;
      if (filters.role !== ALL && q.role !== filters.role) return false;
      if (filters.topic !== ALL && q.topic !== filters.topic) return false;
      if (filters.tech !== ALL && !(q.tech || []).includes(filters.tech)) return false;
      if (filters.difficulty !== ALL && q.difficulty !== filters.difficulty) return false;
      if (filters.round !== ALL && q.round !== filters.round) return false;
      if (search && !q.body.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortBy === 'popular') list = [...list].sort((a, b) => b.upvotes - a.upvotes);
    if (sortBy === 'asked')   list = [...list].sort((a, b) => b.asked - a.asked);
    if (sortBy === 'recent')  list = [...list].sort((a, b) => a.daysAgo - b.daysAgo);
    return list;
  }, [filters, search, sortBy, allQuestions]);

  const setF = (k, v) => setFilters(s => ({ ...s, [k]: v }));
  const clearOne = (k) => setFilters(s => ({ ...s, [k]: ALL }));

  const handleAsked = (q) => {
    if (isGuest) return promptSignIn('mark "I was asked this"');
    setAskedMap(m => ({ ...m, [q.id]: true }));
    toast.success(`Thanks! You've unlocked 10 new questions`);
  };
  const handleUpvote = (q) => {
    if (isGuest) return promptSignIn('upvote');
    setUpvoteMap(m => ({ ...m, [q.id]: !m[q.id] }));
  };
  const handleAddQuestion = () => {
    if (isGuest) return promptSignIn('submit a question');
    setAddOpen(true);
  };

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

      {/* Heading + Add Question (desktop only) */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50">Real interview questions</h1>
          <p className="text-zinc-400 mt-1.5 text-sm max-w-xl">
            <span className="text-zinc-200 font-medium">{allQuestions.length} verified questions</span> from engineers at top companies.
          </p>
        </div>
        {/* Desktop Add button */}
        <button
          data-testid="add-question"
          onClick={handleAddQuestion}
          className="hidden md:inline-flex shrink-0 items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 hover:border-white/20 text-zinc-100 transition-colors"
        >
          <Plus size={14} strokeWidth={2.25} /> Add Question
        </button>
      </div>

      {/* Inline filter bar — search + chips on one row */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5" data-testid="filter-row">
        {/* Search */}
        <div className="flex items-center gap-1.5 border border-white/10 bg-zinc-950 rounded-md px-3 py-1.5 focus-within:border-emerald-500/40 transition-colors min-w-[160px] flex-1 md:flex-none md:w-56">
          <span className="font-mono text-emerald-400 text-sm select-none">&gt;</span>
          <input
            data-testid="question-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search…"
            className="flex-1 bg-transparent border-0 outline-none font-mono text-sm text-zinc-100 placeholder:text-zinc-600 w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-zinc-600 hover:text-zinc-300">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter chips — selected show value + ×, unselected show + label */}
        {FILTER_DEFS.map(def => (
          <SearchableFilterChip
            key={def.key}
            label={def.label}
            value={filters[def.key] === ALL ? null : filters[def.key]}
            options={def.options}
            onChange={(v) => setF(def.key, v)}
            onClear={() => clearOne(def.key)}
            testid={def.key}
          />
        ))}
        <SortChip value={sortBy} onChange={setSortBy} />

        {/* Clear all — only shown when any filter is active */}
        {(search || Object.values(filters).some(v => v !== ALL)) && (
          <button
            onClick={() => { setSearch(''); setFilters({ company: ALL, role: ALL, topic: ALL, tech: ALL, difficulty: ALL, round: ALL }); }}
            className="font-mono text-xs text-zinc-600 hover:text-zinc-300 px-2 py-1.5 transition-colors"
          >
            clear all
          </button>
        )}
      </div>

      {/* Mobile FAB — appears when scrolled */}
      <button
        data-testid="add-question-fab"
        onClick={handleAddQuestion}
        className={`md:hidden fixed bottom-6 right-5 z-50 inline-flex items-center gap-2 font-mono text-sm font-semibold px-4 py-3 rounded-full text-zinc-950 shadow-lg transition-all duration-200 ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ background: '#f59e0b', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>Add Question</span>
      </button>

      {/* Browse by — SEO links */}
      <div className="mb-5 p-4 rounded-lg border border-white/5 bg-zinc-900/40">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">Browse by</div>
        <div className="flex flex-wrap gap-1.5">
          <Link to="/questions/trending" className="font-mono text-xs px-2.5 py-1 rounded border border-amber-500/30 text-amber-400 hover:bg-amber-500/[0.06] transition-colors">🔥 Trending</Link>
          {ACTIVE_COMPANIES.map(c => (
            <Link key={c.id} to={`/questions/company/${slugify(c.name)}`}
              className="font-mono text-xs px-2.5 py-1 rounded border border-white/10 text-zinc-400 hover:text-zinc-50 hover:border-white/25 transition-colors">
              {c.name}
            </Link>
          ))}
          {ACTIVE_TOPICS.map(t => (
            <Link key={t.id} to={`/questions/topic/${slugify(t.name)}`}
              className="font-mono text-xs px-2.5 py-1 rounded border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/[0.06] transition-colors">
              {t.name}
            </Link>
          ))}
          {ACTIVE_TECHS.map(t => (
            <Link key={t} to={`/questions/tech/${slugify(t)}`}
              className="font-mono text-xs px-2.5 py-1 rounded border border-blue-500/20 text-blue-400 hover:bg-blue-500/[0.06] transition-colors">
              {t}
            </Link>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="font-mono text-sm mb-4">
        <span className="text-zinc-50 font-semibold">{filtered.length}</span>
        <span className="text-zinc-500"> of {QUESTIONS.length} questions</span>
      </div>

      {/* Cards */}
      <div className="space-y-4" data-testid="question-feed">
        {filtered.length === 0 && (
          <div className="border border-white/10 rounded-md p-10 text-center font-mono text-sm" data-testid="empty-state">
            <div className="text-zinc-400">// no questions match your filters yet</div>
            <div className="text-zinc-600 text-xs mt-2">Try removing a filter, or be the first to <button onClick={handleAddQuestion} className="underline text-emerald-400 hover:text-emerald-300">submit a question</button> for this combination.</div>
          </div>
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
        onClick={handleAddQuestion}
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
      <SignInRequiredModal open={signInOpen} onOpenChange={setSignInOpen} action={signInAction} />
      <AddQuestionModal open={addOpen} onOpenChange={setAddOpen} onAdded={handleQuestionAdded} userId={userId} />
    </div>
  );
}

// ───────────────────── Sort chip ─────────────────────
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
        {expanded ? (
          <div className="text-zinc-100 text-base leading-relaxed space-y-2"
               style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {q.body.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
        ) : (
          <p className="text-zinc-100 text-base leading-relaxed line-clamp-3"
             style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {q.body.replace(/\n/g, ' ')}
          </p>
        )}
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
