import { Flame, Snowflake, Zap, TrendingUp } from 'lucide-react';
import { useAppState } from '../lib/appState';
import { PixelBar } from '../components/PixelBar';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { XP_EVENTS, XP_BREAKDOWN, TOPIC_MASTERY, COMPANIES } from '../lib/mockData';
import { toast } from 'sonner';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

export default function Progress({ isGuest = false }) {
  const { state, consumeFreeze } = useAppState();
  const company = COMPANIES.find(c => c.id === state.activePlan?.company);
  const xpPct = Math.round((state.xp / state.xpToNext) * 100);
  const readinessColor = state.readiness < 40 ? '#ef4444' : state.readiness < 70 ? '#f59e0b' : '#22c55e';

  const useFreeze = () => {
    if (state.streakFreezes <= 0) { toast.error('No freezes left.'); return; }
    consumeFreeze();
    toast.success('Freeze applied. Your streak is safe today.');
  };

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-7xl mx-auto" data-testid="progress-page">
      {isGuest && (
        <div className="mb-6 rounded-lg p-4 flex items-center justify-between gap-3"
             style={{ border: '1px solid rgba(59,111,212,0.3)', background: 'rgba(59,111,212,0.06)' }}>
          <span className="font-mono text-sm" style={{ color: 'rgba(59,111,212,0.85)' }}>Sign in to track your real progress, streaks, and XP</span>
          <a href="/signin" className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: '#3B6FD4' }}>Sign in</a>
        </div>
      )}
      <Breadcrumb segments={['progress', 'dashboard']} />
      <div className="mt-1 mb-7">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-50">Where you stand</h1>
        <p className="font-mono text-sm text-zinc-400 mt-3">Stats that earn the streak.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <Card testid="streak-widget">
          <Eyebrow>Streak</Eyebrow>
          <div className="flex items-center gap-3 mt-3">
            <Flame size={26} className="text-amber-500" fill="currentColor" />
            <div>
              <div className="font-mono text-4xl font-semibold text-zinc-50">{state.streak}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">days</div>
            </div>
          </div>
          <div className="font-mono text-xs text-zinc-400 mt-4 flex justify-between">
            <span>longest</span><span className="text-zinc-100">{state.longestStreak}d</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 mb-2">Freezes</div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Snowflake key={i} size={18} className={i < state.streakFreezes ? 'text-blue-400' : 'text-zinc-800'}
                  fill={i < state.streakFreezes ? 'currentColor' : 'none'} />
              ))}
              <button data-testid="use-freeze" onClick={useFreeze}
                className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:text-zinc-50 border border-white/10 rounded px-2 py-1">
                use freeze
              </button>
            </div>
          </div>
        </Card>

        {/* XP + Level */}
        <Card className="md:col-span-2" testid="xp-level">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow>Level · XP</Eyebrow>
              <div className="flex items-baseline gap-2 mt-3">
                <div className="font-mono text-4xl font-semibold text-zinc-50">Lvl {state.level}</div>
                <div className="font-mono text-sm text-zinc-500">· {state.xp.toLocaleString()} XP</div>
              </div>
              <div className="font-mono text-xs text-zinc-500 mt-1">{(state.xpToNext - state.xp).toLocaleString()} XP to Lvl {state.level + 1}</div>
            </div>
            <Zap size={20} style={{ color: '#3B6FD4' }} />
          </div>
          <div className="mt-4">
            <PixelBar value={xpPct} height={12} color="#3B6FD4" />
          </div>
          <div className="mt-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 mb-2">XP by source · last 30 days</div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={XP_BREAKDOWN} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="source" stroke="#52525b" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 12 }}
                    labelStyle={{ color: '#fafafa', fontFamily: 'JetBrains Mono' }}
                    itemStyle={{ color: '#22c55e', fontFamily: 'JetBrains Mono' }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {XP_BREAKDOWN.map((_, i) => <Cell key={i} fill={['#22c55e', '#3b82f6', '#f59e0b'][i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Readiness */}
        <Card className="md:col-span-3 lg:col-span-1" testid="readiness-card">
          <Eyebrow>Readiness</Eyebrow>
          <div className="mt-4">
            <div className="font-mono text-6xl font-semibold" style={{ color: readinessColor }}>
              {state.readiness}<span className="text-2xl text-zinc-700">%</span>
            </div>
            <div className="font-mono text-xs text-zinc-400 mt-2">{company?.name} {state.activePlan?.role}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 mt-1">target loop</div>
          </div>
          <div className="mt-5">
            <PixelBar value={state.readiness} height={14} color={readinessColor} dotColor={readinessColor} />
          </div>
        </Card>

        {/* Heatmap */}
        <Card className="md:col-span-3 lg:col-span-3" testid="mastery-heatmap-card">
          <div className="flex items-center justify-between">
            <Eyebrow>Daily activity · last 8 weeks</Eyebrow>
            <div className="font-mono text-xs text-emerald-400 inline-flex items-center gap-1.5">
              <TrendingUp size={12} strokeWidth={2.25} /> +18% vs prior 8w
            </div>
          </div>
          <div className="mt-5 overflow-x-auto pb-1">
            <ContributionHeatmap />
          </div>
        </Card>

        {/* Topic mastery */}
        <Card className="md:col-span-3 lg:col-span-2" testid="topic-mastery-card">
          <Eyebrow>Topic mastery · active plan</Eyebrow>
          <div className="mt-4 space-y-3">
            {TOPIC_MASTERY.map(t => {
              const color = t.level >= 4 ? '#22c55e' : t.level === 3 ? '#f59e0b' : '#ef4444';
              return (
                <div key={t.topic} className="flex items-center gap-3 font-mono">
                  <div className="w-24 sm:w-32 text-sm text-zinc-200 truncate shrink-0">{t.topic}</div>
                  <div className="flex-1 min-w-0"><PixelBar value={(t.level / 5) * 100} height={10} color={color} dotColor={color} /></div>
                  <div className="w-12 text-right text-xs shrink-0" style={{ color }}>{t.level}/5</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* XP events */}
        <Card className="md:col-span-3 lg:col-span-2" testid="xp-events-card">
          <Eyebrow>Recent XP events</Eyebrow>
          <div className="mt-4 space-y-3 font-mono text-sm">
            {XP_EVENTS.map(e => (
              <div key={e.id} className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                <div className={`w-1 h-8 rounded-sm ${
                  e.source === 'review' ? 'bg-emerald-500'
                  : e.source === 'submission' ? 'bg-blue-500'
                  : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-100 truncate">{e.label}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">{e.source} · {e.ago}</div>
                </div>
                <div className="text-emerald-400">+{e.amount}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const Card = ({ children, className = '', testid }) => (
  <div data-testid={testid} className={`rounded-lg border border-white/10 bg-zinc-950 p-5 ${className}`}>
    {children}
  </div>
);

const Eyebrow = ({ children }) => (
  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">{children}</div>
);

const Breadcrumb = ({ segments }) => (
  <div className="font-mono text-sm mb-4" style={{ color: '#4B5270' }}>
    <span style={{ color: '#3B6FD4' }}>~</span>
    {segments.map((s, i) => (
      <span key={i}>
        <span className="mx-1.5">/</span>
        <span style={{ color: i === segments.length - 1 ? '#8B8FA8' : '#4B5270' }}>{s}</span>
      </span>
    ))}
  </div>
);
