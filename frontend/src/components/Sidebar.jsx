import { NavLink, useNavigate } from 'react-router-dom';
import { Database, Brain, Calendar, Code2, BarChart3, Flame, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAppState } from '../lib/appState';
import { signOut } from '../lib/auth';

const navItems = [
  { to: '/app/questions', label: 'Question Bank', icon: Database, key: 'questions' },
  { to: '/app/review', label: 'Daily Review', icon: Brain, key: 'review', badge: true },
  { to: '/app/plan', label: 'Study Plan', icon: Calendar, key: 'plan' },
  { to: '/app/practice', label: 'Practice', icon: Code2, key: 'practice' },
  { to: '/app/progress', label: 'Progress', icon: BarChart3, key: 'progress' },
];

export const Sidebar = ({ user, onSignOut }) => {
  const { state } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    onSignOut?.();
    navigate('/');
  };

  const content = (
    <>
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5" data-testid="sidebar-logo">
          <div className="w-8 h-8 rounded-md bg-white text-zinc-950 flex items-center justify-center font-mono font-bold">at</div>
          <div>
            <div className="font-mono text-base font-semibold tracking-tight">AskTaaza</div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-zinc-500">interview prep</div>
          </div>
        </div>
        <button className="md:hidden text-zinc-400" onClick={() => setMobileOpen(false)} aria-label="close menu"><X size={18} /></button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5" data-testid="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.to}
              data-testid={`nav-${item.key}`}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-zinc-50'
                    : 'text-zinc-400 hover:text-zinc-50 hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {item.badge && state.dueToday > 0 && (
                <span data-testid="review-badge" className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  {state.dueToday}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors" data-testid="sidebar-user">
          <div className="w-9 h-9 rounded-md bg-zinc-800 border border-white/10 flex items-center justify-center font-mono text-xs font-semibold">
            {user?.avatarInitials || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || 'Guest'}</div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Flame size={12} className="text-amber-400" fill="currentColor" />
              <span className="font-mono">{state.streak}</span>
              <span className="text-zinc-600">day streak</span>
            </div>
          </div>
          <button data-testid="sign-out" onClick={handleSignOut} className="text-zinc-500 hover:text-zinc-50 transition-colors p-1.5">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-white/10 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(true)} data-testid="mobile-menu" className="text-zinc-300"><Menu size={20} /></button>
          <div className="font-mono font-semibold">AskTaaza</div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Flame size={12} className="text-amber-400" fill="currentColor" />
          <span className="font-mono">{state.streak}</span>
        </div>
      </div>

      {/* Desktop */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40 bg-black border-r border-white/10">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-black border-r border-white/10 flex flex-col animate-fade-up">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
