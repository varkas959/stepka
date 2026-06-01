import { useMemo, useState } from 'react';
import { ChevronRight, Search, ThumbsUp, BadgeCheck, MessageSquarePlus, X, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { QUESTIONS, COMPANIES, ROLES, TOPIC_TREE, DIFFICULTIES, ROUND_TYPES, COMPANY_BLUEPRINTS } from '../lib/mockData';
import { CompanyBadge } from '../components/CompanyBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

const ALL = '__all';

export default function QuestionBank() {
  const [filters, setFilters] = useState({
    company: ALL, role: ALL, topic: ALL, difficulty: ALL, round: ALL,
  });
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [askedMap, setAskedMap] = useState({});
  const [upvoteMap, setUpvoteMap] = useState({});
  const [blueprintCompany, setBlueprintCompany] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);

  const filtered = useMemo(() => {
    return QUESTIONS.filter(q => {
      if (filters.company !== ALL && q.company !== filters.company) return false;
      if (filters.role !== ALL && q.role !== filters.role) return false;
      if (filters.topic !== ALL && q.topic !== filters.topic) return false;
      if (filters.difficulty !== ALL && q.difficulty !== filters.difficulty) return false;
      if (filters.round !== ALL && q.round !== filters.round) return false;
      if (search && !q.body.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filters, search]);

  const setF = (k, v) => setFilters(s => ({ ...s, [k]: s[k] === v ? ALL : v }));
  const clearAll = () => setFilters({ company: ALL, role: ALL, topic: ALL, difficulty: ALL, round: ALL });

  const handleAsked = (q) => {
    setAskedMap(m => ({ ...m, [q.id]: true }));
    toast.success(`Thanks! You've unlocked 10 new questions`, { description: 'Your contribution helps signal-rank this question.' });
  };

  const handleUpvote = (q) => {
    setUpvoteMap(m => ({ ...m, [q.id]: !m[q.id] }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 md:px-8 py-6 md:py-10 max-w-[1400px] mx-auto">
      {/* Sidebar filters */}
      <aside className={`lg:w-72 lg:shrink-0 ${sideOpen ? 'fixed inset-0 z-40 bg-zinc-950 p-6 overflow-auto lg:static lg:p-0 lg:bg-transparent' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <div className="text-sm font-semibold">Filters</div>
          <button onClick={() => setSideOpen(false)} className="text-zinc-400" data-testid="close-filters"><X size={18} /></button>
        </div>

        <FilterGroup label="Company">
          {COMPANIES.map(c => (
            <FilterPill key={c.id} active={filters.company === c.id} onClick={() => setF('company', c.id)} testid={`filter-company-${c.id}`}>
              <CompanyBadge companyId={c.id} size="sm" /><span>{c.name}</span>
            </FilterPill>
          ))}
        </FilterGroup>

        <FilterGroup label="Role">
          {ROLES.map(r => (
            <FilterPill key={r} active={filters.role === r} onClick={() => setF('role', r)} testid={`filter-role-${r}`}>{r}</FilterPill>
          ))}
        </FilterGroup>

        <FilterGroup label="Topic">
          {TOPIC_TREE.map(node => (
            <div key={node.id} className="mb-1">
              {!node.children && (
                <FilterPill active={filters.topic === node.id} onClick={() => setF('topic', node.id)} testid={`filter-topic-${node.id}`}>
                  {node.name}
                </FilterPill>
              )}
              {node.children && (
                <>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-600 px-2 py-1 font-mono">{node.name}</div>
                  <div className="ml-3 border-l border-white/10 pl-2 space-y-0.5">
                    {node.children.map(child => (
                      <FilterPill key={child.id} active={filters.topic === child.id} onClick={() => setF('topic', child.id)} testid={`filter-topic-${child.id}`}>
                        {child.name}
                      </FilterPill>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </FilterGroup>

        <FilterGroup label="Difficulty">
          {DIFFICULTIES.map(d => (
            <FilterPill key={d} active={filters.difficulty === d} onClick={() => setF('difficulty', d)} testid={`filter-difficulty-${d}`}>{d}</FilterPill>
          ))}
        </FilterGroup>

        <FilterGroup label="Round Type">
          {ROUND_TYPES.map(r => (
            <FilterPill key={r} active={filters.round === r} onClick={() => setF('round', r)} testid={`filter-round-${r}`}>{r}</FilterPill>
          ))}
        </FilterGroup>

        <button data-testid="clear-filters" onClick={clearAll} className="text-xs text-zinc-500 hover:text-zinc-50 transition-colors mt-3">Clear all filters</button>
      </aside>

      {/* Main feed */}
      <main className="flex-1 min-w-0">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Question Bank</div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">Real interview questions</h1>
            <p className="text-zinc-400 mt-2 text-sm max-w-lg">Browse {QUESTIONS.length} verified questions from engineers at top companies. Filter, tag what you've been asked, and we'll bias your study plan.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                data-testid="question-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions…"
                className="w-full bg-zinc-900 border border-white/10 rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors font-mono"
              />
            </div>
            <button onClick={() => setSideOpen(true)} className="lg:hidden flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm" data-testid="open-filters">
              <Filter size={14} /> Filters
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <span>{filtered.length}</span><span>of {QUESTIONS.length} questions</span>
            <span className="ml-auto">Click a company badge to see its blueprint →</span>
          </div>
        </div>

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
              <article key={q.id} data-testid={`question-card-${q.id}`} className="border border-white/10 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 transition-colors animate-fade-up">
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
      </main>

      <BlueprintModal companyId={blueprintCompany} onClose={() => setBlueprintCompany(null)} />
    </div>
  );
}

const FilterGroup = ({ label, children }) => (
  <div className="mb-5">
    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono mb-2 px-2">{label}</div>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const FilterPill = ({ active, onClick, children, testid }) => (
  <button
    data-testid={testid}
    onClick={onClick}
    className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
      active ? 'bg-white text-zinc-950 font-medium' : 'text-zinc-400 hover:text-zinc-50 hover:bg-white/5'
    }`}
  >
    {children}
  </button>
);

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
            <CompanyBadge companyId={companyId} size="lg" />
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
