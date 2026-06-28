import { useMemo, useState, useEffect, useRef } from 'react';
import {
  X, SlidersHorizontal, Search, Check, ArrowUp, Menu, Plus,
  TrendingUp, Building2, RefreshCw,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import {
  QUESTIONS, COMPANIES, ROLES, ROLE_MAP, CATEGORIES, CATEGORY_MAP,
  TOPIC_TREE, DIFFICULTIES, ROUND_TYPES, COMPANY_BLUEPRINTS, TECH_STACK,
} from '../lib/mockData';
import { loadAllQuestions } from '../lib/questionStore';
import { verifyQuestion, markAsked, unmarkAsked, loadUserActions, loadContributionCounts, loadExperienceLinkCounts } from '../lib/experiences';
import { supabase } from '../lib/supabaseClient';
import { ContributeModal } from '../components/ContributeModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { PixelBar } from '../components/PixelBar';
import { SearchableFilterChip } from '../components/SearchableFilterChip';
import { SignInRequiredModal } from '../components/SignInRequiredModal';

// ── constants ────────────────────────────────────────────────────────────────
const ALL = '__all';
const EMPTY_FILTERS = {
  company: ALL, role: ALL, category: ALL, topic: ALL,
  tech: ALL, difficulty: ALL, round: ALL, experience: ALL,
};
const PAGE_SIZE = 20;

const TOPIC_LABELS = TOPIC_TREE.flatMap(n => n.children ? n.children : [n]);
const canonicalRole = (role) => ROLE_MAP[role] || role;
const deriveCategory = (q) =>
  CATEGORY_MAP[q.topic] || (q.round === 'System Design' ? 'System Design' : q.round === 'HR' ? 'Behavioral' : 'Technical');

const EXP_OPTIONS = [...new Set(QUESTIONS.map(q => q.experience).filter(Boolean))]
  .sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0))
  .map(e => ({ id: e, label: e }));

const TOPIC_OPTIONS = TOPIC_TREE.flatMap(n => n.children
  ? n.children.map(c => ({ id: c.id, label: c.name, group: n.name }))
  : [{ id: n.id, label: n.name }]);

const FILTER_DEFS = [
  { key: 'company',    label: 'Company',    options: COMPANIES.map(c => ({ id: c.id, label: c.name })) },
  { key: 'role',       label: 'Role',       options: ROLES.map(r => ({ id: r, label: r })) },
  { key: 'difficulty', label: 'Difficulty', options: DIFFICULTIES.map(d => ({ id: d, label: d })) },
  { key: 'experience', label: 'Experience', options: EXP_OPTIONS },
  { key: 'topic',      label: 'Topic',      options: TOPIC_OPTIONS },
  { key: 'category',   label: 'Category',   options: CATEGORIES.map(c => ({ id: c, label: c })) },
  { key: 'tech',       label: 'Technology', options: TECH_STACK.map(t => ({ id: t, label: t })) },
  { key: 'round',      label: 'Round',      options: ROUND_TYPES.map(r => ({ id: r, label: r })) },
];

const PRIMARY_KEYS   = ['company', 'role', 'difficulty', 'experience', 'topic'];
const PRIMARY_FILTERS   = PRIMARY_KEYS.map(k => FILTER_DEFS.find(d => d.key === k));
const SECONDARY_FILTERS = FILTER_DEFS.filter(d => !PRIMARY_KEYS.includes(d.key));
const MOBILE_FILTER_KEYS = ['company', 'role', 'difficulty', 'topic'];
const MOBILE_FILTERS = MOBILE_FILTER_KEYS.map(k => FILTER_DEFS.find(d => d.key === k));

const TABS = [
  { id: 'latest',    label: 'Latest',    type: 'sort' },
  { id: 'trending',  label: 'Trending',  type: 'sort' },
  { id: 'companies', label: 'Companies', type: 'link', href: '/companies/' },
  { id: 'roles',     label: 'Roles',     type: 'link', href: '/roles/'     },
];

const DIFF_PALETTE = {
  Easy:   { border: 'rgba(34,197,94,0.25)',   bg: 'rgba(34,197,94,0.08)',   text: 'var(--diff-easy)' },
  Medium: { border: 'rgba(217,162,74,0.25)',  bg: 'rgba(217,162,74,0.08)',  text: 'var(--diff-medium)' },
  Hard:   { border: 'rgba(225,128,128,0.25)', bg: 'rgba(225,128,128,0.08)', text: 'var(--diff-hard)' },
};

function timeAgo(daysAgo) {
  if (!daysAgo || daysAgo === 0) return '2h ago';
  if (daysAgo < 1) return `${Math.round(daysAgo * 24)}h ago`;
  if (daysAgo === 1) return '1d ago';
  if (daysAgo < 7)  return `${Math.round(daysAgo)}d ago`;
  return `${Math.round(daysAgo / 7)}w ago`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QuestionBank({ isGuest = false, userId }) {
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [activeTab, setActiveTab]     = useState('latest');
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [askedMap, setAskedMap]       = useState({});
  const [upvoteMap, setUpvoteMap]     = useState({});
  const loadedUpvotes                 = useRef(new Set());
  const loadedAsked                   = useRef(new Set());
  const [userQuestions, setUserQuestions] = useState(QUESTIONS);
  const [refreshing, setRefreshing]   = useState(true);
  const [contribCounts, setContribCounts] = useState({ verifications: {}, asks: {} });
  const [reportCounts, setReportCounts]   = useState({});
  const [blueprintCompany, setBlueprintCompany] = useState(null);
  const [signInOpen, setSignInOpen]   = useState(false);
  const [signInAction, setSignInAction] = useState('continue');
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeMode, setContributeMode] = useState('quick');
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  useEffect(() => {
    loadAllQuestions().then(qs => setUserQuestions(qs)).finally(() => setRefreshing(false));
  }, []);

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

  useEffect(() => {
    const ids = userQuestions.map(q => q.id);
    loadContributionCounts(ids).then(setContribCounts).catch(() => {});
    loadExperienceLinkCounts(ids).then(setReportCounts).catch(() => {});
  }, [userQuestions]);

  const allQuestions = useMemo(() => userQuestions.map(q => ({
    ...q,
    asked:       (q.asked || 0) + (contribCounts.asks[q.id] || 0) + (reportCounts[q.id] || 0),
    verifyCount: (q.verifyCount || 0) + (contribCounts.verifications[q.id] || 0),
  })), [userQuestions, contribCounts, reportCounts]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = allQuestions.filter(q => {
      if (filters.company    !== ALL && q.company !== filters.company) return false;
      if (filters.role       !== ALL && canonicalRole(q.role) !== filters.role) return false;
      if (filters.category   !== ALL && deriveCategory(q) !== filters.category) return false;
      if (filters.topic      !== ALL && q.topic !== filters.topic) return false;
      if (filters.tech       !== ALL && !(q.tech || []).includes(filters.tech)) return false;
      if (filters.difficulty !== ALL && q.difficulty !== filters.difficulty) return false;
      if (filters.experience !== ALL && q.experience !== filters.experience) return false;
      if (filters.round      !== ALL && q.round !== filters.round) return false;
      if (search && !q.body.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeTab === 'recent' && (q.daysAgo || 0) > 7) return false;
      return true;
    });
    if (activeTab === 'trending') list = [...list].sort((a, b) => b.upvotes - a.upvotes);
    else if (activeTab === 'asked') list = [...list].sort((a, b) => b.asked - a.asked);
    else list = [...list].sort((a, b) => (a.daysAgo || 0) - (b.daysAgo || 0));
    return list;
  }, [filters, search, activeTab, allQuestions]);

  // Intelligence data derived from filtered questions (must come after filtered)
  const intelligence = useMemo(() => {
    const topicCounts = {}, companyCounts = {};
    filtered.forEach(q => {
      const name = TOPIC_LABELS.find(t => t.id === q.topic)?.name || q.topic;
      if (name) topicCounts[name] = (topicCounts[name] || 0) + 1;
      if (q.company) companyCounts[q.company] = (companyCounts[q.company] || 0) + 1;
    });
    const topTopics    = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const topCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([id, count]) => ({ id, count, name: COMPANIES.find(c => c.id === id)?.name || id }));
    return { topTopics, topCompanies };
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedQ = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasActiveFilters = search || Object.values(filters).some(v => v !== ALL);

  const setF    = (k, v) => { setFilters(s => ({ ...s, [k]: v })); setPage(1); };
  const clearOne = k => { setFilters(s => ({ ...s, [k]: ALL })); setPage(1); };
  const resetAll = () => { setSearch(''); setFilters(EMPTY_FILTERS); setPage(1); };

  const promptSignIn = action => { setSignInAction(action); setSignInOpen(true); };
  const openContribute = (mode = 'quick') => {
    if (isGuest) return promptSignIn('contribute to the question bank');
    setContributeMode(mode);
    setContributeOpen(true);
  };

  useEffect(() => {
    const h = () => openContribute('quick');
    window.addEventListener('stepkai:contribute', h);
    return () => window.removeEventListener('stepkai:contribute', h);
  }, [isGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAsked = q => {
    if (isGuest) return promptSignIn('mark "I was asked this"');
    if (askedMap[q.id]) return;
    setAskedMap(m => ({ ...m, [q.id]: true }));
    markAsked(q.id, userId).catch(() => {});
    toast('Marked — thanks for confirming!', {
      duration: 5000,
      action: { label: 'Undo', onClick: () => {
        setAskedMap(m => ({ ...m, [q.id]: false }));
        loadedAsked.current.delete(q.id);
        unmarkAsked(q.id, userId).catch(() => {});
      }},
    });
  };

  const handleUpvote = q => {
    if (isGuest) return promptSignIn('verify this question');
    const next = !upvoteMap[q.id];
    setUpvoteMap(m => ({ ...m, [q.id]: next }));
    if (next) {
      verifyQuestion(q.id, userId).catch(() => {});
    } else {
      loadedUpvotes.current.delete(q.id);
      supabase.from('question_verifications').delete().match({ question_id: q.id, user_id: userId }).then(() => {});
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'var(--page)' }}>

      {/* ── Mobile sticky header (replaces Sidebar top bar on this page) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-sm h-14 flex items-center gap-2 px-3"
           style={{ background: 'var(--surface-blur)', borderBottom: `1px solid var(--border)` }}>
        <button onClick={() => window.dispatchEvent(new CustomEvent('stepkai:open-menu'))}
                style={{ color: 'var(--text-2)', flexShrink: 0 }}>
          <Menu size={20} />
        </button>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
             style={{ background: 'var(--accent)' }}>S</div>
        {/* Pill search */}
        <div className="flex-1 flex items-center gap-2 rounded-full px-3 h-9"
             style={{ border: '1px solid var(--border)', background: 'var(--inset)' }}>
          <Search size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            data-testid="question-search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search questions"
            className="flex-1 bg-transparent border-0 outline-none text-sm"
            style={{ color: 'var(--text-1)' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ color: 'var(--text-3)' }}><X size={13} /></button>}
        </div>
        <button onClick={() => setMoreFiltersOpen(o => !o)} style={{ color: moreFiltersOpen ? 'var(--accent)' : 'var(--text-2)', flexShrink: 0 }}>
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* ── Desktop: search + filter chips ── */}
      <div className="hidden md:block">
        <div className="px-8 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-[720px] mx-auto flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2.5 rounded-lg px-4 h-11"
                 style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <Search size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                data-testid="question-search-desktop"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search interview questions…"
                className="flex-1 bg-transparent border-0 outline-none text-sm"
                style={{ color: 'var(--text-1)' }}
              />
              {search
                ? <button onClick={() => setSearch('')} style={{ color: 'var(--text-3)' }}><X size={15} /></button>
                : <kbd className="inline-flex items-center font-mono text-[11px] px-1.5 py-0.5 rounded select-none"
                       style={{ border: '1px solid var(--border-2)', color: 'var(--text-3)', background: 'var(--inset)' }}>/</kbd>
              }
            </div>
            <button
              data-testid="filters-toggle"
              onClick={() => setMoreFiltersOpen(o => !o)}
              className="inline-flex items-center gap-2 text-sm px-4 h-11 rounded-lg border transition-colors"
              style={{
                borderColor: moreFiltersOpen ? 'var(--accent)' : 'var(--border)',
                color: moreFiltersOpen ? 'var(--accent)' : 'var(--text-2)',
                background: 'var(--surface)',
              }}
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
            </button>
          </div>
        </div>
        {/* Desktop filter chips */}
        <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="max-w-[720px] mx-auto px-8 py-2.5 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {PRIMARY_FILTERS.map(def => (
              <div className="shrink-0" key={def.key}>
                <SearchableFilterChip
                  label={def.label}
                  value={filters[def.key] === ALL ? null : filters[def.key]}
                  options={def.options}
                  onChange={v => setF(def.key, v)}
                  onClear={() => clearOne(def.key)}
                  testid={def.key}
                />
              </div>
            ))}
            {hasActiveFilters && (
              <button onClick={resetAll} className="shrink-0 font-mono text-xs px-2 py-1 ml-auto hover:opacity-80"
                      style={{ color: 'var(--accent)' }}>Reset</button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter chips (below fixed header, only when filters open or active) */}
      {(moreFiltersOpen || hasActiveFilters) && (
        <div className="md:hidden pt-14 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {PRIMARY_FILTERS.map(def => (
              <div className="shrink-0" key={def.key}>
                <SearchableFilterChip
                  label={def.label}
                  value={filters[def.key] === ALL ? null : filters[def.key]}
                  options={def.options}
                  onChange={v => setF(def.key, v)}
                  onClear={() => clearOne(def.key)}
                  testid={def.key}
                />
              </div>
            ))}
            {hasActiveFilters && (
              <button onClick={resetAll} className="shrink-0 font-mono text-xs px-2 py-1 ml-auto"
                      style={{ color: 'var(--accent)' }}>Reset</button>
            )}
          </div>
        </div>
      )}

      {/* More filters panel */}
      {moreFiltersOpen && (
        <div className="border-b px-4 md:px-8 py-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="max-w-[720px] mx-auto flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] mr-1" style={{ color: 'var(--text-3)' }}>More</span>
            {SECONDARY_FILTERS.map(def => (
              <SearchableFilterChip
                key={def.key}
                label={def.label}
                value={filters[def.key] === ALL ? null : filters[def.key]}
                options={def.options}
                onChange={v => setF(def.key, v)}
                onClear={() => clearOne(def.key)}
                testid={def.key}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Feed ── */}
      <div className="max-w-[720px] mx-auto md:px-8 pt-14 md:pt-4 pb-4">

        {/* Desktop: header row */}
        <div className="hidden md:flex items-center justify-between mb-3 px-0">
          <span className="font-bold text-lg" style={{ color: 'var(--text-1)' }}>
            <span style={{ color: 'var(--accent)' }}>{filtered.length}</span> verified questions
            {hasActiveFilters && <span className="text-xs ml-2 font-normal" style={{ color: 'var(--text-3)' }}>of {allQuestions.length}</span>}
          </span>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Updating…' : 'Updated daily'}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b" style={{ borderColor: 'var(--border)' }}>
          {TABS.map(tab => {
            const isActive = tab.type === 'sort' && activeTab === tab.id;
            return tab.type === 'link' ? (
              <Link
                key={tab.id}
                to={tab.href}
                className="px-3 md:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap"
                style={{ color: 'var(--text-3)', borderBottom: '2px solid transparent', marginBottom: '-1px' }}
              >
                {tab.label}
              </Link>
            ) : (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className="px-3 md:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-3)',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Question feed */}
        <div data-testid="question-feed">
          {paginatedQ.length === 0 ? (
            <div className="py-16 text-center font-mono text-sm px-4" data-testid="empty-state"
                 style={{ color: 'var(--text-3)' }}>
              No questions match your filters.{' '}
              <button onClick={resetAll} className="underline" style={{ color: 'var(--accent)' }}>Clear filters</button>
            </div>
          ) : (
            <>
              {paginatedQ.slice(0, 10).map(q => (
                <QuestionCard
                  key={q.id} q={q}
                  upvoted={!!upvoteMap[q.id]}
                  newUpvote={!!upvoteMap[q.id] && !loadedUpvotes.current.has(q.id)}
                  asked={!!askedMap[q.id]}
                  onUpvote={() => handleUpvote(q)}
                  onAsked={() => handleAsked(q)}
                  onCompanyClick={() => setBlueprintCompany(q.company)}
                />
              ))}

              {paginatedQ.length > 10 && intelligence.topTopics.length > 0 && (
                <IntelligenceStrip topics={intelligence.topTopics} onTopicClick={name => {
                  const t = TOPIC_LABELS.find(x => x.name === name);
                  if (t) setF('topic', t.id);
                }} />
              )}

              {paginatedQ.length > 10 && paginatedQ.slice(10).map(q => (
                <QuestionCard
                  key={q.id} q={q}
                  upvoted={!!upvoteMap[q.id]}
                  newUpvote={!!upvoteMap[q.id] && !loadedUpvotes.current.has(q.id)}
                  asked={!!askedMap[q.id]}
                  onUpvote={() => handleUpvote(q)}
                  onAsked={() => handleAsked(q)}
                  onCompanyClick={() => setBlueprintCompany(q.company)}
                />
              ))}

              {paginatedQ.length > 10 && intelligence.topCompanies.length > 1 && (
                <CompaniesStrip companies={intelligence.topCompanies} onCompanyClick={id => setF('company', id)} />
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 px-4 md:px-0">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
            <span className="hidden md:block font-mono text-xs" style={{ color: 'var(--text-3)' }}>
              {PAGE_SIZE} per page
            </span>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        data-testid="mobile-fab"
        onClick={() => openContribute('quick')}
        className="md:hidden fixed z-30 w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
        style={{ bottom: '80px', right: '16px', background: 'var(--accent)', color: '#fff' }}
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* Modals */}
      <BlueprintModal companyId={blueprintCompany} onClose={() => setBlueprintCompany(null)} />
      <SignInRequiredModal open={signInOpen} onOpenChange={setSignInOpen} action={signInAction} />
      {contributeOpen && (
        <ContributeModal
          open={contributeOpen}
          onOpenChange={setContributeOpen}
          defaultMode={contributeMode}
          onAdded={q => setUserQuestions(prev => [q, ...prev])}
          userId={userId}
          defaultCompany={filters.company !== ALL ? filters.company : undefined}
        />
      )}
    </div>
  );
}

// ── Interview Intelligence strip ──────────────────────────────────────────────
function IntelligenceStrip({ topics, onTopicClick }) {
  return (
    <div className="my-2 py-4 px-1" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: 'var(--text-3)' }}>Interview Intelligence</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map(([name, count]) => (
          <button
            key={name}
            onClick={() => onTopicClick(name)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}
          >
            {name}
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Companies hiring strip ────────────────────────────────────────────────────
function CompaniesStrip({ companies, onCompanyClick }) {
  return (
    <div className="my-2 py-4 px-1" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={14} style={{ color: 'var(--accent)' }} />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: 'var(--text-3)' }}>Companies hiring now</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {companies.map(({ id, name, count }) => (
          <button
            key={id}
            onClick={() => onCompanyClick(id)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}
          >
            {name}
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Question card ─────────────────────────────────────────────────────────────
function QuestionCard({ q, upvoted, newUpvote, asked, onUpvote, onAsked, onCompanyClick }) {
  const company  = COMPANIES.find(c => c.id === q.company);
  const compName = company?.name || q.company;
  const role     = canonicalRole(q.role);
  const diff     = DIFF_PALETTE[q.difficulty] || DIFF_PALETTE.Medium;

  return (
    <article
      data-testid={`question-card-${q.id}`}
      className="py-3 px-4 md:px-0 transition-colors hover:bg-white/[0.015]"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Question body */}
      <Link
        to={`/app/question/${q.id}`}
        data-testid={`open-question-${q.id}`}
        className="block text-[15px] leading-snug mb-1"
        style={{ color: 'var(--text-1)' }}
      >
        {q.body.replace(/\n/g, ' ')}
      </Link>

      {/* Meta row: Company • Role • Difficulty */}
      <div className="flex items-center gap-1 text-xs mb-2" style={{ color: 'var(--text-3)' }}>
        <button
          onClick={onCompanyClick}
          data-testid={`open-blueprint-${q.company}`}
          className="hover:underline"
          style={{ color: 'var(--text-2)' }}
        >
          {compName}
        </button>
        <span>•</span>
        <span>{role}</span>
        <span>•</span>
        <span style={{ color: diff.text }}>{q.difficulty}</span>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between">
        <button
          data-testid={`asked-${q.id}`}
          onClick={onAsked}
          disabled={asked}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: asked ? 'var(--diff-easy)' : 'var(--text-3)' }}
        >
          <Check size={11} strokeWidth={2.5} />
          <span>Asked this</span>
        </button>
        <button
          data-testid={`upvote-${q.id}`}
          onClick={onUpvote}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: upvoted ? 'var(--diff-easy)' : 'var(--text-3)' }}
        >
          <ArrowUp size={11} strokeWidth={2} />
          <span className="font-mono">{q.verifyCount + (newUpvote ? 1 : 0)}</span>
        </button>
      </div>
    </article>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  const SHOW = 5;
  let start = Math.max(1, page - 2);
  let end   = Math.min(totalPages, start + SHOW - 1);
  if (end - start < SHOW - 1) start = Math.max(1, end - SHOW + 1);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-1">
      <PageNavBtn onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>
        <ChevronLeft size={14} />
      </PageNavBtn>
      {start > 1 && (
        <>
          <PageNumBtn n={1} current={page} onClick={() => onChange(1)} />
          {start > 2 && <span className="font-mono text-xs px-1" style={{ color: 'var(--text-3)' }}>…</span>}
        </>
      )}
      {pages.map(n => <PageNumBtn key={n} n={n} current={page} onClick={() => onChange(n)} />)}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="font-mono text-xs px-1" style={{ color: 'var(--text-3)' }}>…</span>}
          <PageNumBtn n={totalPages} current={page} onClick={() => onChange(totalPages)} />
        </>
      )}
      <PageNavBtn onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
        <ChevronRight size={14} />
      </PageNavBtn>
    </div>
  );
}

function PageNavBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-30"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}>
      {children}
    </button>
  );
}

function PageNumBtn({ n, current, onClick }) {
  const active = n === current;
  return (
    <button onClick={onClick}
            className="w-8 h-8 flex items-center justify-center rounded-lg font-mono text-sm transition-colors"
            style={{
              background: active ? 'var(--accent)' : 'var(--surface)',
              color:      active ? '#fff' : 'var(--text-2)',
              border:     active ? 'none' : '1px solid var(--border)',
            }}>
      {n}
    </button>
  );
}

// ── Blueprint modal (unchanged) ───────────────────────────────────────────────
const BlueprintModal = ({ companyId, onClose }) => {
  if (!companyId) return null;
  const bp = COMPANY_BLUEPRINTS[companyId];
  const company = COMPANIES.find(c => c.id === companyId);
  if (!bp) return null;
  const maxCount = Math.max(...bp.heatmap.map(h => h.count));

  return (
    <Dialog open={true} onOpenChange={v => !v && onClose()}>
      <DialogContent data-testid="blueprint-modal" className="max-w-2xl"
                     style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
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
              {bp.questionTypes.map(t => (
                <span key={t} className="font-mono text-xs px-2.5 py-1 rounded"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
