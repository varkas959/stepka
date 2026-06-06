import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppState } from '../lib/appState';
import { COMPANIES } from '../lib/mockData';
import { PixelBar } from './PixelBar';

export const ActivePlanBanner = () => {
  const { state } = useAppState();
  const navigate = useNavigate();
  const plan = state.activePlan;
  if (!plan) return null;

  const company = COMPANIES.find(c => c.id === plan.company);
  const dayPct = Math.round((plan.currentDay / plan.totalDays) * 100);

  return (
    <div data-testid="active-plan-banner" className="border-b border-white/5 bg-zinc-950">
      <div className="flex items-center gap-5 px-6 py-4">
        {/* Day x/y + pixel bar + pct */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="font-mono text-sm">
            <span className="text-zinc-500 uppercase tracking-[0.18em] text-[10px] mr-2">Day</span>
            <span className="text-zinc-50 font-semibold">{plan.currentDay}</span>
            <span className="text-zinc-700">/{plan.totalDays}</span>
          </div>
          <PixelBar value={dayPct} width={150} height={14} color="#22c55e" />
          <span className="font-mono text-sm font-semibold" style={{ color: dayPct < 50 ? '#f59e0b' : dayPct < 75 ? '#22c55e' : '#22c55e' }}>{dayPct}%</span>
        </div>

        <div className="hidden md:block w-px h-5 bg-white/10" />

        <div className="hidden md:flex flex-1 min-w-0 items-center text-sm text-zinc-300 font-mono">
          <span className="text-zinc-50 font-medium truncate">{company?.name} {plan.role}</span>
          <span className="text-zinc-600 mx-1.5">·</span>
          <span className="text-zinc-500">prep</span>
          <span className="text-zinc-600 mx-1.5">·</span>
          <span className="text-zinc-50">{plan.dueQuestions}</span>
          <span className="text-zinc-500 ml-1 truncate">question{plan.dueQuestions === 1 ? '' : 's'} due…</span>
        </div>

        <button
          data-testid="start-plan-day"
          onClick={() => navigate('/app/plan')}
          className="shrink-0 inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] px-4 sm:px-5 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
          style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 24px -8px rgba(245,158,11,0.6)' }}
        >
          Begin session <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
