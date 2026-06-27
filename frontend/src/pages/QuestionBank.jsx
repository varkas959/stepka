import { useMemo, useState, useEffect, useRef } from 'react';
import { Plus, X, ArrowUp, ArrowUpRight, SlidersHorizontal, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { QUESTIONS, COMPANIES, ROLES, ROLE_MAP, CATEGORIES, CATEGORY_MAP, TOPIC_TREE, DIFFICULTIES, ROUND_TYPES, COMPANY_BLUEPRINTS, TECH_STACK } from '../lib/mockData';
import { loadAllQuestions } from '../lib/questionStore';
import { verifyQuestion, markAsked, unmarkAsked, loadUserActions, loadContributionCounts, loadExperienceLinkCounts } from '../lib/experiences';
import { supabase } from '../lib/supabaseClient';
import { ContributeModal } from '../components/ContributeModal';

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

// Resolve a question's role to its canonical display name
const canonicalRole = (role) => ROLE_MAP[role] || role;

// Derive a question's category from its topic id, falling back to round type
const deriveCategory = (q) =>
  CATEGORY_MAP[q.topic] || (q.round === 'System Design' ? 'System Design' : q.round === 'HR' ? 'Behavioral' : 'Technical');

// Experience-years options derived from the actual question data.
const EXP_OPTIONS = [...new Set(QUESTIONS.map(q => q.experience).filter(Boolean))]
  .sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0))
  .map(e => ({ id: e, label: e }));

const FILTER_DEFS = [
  { key: 'role',       label: 'role',       options: ROLES.map(r => ({ id: r, label: r })) },
  { key: 'category',   label: 'category',   options: CATEGORIES.map(c => ({ id: c, label: c })) },
  { key: 'difficulty', label: 'difficulty', options: DIFFICULTIES.map(d => ({ id: d, label: d })) },
  { key: 'company',    label: 'company',    options: COMPANIES.map(c => ({ id: c.id, label: c.name })) },
  { key: 'experience', label: 'experience', options: EXP_OPTIONS },
  { key: 'topic',      label: 'topic',      options: TOPIC_OPTIONS },
  { key: 'tech',       label: 'technology', options: TECH_STACK.map(t => ({ id: t, label: t })) },
  { key: 'round',      label: 'round',      options: ROUND_TYPES.map(r => ({ id: r, label: r })) },
];

// Desktop: Company / Role / Difficulty up front, the rest in a "More filters" drawer.
const PRIMARY_KEYS = ['company', 'role', 'difficulty'];
const PRIMARY_FILTERS = PRIMARY_KEYS.map(k => FILTER_DEFS.find(d => d.key === k));
const SECONDARY_FILTERS = FILTER_DEFS.filter(d => !PRIMARY_KEYS.includes(d.key));

// Mobile: everything in one horizontal-scroll row (Reddit-style), ordered for relevance.
const MOBILE_FILTER_KEYS = ['company', 'role', 'difficulty', 'experience', 'category', 'topic', 'tech', 'round'];
const MOBILE_FILTERS = MOBILE_FILTER_KEYS.map(k => FILTER_DEFS.find(d => d.key === k));
const EMPTY_FILTERS = { company: ALL, role: ALL, category: ALL, topic: ALL, tech: ALL, difficulty: ALL, round: ALL, experience: ALL };


export default function QuestionBank({ isGuest = false, userId }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('recent');
  const [search, setSearch] = useState('');
  const [askedMap, setAskedMap] = useState({});
  const [upvoteMap, setUpvoteMap] = useState({});
  // Track which IDs were already verified/asked when the page loaded (for optimistic count display)
  const loadedUpvotes = useRef(new Set());
  const loadedAsked   = useRef(new Set());
  const [blueprintCompany, setBlueprintCompany] = useState(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInAction, setSignInAction] = useState('continue');
  const [userQuestions, setUserQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [contribCounts, setContribCounts] = useState({ verifications: {}, asks: {} });
  const [reportCounts, setReportCounts] = useState({});   // experience-report frequency per question

  // Load ALL questions from the canonical store (Supabase, seed fallback) on mount
  useEffect(() => {
    loadAllQuestions()
      .then(qs => setUserQuestions(qs))
      .finally(() => setLoadingQ(false));
  }, []);

  // Hydrate upvoteMap and askedMap from DB so state survives page refresh
  useEffect(() => {
    if (!userId) return;
    loadUserActions(userId).then(({ verifiedIds, askedIds }) => {
      loadedUpvotes.current = verifiedIds;
      loadedAsked.current   = askedIds;
      const upvotes = {}, asked = {};
      verifiedIds.forEach(id => { upvotes[id] = true; });
      askedIds.forEach(id    => { asked[id]   = true; });
      setUpvoteMap(upvotes);
      setAskedMap(asked);
    }).catch(() => {});
  }, [userId]);

  // Overlay real community verify/ask counts + interview-report frequency on the seed numbers
  useEffect(() => {
    const ids = userQuestions.map(q => q.id);
    loadContributionCounts(ids).then(setContribCounts).catch(() => {});
    loadExperienceLinkCounts(ids).then(setReportCounts).catch(() => {});
  }, [userQuestions]);

  const allQuestions = useMemo(() => userQuestions.map(q => ({
    ...q,
    asked: (q.asked || 0) + (contribCounts.asks[q.id] || 0) + (reportCounts[q.id] || 0),
    verifyCount: (q.verifyCount || 0) + (contribCounts.verifications[q.id] || 0),
  })), [userQuestions, contribCounts, reportCounts]);

  const handleQuestionAdded = (newQ) => {
    setUserQuestions(prev => [newQ, ...prev]);
  };
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeMode, setContributeMode] = useState('quick');
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const openContribute = (mode = 'quick') => {
    if (isGuest) return promptSignIn('contribute to the question bank');
    setContributeMode(mode);
    setContributeOpen(true);
  };

  // The mobile top-bar "+" (in Sidebar) fires this to open Contribute.
  useEffect(() => {
    const h = () => openContribute('quick');
    window.addEventListener('stepkai:contribute', h);
    return () => window.removeEventListener('stepkai:contribute', h);
  }, [isGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  const promptSignIn = (action) => { setSignInAction(action); setSignInOpen(true); };

  const filtered = useMemo(() => {
    let list = allQuestions.filter(q => {
      if (filters.company !== ALL && q.company !== filters.company) return false;
      if (filters.role !== ALL && canonicalRole(q.role) !== filters.role) return false;
      if (filters.category !== ALL && deriveCategory(q) !== filters.category) return false;
      if (filters.topic !== ALL && q.topic !== filters.topic) return false;
      if (filters.tech !== ALL && !(q.tech || []).includes(filters.tech)) return false;
      if (filters.difficulty !== ALL && q.difficulty !== filters.difficulty) return false;
      if (filters.experience !== ALL && q.experience !== filters.experience) return false;
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
    if (askedMap[q.id]) return; // already marked
    setAskedMap(m => ({ ...m, [q.id]: true }));
    markAsked(q.id, userId).catch(() => {});
    toast('Marked — thanks for confirming!', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          setAskedMap(m => ({ ...m, [q.id]: false }));
          loadedAsked.current.delete(q.id);
          unmarkAsked(q.id, userId).catch(() => {});
        },
      },
    });
  };
  const handleUpvote = (q) => {
    if (isGuest) return promptSignIn('verify this question');
    const next = !upvoteMap[q.id];
    setUpvoteMap(m => ({ ...m, [q.id]: next }));
    if (next) {
      verifyQuestion(q.id, userId).catch(() => {});
    } else {
      // un-verify: remove from DB and from loaded set
      loadedUpvotes.current.delete(q.id);
      supabase.from('question_verifications').delete().match({ question_id: q.id, user_id: userId }).then(() => {});
    }
  };
  const handleAddQuestion = () => openContribute('quick');

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-[1200px] mx-auto">
      {/* Heading — desktop only; mobile goes straight to search (Reddit-style) */}
      <div className="hidden md:flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50">Real interview questions</h1>
          <p className="text-zinc-400 mt-1.5 text-sm max-w-xl">
            Verified by the community, from engineers at top companies.
          </p>
          {filters.company !== ALL && (
            <Link to={`/company/${slugify(COMPANIES.find(c => c.id === filters.company)?.name || filters.company)}`}
              className="inline-flex items-center gap-1.5 mt-2 font-mono text-xs text-purple-400 hover:text-purple-300">
              View {COMPANIES.find(c => c.id === filters.company)?.name || filters.company} interview intelligence
              <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
        {/* Contribute — secondary, so it doesn't out-shout the search */}
        <button
          data-testid="contribute"
          onClick={() => openContribute('quick')}
          className="shrink-0 inline-flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-md border transition-colors hover:bg-white/[0.04]"
          style={{ borderColor: 'var(--border-2)', color: 'var(--accent)', background: 'transparent' }}
        >
          <Plus size={14} strokeWidth={2.25} /> Contribute
        </button>
      </div>

      {/* Search — the dominant element on the page */}
      <div className="mb-3">
        <div className="flex items-center gap-2.5 rounded-lg px-4 h-12 transition-colors focus-within:border-[var(--accent)]"
             style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <Search size={18} style={{ color: 'var(--text-3)' }} />
          <input
            data-testid="question-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, companies, roles…"
            className="flex-1 bg-transparent border-0 outline-none text-base w-full"
            style={{ color: 'var(--text-1)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear search" className="hover:opacity-70" style={{ color: 'var(--text-3)' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter row — single horizontal-scroll line (Reddit-style) */}
      <div className="md:hidden mb-4 flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" data-testid="filter-row-mobile">
        {MOBILE_FILTERS.map(def => (
          <div className="shrink-0" key={def.key}>
            <SearchableFilterChip
              label={def.label}
              value={filters[def.key] === ALL ? null : filters[def.key]}
              options={def.options}
              onChange={(v) => setF(def.key, v)}
              onClear={() => clearOne(def.key)}
              testid={def.key}
            />
          </div>
        ))}
        <div className="shrink-0"><SortChip value={sortBy} onChange={setSortBy} /></div>
        {(search || Object.values(filters).some(v => v !== ALL)) && (
          <button onClick={() => { setSearch(''); setFilters(EMPTY_FILTERS); }}
            className="shrink-0 font-mono text-xs px-2 py-1.5 transition-colors" style={{ color: 'var(--text-3)' }}>
            clear
          </button>
        )}
      </div>

      {/* Desktop filter chips row */}
      <div className="hidden md:flex mb-5 flex-wrap items-center gap-1.5" data-testid="filter-row">
        {/* Primary filter chips — Company, Role, Difficulty */}
        {PRIMARY_FILTERS.map(def => (
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

        {/* More filters toggle — the rest (category, topic, tech, round) live here */}
        {(() => {
          const activeSecondary = SECONDARY_FILTERS.filter(d => filters[d.key] !== ALL).length;
          return (
            <button
              data-testid="more-filters"
              onClick={() => setMoreFiltersOpen(o => !o)}
              className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1.5 rounded-md border transition-colors"
              style={{ borderColor: moreFiltersOpen || activeSecondary ? 'var(--accent)' : 'rgba(255,255,255,0.10)',
                       color: moreFiltersOpen || activeSecondary ? 'var(--text-1)' : 'var(--text-2)',
                       background: activeSecondary ? 'var(--accent-12)' : 'transparent' }}
            >
              <SlidersHorizontal size={13} /> More filters
              {activeSecondary > 0 && <span className="font-semibold" style={{ color: 'var(--accent)' }}>{activeSecondary}</span>}
            </button>
          );
        })()}
        <SortChip value={sortBy} onChange={setSortBy} />

        {/* Clear all - only shown when any filter is active */}
        {(search || Object.values(filters).some(v => v !== ALL)) && (
          <button
            onClick={() => { setSearch(''); setFilters(EMPTY_FILTERS); }}
            className="font-mono text-xs text-zinc-600 hover:text-zinc-300 px-2 py-1.5 transition-colors"
          >
            clear all
          </button>
        )}
      </div>

      {/* Secondary filters drawer */}
      {moreFiltersOpen && (
        <div className="mb-5 -mt-2 flex flex-wrap items-center gap-1.5 rounded-md border p-3 animate-fade-up"
             style={{ borderColor: 'var(--border)', background: 'var(--surface)' }} data-testid="more-filters-panel">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] mr-1" style={{ color: 'var(--text-3)' }}>More</span>
          {SECONDARY_FILTERS.map(def => (
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
        </div>
      )}

      {/* Count + active filter banner */}
      {Object.values(filters).some(v => v !== ALL) || search ? (
        <div className="mb-4 flex items-center justify-between rounded-md px-4 py-2.5"
             style={{ border: '1px solid rgba(59,111,212,0.25)', background: 'rgba(59,111,212,0.06)' }}>
          <span className="font-mono text-sm" style={{ color: 'var(--text-2)' }}>
            Showing <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{filtered.length}</span> of{' '}
            <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{allQuestions.length}</span> questions
          </span>
          <button
            onClick={() => { setSearch(''); setFilters(EMPTY_FILTERS); }}
            className="font-mono text-xs underline ml-4 transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            clear all
          </button>
        </div>
      ) : (
        <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>
          {allQuestions.length} Questions
        </div>
      )}

      {/* Question list — light rows separated by thin dividers (scan-optimised) */}
      <div className="divide-y divide-[color:var(--border)] border-y border-[color:var(--border)]" data-testid="question-feed">
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
            upvoted={!!upvoteMap[q.id]}
            newUpvote={!!upvoteMap[q.id] && !loadedUpvotes.current.has(q.id)}
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
        className="w-full text-left mt-6 rounded-md p-5 flex items-center gap-4 transition-colors"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B6FD430'; e.currentTarget.style.background = 'rgba(59,111,212,0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
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
      {contributeOpen && (
        <ContributeModal
          open={contributeOpen}
          onOpenChange={setContributeOpen}
          defaultMode={contributeMode}
          onAdded={handleQuestionAdded}
          userId={userId}
          defaultCompany={filters.company !== ALL ? filters.company : undefined}
        />
      )}
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
          className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1.5 rounded-md border border-white/10 bg-transparent text-zinc-500 hover:border-white/25 hover:text-zinc-300 transition-colors">
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
// Calm, low-saturation palette. Difficulty is the one chip that carries a real
// signal, so it keeps colour — but muted ~15% so it reads without glowing.
const NEUTRAL = { border: 'var(--chip-border)', bg: 'var(--chip-bg)', text: 'var(--chip-text)' };
const TAG_PALETTE = {
  company: NEUTRAL,
  default: NEUTRAL,
  Easy:    { border: 'rgba(34,197,94,0.22)',  bg: 'rgba(34,197,94,0.05)',  text: 'var(--diff-easy)' },
  Medium:  { border: 'rgba(217,162,74,0.22)', bg: 'rgba(217,162,74,0.05)', text: 'var(--diff-medium)' },
  Hard:    { border: 'rgba(225,128,128,0.24)', bg: 'rgba(225,128,128,0.05)', text: 'var(--diff-hard)' },
  verified:{ border: 'rgba(127,201,160,0.20)', bg: 'transparent',          text: 'var(--diff-easy)' },
};

const TagPill = ({ children, kind = 'default', testid }) => {
  const p = TAG_PALETTE[kind] || TAG_PALETTE.default;
  return (
    <span data-testid={testid}
      className="inline-flex items-center gap-1 font-mono text-[11px] leading-none px-2.5 py-1 rounded-[5px] whitespace-nowrap"
      style={{ border: `1px solid ${p.border}`, background: p.bg, color: p.text }}
    >
      {children}
    </span>
  );
};

const QuestionCard = ({ q, upvoted, newUpvote, asked, onUpvote, onAsked, onCompanyClick }) => {
  const isVerified = q.verifyCount >= 3;
  const company = COMPANIES.find(c => c.id === q.company);
  const companyName = company?.name || q.company;
  const role = canonicalRole(q.role);
  const diffPalette = TAG_PALETTE[q.difficulty] || TAG_PALETTE.default;

  return (
    <article
      data-testid={`question-card-${q.id}`}
      className="group animate-fade-up transition-colors rounded-md"
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div className="px-2 sm:px-3 py-4">
        {/* Body — links to the full question page; the line-clamp "…" signals more */}
        <Link to={`/app/question/${q.id}`} data-testid={`open-question-${q.id}`}
          className="block text-[15px] font-medium leading-snug line-clamp-2 mb-2 transition-colors group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-1)' }}>
          {q.body.replace(/\n/g, ' ')}
        </Link>

        {/* Single compact line: metadata (left) + actions (right) */}
        <div className="flex items-center justify-between gap-2">
          {/* metadata — Company · Role, then a colour-coded difficulty pill + verified */}
          <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-[11px] leading-none min-w-0"
               style={{ color: 'var(--text-3)' }}>
            <button onClick={onCompanyClick} data-testid={`open-blueprint-${q.company}`}
              className="font-medium hover:underline truncate" style={{ color: 'var(--text-2)' }}>{companyName}</button>
            <span aria-hidden>·</span>
            <span className="truncate" style={{ color: 'var(--text-3)' }}>{role}</span>
            {/* Difficulty — colour-coded pill, the one high-value scan signal */}
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium leading-none ml-0.5"
              style={{ border: `1px solid ${diffPalette.border}`, background: diffPalette.bg, color: diffPalette.text }}>
              {q.difficulty}
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-0.5" style={{ color: 'var(--diff-easy)' }}>&#10003; Verified</span>
            )}
          </div>

          {/* actions — compact, neutral at rest */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              data-testid={`upvote-${q.id}`}
              onClick={onUpvote}
              aria-label="Verify this question"
              className="inline-flex items-center gap-1 font-mono text-[11px] leading-none px-2 py-1 rounded-[5px] border transition-colors"
              style={upvoted
                ? { border: '1px solid rgba(34,197,94,0.30)', background: 'rgba(34,197,94,0.07)', color: '#7FC9A0' }
                : { border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', color: 'var(--chip-text)' }}
            >
              <ArrowUp size={12} strokeWidth={2.25} />
              <span>{q.verifyCount + (newUpvote ? 1 : 0)}</span>
            </button>
            <button
              data-testid={`asked-${q.id}`}
              onClick={onAsked}
              disabled={asked}
              aria-label="I was asked this"
              className={`inline-flex items-center gap-1 font-mono text-[11px] leading-none px-2 py-1 rounded-[5px] border transition-colors whitespace-nowrap ${
                asked ? '' : 'hover:bg-white/[0.04]'
              }`}
              style={asked
                ? { border: '1px solid rgba(34,197,94,0.30)', background: 'rgba(34,197,94,0.07)', color: 'rgba(110,231,160,0.9)' }
                : { border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', color: 'var(--chip-text)' }}
            >
              <Check size={12} strokeWidth={2.5} />
              <span>{asked ? 'Marked' : 'Asked this'}</span>
            </button>
          </div>
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
      <DialogContent data-testid="blueprint-modal" className="max-w-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
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

