import { NavLink, Link } from 'react-router-dom';
import { BookOpen, RotateCcw, LayoutGrid, Terminal, BarChart2, Flame, Check, Menu, X, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useAppState } from '../lib/appState';

const BG  = '#0C0E14';
const BG2 = '#141720';
const BDR = '#272B3F';
const T1  = '#F2F2F4';
const T2  = '#8B8FA8';
const T3  = '#4B5270';
const ACC = '#3B6FD4';

const navItems = [
  { to: '/app/questions', label: 'Question Bank', icon: BookOpen,   key: 'questions' },
  { to: '/app/review',    label: 'Daily Review',  icon: RotateCcw,  key: 'review',   badge: true },
  { to: '/app/plan',      label: 'Study Plan',    icon: LayoutGrid, key: 'plan' },
  { to: '/app/practice',  label: 'Practice',      icon: Terminal,   key: 'practice' },
  { to: '/app/progress',  label: 'Progress',      icon: BarChart2,  key: 'progress' },
];

export const Sidebar = ({ user, isGuest }) => {
  const { state } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);

  const progressPct = Math.min(100, Math.round((state.xp / state.xpToNext) * 100));

  const content = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BDR}` }}>
        <div className="flex items-center gap-2.5" data-testid="sidebar-logo">
          <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white" style={{ background: ACC }}>S</div>
          <div>
            <div className="text-sm font-semibold" style={{ color: T1 }}>Stepkai</div>
            <div className="text-[10px]" style={{ color: T3 }}>Interview prep</div>
          </div>
        </div>
        <button className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="close menu" style={{ color: T2 }}>
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <div className="px-3 pt-5 flex-1">
        <div className="text-[10px] font-medium uppercase tracking-widest px-3 mb-3" style={{ color: T3, letterSpacing: '0.12em' }}>Workspace</div>
        <nav className="space-y-0.5" data-testid="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.to}
                data-testid={`nav-${item.key}`}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? 'font-medium' : ''
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? `${ACC}18` : 'transparent',
                  color: isActive ? T1 : T2,
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} strokeWidth={1.75} style={{ color: isActive ? ACC : T3 }} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && state.dueToday > 0 && (
                      <span data-testid="review-badge"
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                            style={{ background: `${ACC}20`, color: ACC, border: `1px solid ${ACC}40` }}>
                        {state.dueToday}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Feedback */}
      <div className="px-3 pb-2">
        <NavLink to="/feedback" onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors"
          style={({ isActive }) => ({ color: isActive ? T1 : T3, background: isActive ? `${ACC}18` : 'transparent' })}>
          <MessageSquare size={15} strokeWidth={1.75} />
          <span>Feedback</span>
        </NavLink>
      </div>

      {/* User / Sign in */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: `1px solid ${BDR}` }}>
        {isGuest ? (
          <Link to="/signin" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: ACC }}>
            Sign in to track progress
          </Link>
        ) : (
          <>
            <Link to="/app/profile" onClick={() => setMobileOpen(false)} data-testid="sidebar-user"
              className="flex items-start gap-3 p-2 rounded-md transition-colors hover:bg-white/5">
              <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ background: `${ACC}20`, color: ACC, border: `1px solid ${ACC}30` }}>
                {user?.avatarInitials || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: T1 }}>{user?.name?.split(' ')[0] || 'User'}</div>
                <div className="text-[10px] mt-0.5" style={{ color: T3 }}>Level {state.level}</div>
              </div>
            </Link>

            {/* XP bar */}
            <div className="mt-3 px-2">
              <div className="flex items-center justify-between text-[10px] mb-1.5" style={{ color: T3 }}>
                <span>XP progress</span>
                <span className="font-mono" style={{ color: T2 }}>{progressPct}%</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: BDR }}>
                <div className="h-1 rounded-full transition-all" style={{ width: `${progressPct}%`, background: ACC }} />
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-3 px-2 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5" style={{ color: T2 }}>
                <Flame size={11} style={{ color: '#F59E0B' }} />
                <span className="font-mono" style={{ color: T1 }}>{state.streak}</span>
                <span style={{ color: T3 }}>streak</span>
              </span>
              <span className="flex items-center gap-1.5" style={{ color: T2 }}>
                <Check size={11} style={{ color: '#22C55E' }} strokeWidth={2.5} />
                <span className="font-mono" style={{ color: T1 }}>{state.reviewedToday}</span>
                <span style={{ color: T3 }}>today</span>
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-sm h-14 flex items-center justify-between px-4"
           style={{ background: `${BG}F0`, borderBottom: `1px solid ${BDR}` }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} data-testid="mobile-menu" style={{ color: T2 }}><Menu size={20} /></button>
          <div className="text-sm font-semibold" style={{ color: T1 }}>Stepkai</div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono" style={{ color: T2 }}>
          <span className="flex items-center gap-1"><Flame size={11} style={{ color: '#F59E0B' }} />{state.streak}</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col fixed inset-y-0 left-0 z-40"
             style={{ background: BG2, borderRight: `1px solid ${BDR}` }}>
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-60 flex flex-col animate-fade-up"
                 style={{ background: BG2, borderRight: `1px solid ${BDR}` }}>
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
