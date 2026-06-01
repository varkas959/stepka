import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { useAppState } from '../lib/appState';
import { COMPANIES } from '../lib/mockData';

export const ActivePlanBanner = () => {
  const { state } = useAppState();
  const navigate = useNavigate();
  const plan = state.activePlan;
  if (!plan) return null;

  const company = COMPANIES.find(c => c.id === plan.company);
  return (
    <div data-testid="active-plan-banner" className="border-b border-white/10 bg-zinc-900/60 backdrop-blur">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="flex items-center gap-2 text-amber-400">
          <CalendarCheck size={16} strokeWidth={2} />
          <span className="font-mono text-xs uppercase tracking-[0.18em]">Day {plan.currentDay} / {plan.totalDays}</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-white/10" />
        <div className="flex-1 text-sm text-zinc-300">
          <span className="font-medium text-zinc-50">{company?.name} {plan.role}</span>
          <span className="text-zinc-500"> · prep ·</span>
          <span className="font-mono text-zinc-50"> {plan.dueQuestions}</span>
          <span className="text-zinc-500"> questions due today</span>
        </div>
        <button
          data-testid="start-plan-day"
          onClick={() => navigate('/app/plan')}
          className="flex items-center gap-1.5 text-xs font-medium bg-white text-zinc-950 px-3 py-1.5 rounded-md hover:bg-zinc-200 transition-colors"
        >
          Start <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
