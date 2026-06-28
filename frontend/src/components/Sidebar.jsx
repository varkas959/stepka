import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, RotateCcw, LayoutGrid, Terminal, BarChart2,
  Menu, X, MessageSquare, Sun, Moon, Plus,
  Home, CircleUser, Zap, Search, SlidersHorizontal,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppState } from '../lib/appState';
import { useTheme } from 'next-themes';

const BDR = 'var(--border)';
const T1  = 'var(--text-1)';
const T2  = 'var(--text-2)';
const T3  = 'var(--text-3)';
const ACC = 'var(--accent)';

const NAV = [
  { to: '/app/plan',      label: 'Study Plan',    Icon: LayoutGrid, key: 'plan'      },
  { to: '/app/questions', label: 'Question Bank', Icon: BookOpen,   key: 'questions' },
  { to: '/app/review',    label: 'Daily Review',  Icon: RotateCcw,  key: 'review',   badge: true },
  { to: '/app/practice',  label: 'Practice',      Icon: Terminal,   key: 'practice'  },
  { to: '/app/progress',  label: 'Progress',      Icon: BarChart2,  key: 'progress'  },
];

export const Sidebar = ({ user, isGuest, onSignOut }) => {
  const { state } = useAppState();
  const { theme, setTheme } = useTheme();
  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState('');
  const [filterCount, setFilterCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const onQuestions = location.pathname === '/app/questions';
  const progressPct = Math.min(100, Math.round((state.xp / state.xpToNext) * 100));

  useEffect(() => {
    const h = () => setMobileOpen(true);
    window.addEventListener('stepkai:open-menu', h);
    return () => window.removeEventListener('stepkai:open-menu', h);
  }, []);

  useEffect(() => {
    const h = (e) => setFilterCount(e.detail?.count ?? 0);
    window.addEventListener('stepkai:filter-count', h);
    return () => window.removeEventListener('stepkai:filter-count', h);
  }, []);

  const handleDesktopSearch = (val) => {
    setDesktopSearch(val);
    navigate(`/app/questions${val ? `?q=${encodeURIComponent(val)}` : ''}`);
  };

  // ── Shared nav content (used in both desktop sidebar and mobile drawer) ──
  const navContent = (
    <>
      <div className="px-3 pt-4 flex-1 overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] px-2 mb-2" style={{ color: T3 }}>
          Workspace
        </div>
        <nav className="space-y-0.5" data-testid="sidebar-nav">
          {NAV.map(({ to, label, Icon, key, badge }) => (
            <NavLink
              key={key}
              to={to}
              end={key === 'plan'}
              data-testid={`nav-${key}`}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'font-medium' : ''}`
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-12)' : 'transparent',
                color: isActive ? ACC : T2,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.7} style={{ color: isActive ? ACC : T3 }} />
                  <span className="flex-1">{label}</span>
                  {badge && state.dueToday > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                          style={{ background: 'var(--accent-20)', color: ACC, border: '1px solid var(--accent-35)' }}>
                      {state.dueToday}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="px-3 pb-3 pt-2 border-t" style={{ borderColor: BDR }}>
        <NavLink to="/feedback" onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
          style={({ isActive }) => ({ color: isActive ? ACC : T3, background: isActive ? 'var(--accent-12)' : 'transparent' })}>
          <MessageSquare size={15} strokeWidth={1.7} />
          <span>Feedback</span>
        </NavLink>
        <button onClick={toggle} data-testid="theme-toggle"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full hover:bg-white/5 transition-colors"
          style={{ color: T3 }}>
          {theme === 'dark' ? <Sun size={15} strokeWidth={1.7} /> : <Moon size={15} strokeWidth={1.7} />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* User */}
        {isGuest ? (
          <Link to="/signin" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2 mt-1 rounded-lg text-sm font-medium text-white"
            style={{ background: ACC }}>
            Sign in
          </Link>
        ) : (
          <Link to="/app/profile" onClick={() => setMobileOpen(false)} data-testid="sidebar-user"
            className="flex items-center gap-3 px-2 py-2 mt-1 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0"
                 style={{ background: 'var(--accent-20)', color: ACC, border: '1px solid var(--accent-35)' }}>
              {user?.avatarInitials || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: T1 }}>{user?.name?.split(' ')[0] || 'User'}</div>
              <div className="text-[10px]" style={{ color: T3 }}>Level {state.level} · {state.streak} streak</div>
            </div>
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop top bar ── */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 items-center gap-4 px-4"
              style={{ background: 'var(--surface)', borderBottom: `1px solid ${BDR}` }}>
        {/* Logo area — matches sidebar width */}
        <Link to="/app/plan" className="flex items-center gap-2.5 w-52 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
               style={{ background: ACC }}>S</div>
          <span className="font-semibold text-[15px]" style={{ color: T1 }}>Stepkai</span>
        </Link>

        {/* Search pill */}
        <div className="flex-1 max-w-[440px] flex items-center gap-2.5 rounded-full h-10 px-4 transition-colors"
             style={{ border: `1.5px solid var(--border-2)`, background: 'var(--inset)' }}>
          <Search size={14} style={{ color: T3, flexShrink: 0 }} />
          <input
            value={desktopSearch}
            onChange={e => handleDesktopSearch(e.target.value)}
            placeholder="Search interview questions…"
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:opacity-35"
            style={{ color: T1 }}
          />
          {desktopSearch && (
            <button onClick={() => handleDesktopSearch('')} style={{ color: T3 }}><X size={14} /></button>
          )}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2.5">
          {/* + Contribute */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('stepkai:contribute'))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: ACC }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Contribute
          </button>

          {/* Filter — only relevant on questions page */}
          {onQuestions && (
            <button onClick={() => window.dispatchEvent(new CustomEvent('stepkai:open-filters'))}
                    title="Filters" className="relative w-9 h-9 flex items-center justify-center rounded-lg border transition-colors hover:bg-white/5"
                    style={{ borderColor: filterCount > 0 ? ACC : BDR, color: filterCount > 0 ? ACC : T3 }}>
              <SlidersHorizontal size={17} strokeWidth={1.7} />
              {filterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                      style={{ background: ACC }}>{filterCount}</span>
              )}
            </button>
          )}

          {/* Theme */}
          <button onClick={toggle} title="Toggle theme"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors hover:bg-white/5"
                  style={{ borderColor: BDR, color: T3 }}>
            {theme === 'dark' ? <Sun size={17} strokeWidth={1.7} /> : <Moon size={17} strokeWidth={1.7} />}
          </button>

          {/* User avatar */}
          {isGuest ? (
            <Link to="/signin"
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
                  style={{ borderColor: BDR, color: T1 }}>
              Log in
            </Link>
          ) : (
            <Link to="/app/profile" data-testid="topbar-user"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ background: 'var(--accent-20)', color: ACC, border: `1px solid var(--accent-35)` }}>
              {user?.avatarInitials || 'U'}
            </Link>
          )}
        </div>
      </header>

      {/* ── Desktop sidebar (below top bar) ── */}
      <aside className="hidden md:flex w-52 flex-col fixed top-14 bottom-0 left-0 z-40"
             style={{ background: 'var(--surface)', borderRight: `1px solid ${BDR}` }}>
        {navContent}
      </aside>

      {/* ── Mobile top bar (hidden on questions page) ── */}
      {!onQuestions && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-sm h-14 flex items-center justify-between px-4"
             style={{ background: 'var(--surface-blur)', borderBottom: `1px solid ${BDR}` }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} data-testid="mobile-menu" style={{ color: T2 }}>
              <Menu size={20} />
            </button>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                 style={{ background: ACC }}>S</div>
          </div>
        </div>
      )}

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0" style={{ background: 'rgba(6,8,12,0.92)' }} onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[82%] max-w-[300px] flex flex-col"
                 style={{ background: 'var(--surface)', borderRight: `1px solid ${BDR}` }}>
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: BDR }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                     style={{ background: ACC }}>S</div>
                <span className="font-semibold text-sm" style={{ color: T1 }}>Stepkai</span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ color: T2 }}><X size={18} /></button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch h-[60px]"
           style={{ background: 'var(--surface)', borderTop: `1px solid ${BDR}` }}
           data-testid="mobile-bottom-nav">
        {[
          { to: '/app/plan',      label: 'Home',      Icon: Home,       end: true },
          { to: '/app/questions', label: 'Questions', Icon: BookOpen,   end: true },
          { to: '/app/practice',  label: 'Prepare',   Icon: Zap,        end: true },
          { to: '/app/profile',   label: 'Profile',   Icon: CircleUser, end: true },
        ].map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={!!end}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={({ isActive }) => ({ color: isActive ? ACC : T3 })}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center justify-center w-10 h-7 rounded-2xl transition-colors"
                     style={{ background: isActive ? 'rgba(59,111,212,0.12)' : 'transparent' }}>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                </div>
                <span className="text-[10px]" style={{ fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};
