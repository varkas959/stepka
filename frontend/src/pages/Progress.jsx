import { Flame, Snowflake, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppState } from '../lib/appState';
import { PixelBar } from '../components/PixelBar';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { ActivePlanBanner } from '../components/ActivePlanBanner';
import { XP_EVENTS, XP_BREAKDOWN, COMPANIES } from '../lib/mockData';
import { toast } from 'sonner';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

const BAND_LEVEL = { 'Critical Gap': 1, 'Weak': 2, 'Needs Improvement': 3, 'Moderate': 3, 'Strong': 4, 'Interview Ready': 5 };

export default function Progress() {
  const { state, consumeFreeze } = useAppState();

  // Everything on this page — streak, level, readiness, topic mastery — was
  // previously gated on "any XP/streak/reviewedToday > 0", which has nothing
  // to do with whether a real assessment ever happened. That let an account
  // with no plan (Daily Review correctly shows "nothing to review yet")
  // still show a 68% readiness and six topic-mastery bars pulled from a
  // generic mock array, not that account's actual assessment. There is no
  // "progress" to report on until a real plan exists — this page is the
  // post-assessment view, full stop, same as Daily Review already is.
  if (!state.activePlan?.plan) {
    return (
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-2xl mx-auto" data-testid="progress-page">
        <Breadcrumb segments={['progress']} />
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50">Nothing to show yet</h1>
        <p className="mt-3 text-base leading-relaxed max-w-md" style={{ color: 'var(--text-2)' }}>
          Progress tracks your actual plan — readiness, streak, and topic mastery all come from a real assessment. Start one from a job description.
        </p>
        <Link to="/app/plan" data-testid="start-plan-cta"
          className="pressable mt-6 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--accent)' }}>
          Start a plan <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    );
  }

  const company = COMPANIES.find(c => c.id === state.activePlan?.company);
  const xpPct = Math.round((state.xp / state.xpToNext) * 100);
  const readinessColor = state.readiness < 40 ? '#ef4444' : state.readiness < 70 ? '#f59e0b' : '#22c55e';
  // Real per-skill scores from this account's own assessment, persisted on
  // the plan — not the generic TOPIC_MASTERY mock array, which was
  // completely disconnected from any actual per-user result.
  const topicMastery = state.activePlan.heatmap || [];
  // XP_EVENTS / XP_BREAKDOWN are still illustrative (that history isn't
  // tracked per-event yet) — real activity is real now that it's gated on
  // an actual plan, but these two specific widgets remain a placeholder for
  // future work, kept honest via their own gate below.
  const hasRealActivity = state.streak > 0 || state.xp > 0 || state.reviewedToday > 0;

  const useFreeze = () => {
    if (state.streakFreezes <= 0) { toast.error('No freezes left.'); return; }
    consumeFreeze();
    toast.success('Freeze applied. Your streak is safe today.');
  };

  return (
    <>
      <ActivePlanBanner />
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-7xl mx-auto" data-testid="progress-page">
      <Breadcrumb segments={['progress', 'dashboard']} />
      <div className="mt-1 mb-7">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-50">Where you stand</h1>
        <p className="text-sm text-zinc-400 mt-3">Stats that earn the streak.</p>
      </div>

      {/* Mobile-only compact stats — three full-width cards to show streak/
          level/readiness (two of them often just a single digit) wasted most
          of the screen; this is the same numbers in one row. */}
      <Card className="md:hidden mb-4" testid="mobile-stats-card">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <Flame size={16} className="text-amber-500" fill="currentColor" />
              <span className="font-mono text-2xl font-semibold text-zinc-50">{state.streak}</span>
            </div>
            <Eyebrow>streak</Eyebrow>
          </div>
          <div>
            <span className="font-mono text-2xl font-semibold text-zinc-50">{state.level}</span>
            <Eyebrow>level</Eyebrow>
          </div>
          <div>
            <span className="font-mono text-2xl font-semibold" style={{ color: readinessColor }}>{state.readiness}%</span>
            <Eyebrow>readiness</Eyebrow>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Streak — desktop only; mobile's compact card above covers streak/level/readiness */}
        <Card className="hidden md:block" testid="streak-widget">
          <Eyebrow>Streak</Eyebrow>
          <div className="flex items-center gap-3 mt-3">
            <Flame size={26} className="text-amber-500" fill="currentColor" />
            <div>
              <div className="font-mono text-4xl font-semibold text-zinc-50">{state.streak}</div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600">days</div>
            </div>
          </div>
          <div className="text-xs text-zinc-400 mt-4 flex justify-between">
            <span>longest</span><span className="font-mono text-zinc-100">{state.longestStreak}d</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600 mb-2">Freezes</div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Snowflake key={i} size={18} className={i < state.streakFreezes ? 'text-blue-400' : 'text-zinc-800'}
                  fill={i < state.streakFreezes ? 'currentColor' : 'none'} />
              ))}
              <button data-testid="use-freeze" onClick={useFreeze}
                className="ml-auto text-[11px] uppercase tracking-[0.18em] text-zinc-300 hover:text-zinc-50 border border-white/10 rounded px-2 py-1">
                use freeze
              </button>
            </div>
          </div>
        </Card>

        {/* XP + Level — desktop only; mobile's three cards are Streak/Readiness/Topic mastery */}
        <Card className="hidden md:block md:col-span-2" testid="xp-level">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow>Level · XP</Eyebrow>
              <div className="flex items-baseline gap-2 mt-3">
                <div className="font-mono text-4xl font-semibold text-zinc-50">Lvl {state.level}</div>
                <div className="font-mono text-sm text-zinc-500">· {state.xp.toLocaleString()} XP</div>
              </div>
              <div className="font-mono text-xs text-zinc-500 mt-1">{(state.xpToNext - state.xp).toLocaleString()} XP to Lvl {state.level + 1}</div>
            </div>
            <Zap size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="mt-4">
            <PixelBar value={xpPct} height={12} color="var(--accent)" />
          </div>
          <div className="mt-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600 mb-2">XP by source · last 30 days</div>
            {!hasRealActivity ? (
              <EmptyState className="text-xs">Earn XP from reviews, practice, or contributions to see a breakdown.</EmptyState>
            ) : (
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
            )}
          </div>
        </Card>

        {/* Readiness — desktop only; mobile's compact card above covers streak/level/readiness */}
        <Card className="hidden md:block md:col-span-3 lg:col-span-1" testid="readiness-card">
          <Eyebrow>Readiness</Eyebrow>
          <div className="mt-4">
            <div className="font-mono text-6xl font-semibold" style={{ color: readinessColor }}>
              {state.readiness}<span className="text-2xl text-zinc-700">%</span>
            </div>
            <div className="text-xs text-zinc-400 mt-2">{company?.name} {state.activePlan?.role}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600 mt-1">target loop</div>
          </div>
          <div className="mt-5">
            <PixelBar value={state.readiness} height={14} color={readinessColor} dotColor={readinessColor} />
          </div>
        </Card>

        {/* Heatmap — desktop only, illegible under ~500px */}
        <Card className="hidden md:block md:col-span-3 lg:col-span-3" testid="mastery-heatmap-card">
          <div className="flex items-center justify-between">
            <Eyebrow>Daily activity · last 8 weeks</Eyebrow>
            {hasRealActivity && (
              <div className="font-mono text-xs text-emerald-400 inline-flex items-center gap-1.5">
                <TrendingUp size={12} strokeWidth={2.25} /> +18% vs prior 8w
              </div>
            )}
          </div>
          {hasRealActivity ? (
            <div className="mt-5 overflow-x-auto pb-1">
              <ContributionHeatmap />
            </div>
          ) : (
            <EmptyState className="mt-5">Complete your first review to start building activity history.</EmptyState>
          )}
        </Card>

        {/* Topic mastery — real per-skill scores from this account's own
            assessment (state.activePlan.heatmap), not a generic mock array. */}
        <Card className="md:col-span-3 lg:col-span-2" testid="topic-mastery-card">
          <Eyebrow>Topic mastery · active plan</Eyebrow>
          {topicMastery.length > 0 ? (
            <div className="mt-4 space-y-3">
              {topicMastery.map(t => {
                const level = BAND_LEVEL[t.band] || Math.max(1, Math.round(t.score / 20));
                const color = level >= 4 ? '#22c55e' : level === 3 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={t.skill} className="flex items-center gap-3">
                    <div className="w-24 sm:w-32 text-sm text-zinc-200 truncate shrink-0">{t.skill}</div>
                    {/* Numeric label sits on the bar itself, not just after it —
                        color alone (red/amber/green) isn't a reliable signal
                        for color-blind readers. */}
                    <div className="relative flex-1 min-w-0">
                      <PixelBar value={t.score} height={16} color={color} dotColor={color} />
                      <span className="absolute inset-0 flex items-center justify-end pr-1.5 font-mono text-[10px] font-semibold text-white/90" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                        {t.score}%
                      </span>
                    </div>
                    <div className="w-10 text-right font-mono text-xs shrink-0" style={{ color }}>{level}/5</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState className="mt-4">Your assessment didn't save a skill breakdown — re-run it from Study Plan to see topic mastery here.</EmptyState>
          )}
        </Card>

        {/* XP events — desktop only; mobile's three cards are Streak/Readiness/Topic mastery */}
        <Card className="hidden md:block md:col-span-3 lg:col-span-2" testid="xp-events-card">
          <Eyebrow>Recent XP events</Eyebrow>
          {hasRealActivity ? (
            <div className="mt-4 space-y-3 text-sm">
              {XP_EVENTS.map(e => (
                <div key={e.id} className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className={`w-1 h-8 rounded-sm ${
                    e.source === 'review' ? 'bg-emerald-500'
                    : e.source === 'submission' ? 'bg-blue-500'
                    : 'bg-amber-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-100 truncate">{e.label}</div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600">{e.source} · {e.ago}</div>
                  </div>
                  <div className="font-mono text-emerald-400">+{e.amount}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState className="mt-4">No XP events yet — start a review or practice session to earn some.</EmptyState>
          )}
        </Card>
      </div>
      </div>
    </>
  );
}

const Card = ({ children, className = '', testid }) => (
  <div data-testid={testid} className={`rounded-lg border border-white/10 bg-zinc-950 p-5 ${className}`}>
    {children}
  </div>
);

const Eyebrow = ({ children }) => (
  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-600">{children}</div>
);

const EmptyState = ({ children, className = '' }) => (
  <p className={`text-sm text-zinc-500 leading-relaxed ${className}`}>{children}</p>
);

const Breadcrumb = ({ segments }) => (
  <div className="text-sm mb-4" style={{ color: 'var(--text-3)' }}>
    {segments.map((s, i) => (
      <span key={i}>
        <span className="mx-1.5">/</span>
        <span style={{ color: i === segments.length - 1 ? 'var(--text-2)' : 'var(--text-3)' }}>{s}</span>
      </span>
    ))}
  </div>
);
