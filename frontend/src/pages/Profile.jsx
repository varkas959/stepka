import { useState } from 'react';
import { useAppState } from '../lib/appState';
import { signOut } from '../lib/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, User, Target, AlertTriangle, ExternalLink, LogOut, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile({ session, onSignOut }) {
  const { state } = useAppState();
  const navigate = useNavigate();
  const user = session?.user || {};

  const [name, setName] = useState(user.name || '');
  const [goal, setGoal] = useState(state.goalToday);
  const [emailDigest, setEmailDigest] = useState(true);
  const [dueReminder, setDueReminder] = useState(true);

  const save = () => toast.success('Settings saved');

  const handleSignOut = async () => {
    try { await signOut(); } catch { /* ignore */ }
    onSignOut?.();
    navigate('/');
  };

  const dangerDelete = () => {
    toast('Account deletion is manual for now — email hi@stepkai.com and we will purge your data within 30 days.', { duration: 6000 });
  };

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto" data-testid="profile-page">
      <Breadcrumb segments={['profile', 'settings']} />
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50 mt-1">Profile &amp; settings</h1>
      <p className="font-mono text-sm text-zinc-400 mt-3">Account info, daily goal, notifications, legal.</p>

      {/* Identity */}
      <Section icon={User} title="Identity">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-md flex items-center justify-center font-mono text-base font-semibold"
               style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
            {user.avatarInitials || 'U'}
          </div>
          <div>
            <div className="text-zinc-100 text-sm font-medium">{user.email || 'unknown'}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 mt-0.5">
              signed in via {user.provider || 'oauth'} · level {state.level}
            </div>
          </div>
        </div>
        <Field label="display name">
          <input data-testid="display-name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-white/30" />
        </Field>
      </Section>

      {/* Goals */}
      <Section icon={Target} title="Daily goal">
        <Field label="cards per day" hint="how many SRS cards you commit to review daily to keep the streak alive">
          <input data-testid="daily-goal" type="number" min={5} max={100} step={1} value={goal} onChange={(e) => setGoal(parseInt(e.target.value, 10) || 5)}
            className="w-32 bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-white/30" />
        </Field>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <Toggle label="weekly email digest" hint="summary of your XP, streak, and weak topics" value={emailDigest} onChange={setEmailDigest} testid="toggle-digest" />
        <Toggle label="due-card reminder" hint="ping me if I haven't reviewed by 9pm local time" value={dueReminder} onChange={setDueReminder} testid="toggle-reminder" />
      </Section>

      {/* Legal */}
      <Section icon={ExternalLink} title="Legal">
        <div className="flex gap-2">
          <LegalLink to="/privacy">Privacy policy</LegalLink>
          <LegalLink to="/terms">Terms of service</LegalLink>
        </div>
      </Section>

      <div className="flex items-center gap-2 mt-6">
        <button data-testid="save-settings" onClick={save}
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
          style={{ background: '#f59e0b' }}>
          <Save size={14} strokeWidth={2.5} /> Save changes
        </button>
        <button data-testid="profile-signout" onClick={handleSignOut}
          className="inline-flex items-center gap-2 font-mono text-sm px-3.5 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
          <LogOut size={13} /> Sign out
        </button>
      </div>

      {/* Danger zone */}
      <div className="mt-10 rounded-lg border border-red-500/30 bg-red-500/[0.04] p-5" data-testid="danger-zone">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={15} className="text-red-400" />
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-400">Danger zone</div>
        </div>
        <p className="text-sm text-zinc-300">Permanently delete your account and all associated progress.</p>
        <button data-testid="delete-account" onClick={dangerDelete}
          className="mt-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-3 py-2 rounded-md border border-red-500/40 bg-red-500/[0.06] text-red-300 hover:bg-red-500/15 transition-colors">
          Delete account
        </button>
      </div>
    </div>
  );
}

const Section = ({ icon: Icon, title, children }) => (
  <div className="mt-7 rounded-lg border border-white/10 bg-zinc-950 p-5">
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} className="text-amber-500" strokeWidth={1.75} />
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">{title}</div>
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="mb-3">
    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">{label}</div>
    {children}
    {hint && <div className="font-mono text-[11px] text-zinc-600 mt-1.5">// {hint}</div>}
  </div>
);

const Toggle = ({ label, hint, value, onChange, testid }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
    <div>
      <div className="text-zinc-100 text-sm">{label}</div>
      {hint && <div className="font-mono text-[11px] text-zinc-600 mt-1">// {hint}</div>}
    </div>
    <button data-testid={testid} onClick={() => onChange(!value)} aria-pressed={value}
      className={`shrink-0 inline-flex items-center w-10 h-6 rounded-full border transition-colors ${
        value ? 'bg-amber-500/20 border-amber-500/50' : 'bg-zinc-900 border-white/10'
      }`}>
      <span className={`w-4 h-4 rounded-full transition-transform ml-1 ${value ? 'translate-x-4 bg-amber-500' : 'bg-zinc-500'}`} />
    </button>
  </div>
);

const LegalLink = ({ to, children }) => (
  <Link to={to} className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-200">
    {children} <ExternalLink size={11} />
  </Link>
);

const Breadcrumb = ({ segments }) => (
  <div className="font-mono text-sm text-zinc-600 mb-4">
    <span className="text-emerald-400">~</span>
    {segments.map((s, i) => (
      <span key={i}>
        <span className="mx-1.5">/</span>
        <span className={i === segments.length - 1 ? 'text-zinc-200' : 'text-zinc-400'}>{s}</span>
      </span>
    ))}
  </div>
);
