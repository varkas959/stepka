import { NavLink, useNavigate } from 'react-router-dom';
import { Diamond, Target, Grid3x3, Terminal, CircleDashed, Flame, Check, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAppState } from '../lib/appState';
import { signOut } from '../lib/auth';
import { PixelBar } from './PixelBar';

const navItems = [
  { to: '/app/questions', label: 'Question Bank', icon: Diamond, key: 'questions' },
  { to: '/app/review',    label: 'Daily Review',  icon: Target,  key: 'review', badge: true },
  { to: '/app/plan',      label: 'Study Plan',    icon: Grid3x3, key: 'plan' },
  { to: '/app/practice',  label: 'Practice',      icon: Terminal, key: 'practice' },
  { to: '/app/progress',  label: 'Progress',      icon: CircleDashed, key: 'progress' },
];

export const Sidebar = ({ user, onSignOut }) => {
  const { state } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try { await signOut(); } catch (e) { /* ignore */ }
    onSignOut?.();
    navigate('/');
  };

  const progressPct = Math.min(100, Math.round((state.xp / state.xpToNext) * 100));

  const content = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5" data-testid="sidebar-logo">
          <div className="w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-zinc-950"
               style={{ background: '#f59e0b' }}>at</div>
          <div>
            <div className="font-mono text-base font-semibold tracking-tight text-zinc-50">AskTaaza</div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-zinc-600 font-mono">interview prep</div>
          </div>
        </div>
        <button className="md:hidden text-zinc-400" onClick={() => setMobileOpen(false)} aria-label="close menu"><X size={18} /></button>
      </div>

      {/* Workspace label + nav */}
      <div className="px-3 pt-6 flex-1">
        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-600 font-mono px-3 mb-2">Workspace</div>
        <nav className="space-y-1" data-testid="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.to}
                data-testid={`nav-${item.key}`}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-l-2 ${
                    isActive
                      ? 'bg-amber-500/[0.06] text-zinc-50 font-medium border-l-amber-500'
                      : 'border-l-transparent text-zinc-400 hover:text-zinc-50 hover:bg-white/5'
                  }`
                }
              >
                <Icon size={15} strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                {item.badge && state.dueToday > 0 && (
                  <span data-testid="review-badge"
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {state.dueToday}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User card */}
      <div className="px-3 pb-4 pt-4 border-t border-white/5">
        <div className="flex items-start gap-3 p-2.5 rounded-md hover:bg-white/[0.03] transition-colors" data-testid="sidebar-user">
          <div className="w-10 h-10 rounded-md flex items-center justify-center font-mono text-sm font-semibold shrink-0"
               style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
            {user?.avatarInitials || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-zinc-50">{user?.name?.split(' ')[0] || 'Guest'}</div>
            <div className="text-[9px] uppercase tracking-[0.18em] text-zinc-600 font-mono mt-0.5">Level {state.level} candidate</div>
          </div>
          <button data-testid="sign-out" onClick={handleSignOut} className="text-zinc-600 hover:text-zinc-50 transition-colors p-1">
            <LogOut size={14} />
          </button>
        </div>

        {/* progress */}
        <div className="mt-3 px-1">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="text-zinc-600 uppercase tracking-[0.18em]">Progress</span>
            <span className="text-amber-500 font-medium">{progressPct}%</span>
          </div>
          <PixelBar value={progressPct} width={208} height={10} color="#f59e0b" />
        </div>

        {/* streak + completed */}
        <div className="mt-4 px-1 flex items-center gap-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 text-zinc-300">
            <Flame size={12} className="text-amber-500" fill="currentColor" />
            <span className="text-zinc-50">{state.streak}</span>
            <span className="text-zinc-600">day streak</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-zinc-300">
            <Check size={12} className="text-emerald-400" strokeWidth={2.5} />
            <span className="text-zinc-50">{state.reviewedToday}</span>
            <span className="text-zinc-600">completed</span>
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-white/5 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(true)} data-testid="mobile-menu" className="text-zinc-300"><Menu size={20} /></button>
          <div className="font-mono font-semibold">AskTaaza</div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Flame size={12} className="text-amber-500" fill="currentColor" />
          <span className="font-mono">{state.streak}</span>
        </div>
      </div>

      {/* Desktop */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40 bg-black border-r border-white/5">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-black border-r border-white/5 flex flex-col animate-fade-up">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
