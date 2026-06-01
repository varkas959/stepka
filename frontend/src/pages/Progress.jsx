import { Flame, Snowflake, Zap, TrendingUp } from 'lucide-react';
import { useAppState } from '../lib/appState';
import { ProgressRing } from '../components/ProgressRing';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { XP_EVENTS, XP_BREAKDOWN, TOPIC_MASTERY, COMPANIES } from '../lib/mockData';
import { toast } from 'sonner';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

export default function Progress() {
  const { state, consumeFreeze } = useAppState();
  const company = COMPANIES.find(c => c.id === state.activePlan?.company);

  const useFreeze = () => {
    if (state.streakFreezes <= 0) {
      toast.error('No freezes left. Earn one by hitting your daily goal 7 days in a row.');
      return;
    }
    consumeFreeze();
    toast.success('Freeze applied. Your streak is safe today.');
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto" data-testid="progress-page">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Progress</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">Where you stand</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <Card className="md:col-span-1 lg:col-span-1" testid="streak-widget">
          <Eyebrow>Streak</Eyebrow>
          <div className="flex items-center gap-3 mt-3">
            <Flame size={28} className="text-amber-400" fill="currentColor" />
            <div>
              <div className="font-mono text-4xl font-semibold tracking-tight text-zinc-50">{state.streak}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-mono">days</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-zinc-400 flex justify-between"><span>Longest</span><span className="font-mono text-zinc-50">{state.longestStreak}d</span></div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-mono mb-2">Freezes</div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Snowflake key={i} size={18} className={i < state.streakFreezes ? 'text-blue-400' : 'text-zinc-700'} fill={i < state.streakFreezes ? 'currentColor' : 'none'} />
              ))}
              <button data-testid="use-freeze" onClick={useFreeze} className="ml-auto text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-300 hover:text-zinc-50 border border-white/10 rounded px-2 py-1">
                Use freeze
              </button>
            </div>
          </div>
        </Card>

        {/* XP + Level */}
        <Card className="md:col-span-2 lg:col-span-2" testid="xp-level">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow>Level · XP</Eyebrow>
              <div className="flex items-baseline gap-2 mt-3">
                <div className="font-mono text-4xl font-semibold tracking-tight text-zinc-50">Lvl {state.level}</div>
                <div className="font-mono text-sm text-zinc-400">· {state.xp.toLocaleString()} XP</div>
              </div>
              <div className="text-xs text-zinc-500 mt-1 font-mono">{(state.xpToNext - state.xp).toLocaleString()} XP to Lvl {state.level + 1}</div>
            </div>
            <Zap size={20} className="text-zinc-500" />
          </div>

          <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all" style={{ width: `${(state.xp / state.xpToNext) * 100}%` }} />
          </div>

          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-mono mb-2">XP by source · last 30 days</div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={XP_BREAKDOWN} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="source" stroke="#71717a" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 12 }}
                    labelStyle={{ color: '#fafafa', fontFamily: 'JetBrains Mono' }}
                    itemStyle={{ color: '#10b981', fontFamily: 'JetBrains Mono' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {XP_BREAKDOWN.map((_, i) => (
                      <Cell key={i} fill={['#10b981', '#3b82f6', '#f59e0b'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Readiness */}
        <Card className="md:col-span-3 lg:col-span-1" testid="readiness-card">
          <Eyebrow>Readiness</Eyebrow>
          <div className="mt-4 flex flex-col items-center">
            <ProgressRing value={state.readiness} max={100} size={148} stroke={10} label={`${state.readiness}%`} />
            <div className="text-xs text-zinc-400 mt-3 text-center">
              {company?.name} {state.activePlan?.role}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-mono mt-1">target loop readiness</div>
          </div>
        </Card>

        {/* Mastery heatmap */}
        <Card className="md:col-span-3 lg:col-span-3" testid="mastery-heatmap-card">
          <div className="flex items-center justify-between">
            <Eyebrow>Daily activity · last 8 weeks</Eyebrow>
            <div className="text-xs text-zinc-500 font-mono inline-flex items-center gap-1.5"><TrendingUp size={12} /> +18% vs prior 8w</div>
          </div>
          <div className="mt-5 overflow-x-auto pb-1">
            <ContributionHeatmap />
          </div>
        </Card>

        {/* Topic mastery */}
        <Card className="md:col-span-3 lg:col-span-2" testid="topic-mastery-card">
          <Eyebrow>Topic mastery · active plan</Eyebrow>
          <div className="mt-4 space-y-3">
            {TOPIC_MASTERY.map(t => (
              <div key={t.topic} className="flex items-center gap-3">
                <div className="w-32 text-sm text-zinc-200 font-mono truncate">{t.topic}</div>
                <div className="flex-1 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-sm ${
                      i < t.level
                        ? (t.level >= 4 ? 'bg-emerald-500' : t.level === 3 ? 'bg-amber-500' : 'bg-red-500')
                        : 'bg-white/5'
                    }`} />
                  ))}
                </div>
                <div className="w-8 text-right font-mono text-xs text-zinc-400">{t.level}/5</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent XP events */}
        <Card className="md:col-span-3 lg:col-span-2" testid="xp-events-card">
          <Eyebrow>Recent XP events</Eyebrow>
          <div className="mt-4 space-y-3">
            {XP_EVENTS.map(e => (
              <div key={e.id} className="flex items-center gap-3 text-sm pb-3 border-b border-white/5 last:border-0 last:pb-0">
                <div className={`w-1.5 h-8 rounded-sm ${
                  e.source === 'review' ? 'bg-emerald-500'
                  : e.source === 'submission' ? 'bg-blue-500'
                  : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-100 truncate">{e.label}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-mono">{e.source} · {e.ago}</div>
                </div>
                <div className="font-mono text-sm text-emerald-400">+{e.amount}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const Card = ({ children, className = '', testid }) => (
  <div data-testid={testid} className={`border border-white/10 rounded-lg bg-zinc-900/60 p-5 ${className}`}>
    {children}
  </div>
);

const Eyebrow = ({ children }) => (
  <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">{children}</div>
);
