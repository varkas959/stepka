import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Plus, X, SlidersHorizontal, Search, Star, Check, ArrowUp,
  TrendingUp, Building2, Users, BarChart3, RefreshCw,
  ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
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
  { id: 'latest',   label: 'Latest' },
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'asked',    label: 'Most Asked' },
  { id: 'recent',   label: 'Recently Added', badge: 'NEW' },
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
  const [showAllTopics, setShowAllTopics] = useState(false);

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

  // Stats
  const stats = useMemo(() => ({
    total:     allQuestions.length,
    companies: new Set(allQuestions.map(q => q.company)).size,
    roles:     new Set(allQuestions.map(q => q.role).filter(Boolean)).size,
    thisWeek:  allQuestions.filter(q => (q.daysAgo || 0) <= 7).length,
  }), [allQuestions]);

  // Sidebar context
  const sidebarCtx = useMemo(() => {
    const co   = filters.company !== ALL ? COMPANIES.find(c => c.id === filters.company) : null;
    const role = filters.role !== ALL ? filters.role : null;
    const ctxQ = allQuestions.filter(q =>
      (!co   || q.company === co.id) &&
      (!role || canonicalRole(q.role) === role)
    );
    const topicCounts = {};
    ctxQ.forEach(q => {
      const name = TOPIC_LABELS.find(t => t.id === q.topic)?.name || q.topic;
      if (name) topicCounts[name] = (topicCounts[name] || 0) + 1;
    });
    const diff = { Easy: 0, Medium: 0, Hard: 0 };
    ctxQ.forEach(q => { if (diff[q.difficulty] !== undefined) diff[q.difficulty]++; });
    const recent = [...ctxQ].sort((a, b) => (a.daysAgo || 0) - (b.daysAgo || 0)).slice(0, 3);
    return {
      company: co, role, count: ctxQ.length,
      topics:  Object.entries(topicCounts).sort((a, b) => b[1] - a[1]),
      diff, recent,
    };
  }, [allQuestions, filters.company, filters.role]);

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--page)' }}>

      {/* ── Search bar + Filters button ── */}
      <div className="px-4 md:px-8 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[1200px] mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 rounded-lg px-4 h-11 transition-colors focus-within:border-[var(--accent)]"
               style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <Search size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <input
              data-testid="question-search"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search interview questions, companies, roles, topics..."
              className="flex-1 bg-transparent border-0 outline-none text-sm"
              style={{ color: 'var(--text-1)' }}
            />
            {search ? (
              <button onClick={() => setSearch('')} style={{ color: 'var(--text-3)' }}><X size={15} /></button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center font-mono text-[11px] px-1.5 py-0.5 rounded select-none"
                   style={{ border: '1px solid var(--border-2)', color: 'var(--text-3)', background: 'var(--inset)' }}>
                /
              </kbd>
            )}
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
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* ── Primary filter chips ── */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-2.5 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Desktop: 5 primary filters */}
          <div className="hidden md:flex items-center gap-2 flex-1">
            {PRIMARY_FILTERS.map(def => (
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
            {hasActiveFilters && (
              <button onClick={resetAll} className="font-mono text-xs px-2 py-1 ml-auto hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--accent)' }}>
                Reset
              </button>
            )}
          </div>
          {/* Mobile: 4 filters in horizontal scroll */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {MOBILE_FILTERS.map(def => (
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
          </div>
        </div>
      </div>

      {/* ── Secondary filters panel ── */}
      {moreFiltersOpen && (
        <div className="border-b px-4 md:px-8 py-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="max-w-[1200px] mx-auto flex flex-wrap items-center gap-2">
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

      {/* ── Page body ── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-5">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
              <span style={{ color: 'var(--accent)' }}>{stats.total}</span> verified interview questions
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>From real candidates. Updated daily.</p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs mt-1" style={{ color: 'var(--text-3)' }}>
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Last updated: 2 hours ago'}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<BarChart3 size={18} />}
            iconColor="#3B6FD4"
            value={stats.total}
            label="Total Questions"
            growth={`+${stats.thisWeek} this week`}
          />
          <StatCard
            icon={<Building2 size={18} />}
            iconColor="#8B5CF6"
            value={stats.companies}
            label="Companies"
            growth="+3 this week"
          />
          <StatCard
            icon={<Users size={18} />}
            iconColor="#EC4899"
            value={stats.roles}
            label="Roles"
            growth="+5 this week"
          />
          <TrendingCard />
        </div>

        {/* Two-column layout */}
        <div className="flex gap-5">

          {/* ── Left sidebar (desktop only) ── */}
          <aside className="hidden md:flex flex-col gap-4 w-[200px] shrink-0">

            {/* Context + topics + difficulty */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center gap-2 mb-0.5">
                <Building2 size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-1)' }}>
                  {sidebarCtx.company
                    ? `${sidebarCtx.role || 'All roles'} at ${sidebarCtx.company.name}`
                    : 'All Companies'}
                </span>
              </div>
              <p className="text-xs mb-3 pl-5" style={{ color: 'var(--text-3)' }}>{sidebarCtx.count} questions</p>

              {/* All Questions nav item */}
              <button
                onClick={resetAll}
                className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-md mb-4 font-medium"
                style={{
                  borderLeft: '2px solid var(--accent)',
                  background: 'var(--accent-12)',
                  color: 'var(--text-1)',
                }}
              >
                <span>All Questions</span>
                <span style={{ color: 'var(--text-3)' }}>{sidebarCtx.count}</span>
              </button>

              {/* Topics */}
              {sidebarCtx.topics.length > 0 && (
                <div className="mb-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
                       style={{ color: 'var(--text-3)' }}>Topics</div>
                  <div className="space-y-1">
                    {(showAllTopics ? sidebarCtx.topics : sidebarCtx.topics.slice(0, 9)).map(([name, count]) => {
                      const topicObj = TOPIC_LABELS.find(t => t.name === name);
                      const isActive = topicObj && filters.topic === topicObj.id;
                      return (
                        <button
                          key={name}
                          onClick={() => topicObj && setF('topic', topicObj.id)}
                          className="w-full flex items-center justify-between text-xs py-0.5 hover:opacity-80 transition-opacity"
                          style={{ color: isActive ? 'var(--accent)' : 'var(--text-2)' }}
                        >
                          <span className="text-left truncate">{name}</span>
                          <span className="ml-2 shrink-0" style={{ color: 'var(--text-3)' }}>{count}</span>
                        </button>
                      );
                    })}
                    {sidebarCtx.topics.length > 9 && (
                      <button
                        onClick={() => setShowAllTopics(s => !s)}
                        className="text-xs font-medium mt-1 flex items-center gap-0.5"
                        style={{ color: 'var(--accent)' }}
                      >
                        {showAllTopics ? 'View less' : 'View all topics'} →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Difficulty */}
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
                     style={{ color: 'var(--text-3)' }}>Difficulty</div>
                <div className="space-y-1">
                  {[
                    { label: 'Easy',   color: 'var(--diff-easy)' },
                    { label: 'Medium', color: 'var(--diff-medium)' },
                    { label: 'Hard',   color: 'var(--diff-hard)' },
                  ].map(({ label, color }) => (
                    <button
                      key={label}
                      onClick={() => setF('difficulty', filters.difficulty === label ? ALL : label)}
                      className="w-full flex items-center gap-2 text-xs py-0.5 hover:opacity-80 transition-opacity"
                      style={{ color: filters.difficulty === label ? color : 'var(--text-2)' }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="flex-1 text-left">{label}</span>
                      <span style={{ color: 'var(--text-3)' }}>{sidebarCtx.diff[label]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recently added */}
            {sidebarCtx.recent.length > 0 && (
              <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3"
                     style={{ color: 'var(--text-3)' }}>Recently added</div>
                <div className="space-y-3">
                  {sidebarCtx.recent.map(q => (
                    <div key={q.id}>
                      <Link to={`/app/question/${q.id}`}
                            className="text-xs leading-snug block mb-1 hover:underline line-clamp-2"
                            style={{ color: 'var(--text-1)' }}>
                        {q.body}
                      </Link>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>
                          {timeAgo(q.daysAgo)}
                        </span>
                        {(q.daysAgo || 0) < 2 && (
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded font-bold"
                                style={{ background: 'var(--accent)', color: '#fff' }}>
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share experience */}
            <button
              onClick={() => openContribute('paste')}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm border transition-colors hover:bg-white/[0.04]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
            >
              <Users size={14} />
              Share your experience
            </button>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile: compact context card */}
            <div className="md:hidden flex items-center gap-3 mb-4 px-3 py-3 rounded-xl"
                 style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <Building2 size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-1)' }}>
                  {sidebarCtx.company
                    ? `${sidebarCtx.role || 'All'} at ${sidebarCtx.company.name}`
                    : 'All Companies'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{sidebarCtx.count} questions</div>
              </div>
              {hasActiveFilters && (
                <button onClick={resetAll} className="shrink-0 text-xs px-3 py-1.5 rounded-lg border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                  Change
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b mb-0" style={{ borderColor: 'var(--border)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setPage(1); }}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-3)',
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: '-1px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  <span className={tab.badge ? '' : ''}>{tab.label}</span>
                  {tab.badge && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: 'var(--accent)', color: '#fff' }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active filter count banner */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between py-2.5 text-sm"
                   style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-3)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{filtered.length}</span>
                  {' '}of{' '}
                  <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{allQuestions.length}</span>
                  {' '}questions
                </span>
                <button onClick={resetAll} className="text-xs underline"
                        style={{ color: 'var(--accent)' }}>
                  clear all
                </button>
              </div>
            )}

            {/* Question list */}
            <div data-testid="question-feed">
              {paginatedQ.length === 0 ? (
                <div className="py-16 text-center font-mono text-sm" data-testid="empty-state"
                     style={{ color: 'var(--text-3)' }}>
                  No questions match your filters.{' '}
                  <button onClick={resetAll} className="underline" style={{ color: 'var(--accent)' }}>
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="divide-y" style={{ borderBottom: '1px solid var(--border)', '--tw-divide-color': 'var(--border)' }}>
                  {paginatedQ.map(q => (
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
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
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
        </div>
      </div>

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

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconColor, value, label, growth }) {
  return (
    <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
           style={{ background: iconColor + '20', color: iconColor }}>
        {icon}
      </div>
      <div className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-1)' }}>{value}</div>
      <div className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>{label}</div>
      <div className="text-xs font-semibold" style={{ color: 'var(--diff-easy)' }}>{growth}</div>
    </div>
  );
}

// ── Trending card ──────────────────────────────────────────────────────────────
function TrendingCard() {
  return (
    <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
           style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--diff-easy)' }}>
        <TrendingUp size={18} />
      </div>
      <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-1)' }}>Trending now</div>
      <div className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-3)' }}>
        Vector DB, LLM, System Design, SQL
      </div>
      <Link to="/questions/trending" className="text-xs font-semibold"
            style={{ color: 'var(--accent)' }}>
        See trends →
      </Link>
    </div>
  );
}

// ── Question card ─────────────────────────────────────────────────────────────
function QuestionCard({ q, upvoted, newUpvote, asked, onUpvote, onAsked, onCompanyClick }) {
  const company    = COMPANIES.find(c => c.id === q.company);
  const compName   = company?.name || q.company;
  const role       = canonicalRole(q.role);
  const topicLabel = TOPIC_LABELS.find(t => t.id === q.topic)?.name || q.topic;
  const diff       = DIFF_PALETTE[q.difficulty] || DIFF_PALETTE.Medium;

  return (
    <article
      data-testid={`question-card-${q.id}`}
      className="py-4 px-1 transition-colors hover:bg-white/[0.02]"
    >
      <div className="flex items-start gap-3">
        {/* Bookmark icon */}
        <button
          className="mt-0.5 shrink-0 transition-opacity opacity-30 hover:opacity-70"
          style={{ color: 'var(--text-3)' }}
          aria-label="Bookmark"
        >
          <Star size={16} strokeWidth={1.5} />
        </button>

        {/* Body + meta */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/app/question/${q.id}`}
            data-testid={`open-question-${q.id}`}
            className="block text-[15px] font-medium leading-snug mb-2 hover:underline"
            style={{ color: 'var(--text-1)' }}
          >
            {q.body.replace(/\n/g, ' ')}
          </Link>
          <div className="flex items-center gap-1.5 text-xs flex-wrap" style={{ color: 'var(--text-3)' }}>
            <button onClick={onCompanyClick}
                    data-testid={`open-blueprint-${q.company}`}
                    className="font-medium hover:underline"
                    style={{ color: 'var(--text-2)' }}>
              {compName}
            </button>
            <span aria-hidden>•</span>
            <span style={{ color: 'var(--text-3)' }}>{role}</span>
            {topicLabel && (
              <>
                <span aria-hidden>•</span>
                <span className="flex items-center gap-0.5" style={{ color: 'var(--text-3)' }}>
                  <span style={{ fontSize: 9, opacity: 0.7 }}>◇</span>
                  {topicLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Difficulty badge — desktop */}
          <span className="hidden sm:inline-flex items-center font-mono text-xs px-2.5 py-1 rounded-lg font-semibold"
                style={{ border: `1px solid ${diff.border}`, background: diff.bg, color: diff.text }}>
            {q.difficulty}
          </span>
          {/* Upvote */}
          <button
            data-testid={`upvote-${q.id}`}
            onClick={onUpvote}
            aria-label="Verify this question"
            className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
            style={upvoted
              ? { border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.07)', color: 'var(--diff-easy)' }
              : { border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)' }}
          >
            <ArrowUp size={13} strokeWidth={2} />
            <span>{q.verifyCount + (newUpvote ? 1 : 0)}</span>
          </button>
          {/* Asked this — desktop */}
          <button
            data-testid={`asked-${q.id}`}
            onClick={onAsked}
            disabled={asked}
            aria-label="I was asked this"
            className="hidden sm:inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1.5 rounded-lg border transition-colors whitespace-nowrap"
            style={asked
              ? { border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.07)', color: 'var(--diff-easy)' }
              : { border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)' }}
          >
            <Check size={12} strokeWidth={2.5} />
            <span>{asked ? 'Marked' : 'Asked this'}</span>
          </button>
        </div>
      </div>

      {/* Mobile: difficulty + Asked this below body */}
      <div className="sm:hidden flex items-center gap-2 mt-2.5 ml-7">
        <span className="font-mono text-xs px-2 py-0.5 rounded-md font-semibold"
              style={{ border: `1px solid ${diff.border}`, background: diff.bg, color: diff.text }}>
          {q.difficulty}
        </span>
        <button
          onClick={onAsked}
          disabled={asked}
          className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md border transition-colors"
          style={asked
            ? { border: '1px solid rgba(34,197,94,0.3)', color: 'var(--diff-easy)' }
            : { border: '1px solid var(--border)', color: 'var(--text-3)' }}
        >
          <Check size={11} />
          <span>{asked ? 'Marked' : 'Asked this'}</span>
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
