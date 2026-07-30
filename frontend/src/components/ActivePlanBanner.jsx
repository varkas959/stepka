import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppState, getCurrentDay, getDayCards } from '../lib/appState';
import { COMPANIES } from '../lib/mockData';
import { PixelBar } from './PixelBar';

export const ActivePlanBanner = () => {
  const { state } = useAppState();
  const navigate = useNavigate();
  const plan = state.activePlan;
  // plan.plan (the real, generated day-by-day content) is what makes this a
  // real plan — an outer activePlan wrapper without it is stale/legacy data
  // (this banner used to also read a `plan.dueQuestions` field that hasn't
  // existed since the Study Plan/Daily Review rework; both bugs let this
  // banner show invented progress for an account with no real assessment
  // behind it, while Daily Review correctly showed "nothing to review").
  if (!plan?.plan) return null;

  const company = COMPANIES.find(c => c.id === plan.company);
  const dayPct = Math.round((plan.currentDay / plan.totalDays) * 100);
  const today = getCurrentDay(plan);
  const duePending = today ? getDayCards(today).filter(c => c.status === 'pending').length : 0;

  return (
    <div data-testid="active-plan-banner" className="border-b border-white/5 bg-zinc-950">
      <div className="flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-3 sm:py-4 flex-wrap">
        {/* Day x/y + pixel bar + pct */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="font-mono text-xs sm:text-sm">
            <span className="text-zinc-500 uppercase tracking-[0.18em] text-[11px] mr-2 hidden sm:inline">Day</span>
            <span className="text-zinc-50 font-semibold">{plan.currentDay}</span>
            <span className="text-zinc-700">/{plan.totalDays}</span>
          </div>
          <div className="w-[90px] sm:w-[150px]">
            <PixelBar value={dayPct} height={12} color="#22c55e" />
          </div>
          <span className="font-mono text-xs sm:text-sm font-semibold" style={{ color: '#22C55E' }}>{dayPct}%</span>
        </div>

        <div className="hidden md:block w-px h-5 bg-white/10" />

        <div className="hidden md:flex flex-1 min-w-0 items-center text-sm text-zinc-300">
          <span className="text-zinc-50 font-medium truncate">{company?.name} {plan.role}</span>
          <span className="text-zinc-600 mx-1.5">·</span>
          <span className="text-zinc-500">prep</span>
          <span className="text-zinc-600 mx-1.5">·</span>
          <span className="text-zinc-50">{duePending}</span>
          <span className="text-zinc-500 ml-1 truncate">card{duePending === 1 ? '' : 's'} due…</span>
        </div>

        <button
          data-testid="start-plan-day"
          onClick={() => navigate('/app/plan')}
          className="ml-auto shrink-0 inline-flex items-center gap-2 text-[11px] sm:text-sm font-semibold uppercase tracking-[0.14em] px-3 sm:px-5 py-2 sm:py-2.5 rounded-md text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--accent)' }}
        >
          <span className="hidden sm:inline">Begin session</span><span className="sm:hidden">Begin</span> <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
