import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { QUESTIONS, COMPANIES, ROLES, ROLE_MAP } from '../lib/mockData';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function CompaniesIndex() {
  const companies = COMPANIES
    .map(c => ({ ...c, count: QUESTIONS.filter(q => q.company === c.id).length }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Helmet>
        <title>Companies | Stepkai</title>
        <meta name="description" content="Browse real interview questions by company." />
        <link rel="canonical" href="https://www.stepkai.com/companies" />
      </Helmet>

      <header className="border-b border-white/5 sticky top-0 z-30 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-white text-xs" style={{ background: 'var(--accent)' }}>S</div>
            <span className="font-mono font-semibold text-sm">Stepkai</span>
          </Link>
          <Link to="/app/questions" className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--accent)' }}>
            Browse all <ArrowRight size={11} strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/app/questions" className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft size={12} /> Back to all questions
        </Link>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Companies</h1>
        <p className="text-zinc-400 mt-3 text-sm leading-relaxed max-w-2xl">
          {companies.length} companies with real interview questions submitted by engineers who went through the process.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          {companies.map(c => (
            <Link
              key={c.id}
              to={`/company/${slugify(c.name)}`}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-900/60 p-4 hover:border-white/25 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
                style={{ background: c.color + '1f', color: c.color }}
              >
                {c.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-zinc-100">{c.name}</div>
                <div className="font-mono text-[11px] text-zinc-500">{c.count} question{c.count === 1 ? '' : 's'}</div>
              </div>
              <ArrowRight size={14} className="text-zinc-600 shrink-0" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export function RolesIndex() {
  const roles = ROLES
    .map(r => ({ name: r, count: QUESTIONS.filter(q => (ROLE_MAP[q.role] || q.role) === r).length }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Helmet>
        <title>Roles | Stepkai</title>
        <meta name="description" content="Browse real interview questions by role." />
        <link rel="canonical" href="https://www.stepkai.com/roles" />
      </Helmet>

      <header className="border-b border-white/5 sticky top-0 z-30 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-white text-xs" style={{ background: 'var(--accent)' }}>S</div>
            <span className="font-mono font-semibold text-sm">Stepkai</span>
          </Link>
          <Link to="/app/questions" className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--accent)' }}>
            Browse all <ArrowRight size={11} strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/app/questions" className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft size={12} /> Back to all questions
        </Link>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Roles</h1>
        <p className="text-zinc-400 mt-3 text-sm leading-relaxed max-w-2xl">
          {roles.length} roles with real interview questions, from junior engineer to staff and beyond.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          {roles.map(r => (
            <Link
              key={r.name}
              to={`/role/${slugify(r.name)}`}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-900/60 p-4 hover:border-white/25 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(59,111,212,0.12)', color: '#7AA9F7' }}>
                <Building2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-zinc-100">{r.name}</div>
                <div className="font-mono text-[11px] text-zinc-500">{r.count} question{r.count === 1 ? '' : 's'}</div>
              </div>
              <ArrowRight size={14} className="text-zinc-600 shrink-0" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
