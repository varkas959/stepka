import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, FileText, TrendingUp, CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { COMPANIES, ROLES } from '../lib/mockData';
import { loadExperiences, computeIntelligence, attribution, slugify, loadRelatedQuestions } from '../lib/experiences';
import { ExperienceModal } from '../components/ExperienceModal';
import { getSession } from '../lib/auth';

const OUTCOME_META = {
  Selected: { color: '#22c55e', Icon: CheckCircle2 },
  Rejected: { color: '#ef4444', Icon: XCircle },
  Waiting:  { color: '#f59e0b', Icon: Clock },
};
const DIFF_LABEL = ['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'];

// Resolve a "company-role" slug by matching the longest company-slug prefix.
function parseCompanyRole(slug) {
  for (const c of COMPANIES) {
    const cs = slugify(c.name);
    if (slug === cs) return { company: c, role: null };
    if (slug.startsWith(cs + '-')) {
      const roleSlug = slug.slice(cs.length + 1);
      const role = ROLES.find(r => slugify(r) === roleSlug) || roleSlug.replace(/-/g, ' ');
      return { company: c, role: typeof role === 'string' ? role : role };
    }
  }
  return { company: null, role: null };
}

export default function InterviewIntelligence({ kind }) {
  const params = useParams();
  const [experiences, setExperiences] = useState(null);
  const [intel, setIntel] = useState(null);
  const [related, setRelated] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [scope, setScope] = useState({ companyName: '', role: '', title: '' });
  const [userId, setUserId] = useState(undefined);

  useEffect(() => { getSession().then(s => setUserId(s?.user?.id)); }, []);

  useEffect(() => {
    let companyName = null, role = null, title = '';
    if (kind === 'companyRole') {
      const { company, role: r } = parseCompanyRole(params.slug || '');
      companyName = company?.name || null;
      role = r || null;
      title = `${companyName || ''} ${role || ''}`.trim() + ' Interview Intelligence';
    } else if (kind === 'company') {
      const c = COMPANIES.find(x => slugify(x.name) === params.slug);
      companyName = c?.name || (params.slug || '').replace(/-/g, ' ');
      title = `${companyName} Interview Intelligence`;
    } else if (kind === 'role') {
      const r = ROLES.find(x => slugify(x) === params.slug);
      role = r || (params.slug || '').replace(/-/g, ' ');
      title = `${role} Interview Intelligence`;
    }
    setScope({ companyName, role, title });

    (async () => {
      const exps = await loadExperiences({ company: companyName || undefined, role: role || undefined });
      setExperiences(exps);
      setIntel(computeIntelligence(exps));
      setRelated(await loadRelatedQuestions({ company: companyName || undefined, role: role || undefined }));
    })();
  }, [kind, params.slug]);

  const refresh = async () => {
    const exps = await loadExperiences({ company: scope.companyName || undefined, role: scope.role || undefined });
    setExperiences(exps);
    setIntel(computeIntelligence(exps));
  };

  if (experiences === null) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;
  }

  const desc = `${intel.total} reported ${scope.companyName || ''} ${scope.role || ''} interview experiences. Rounds, most-asked questions, difficulty distribution, and outcomes from real candidates.`.replace(/\s+/g, ' ');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Helmet>
        <title>{scope.title} | Stepkai</title>
        <meta name="description" content={desc.slice(0, 155)} />
        <link rel="canonical" href={`https://www.stepkai.com${window.location.pathname}`} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <Link to="/app/questions" className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-300 mb-6"><ArrowLeft size={13} /> Question Bank</Link>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-purple-400 mb-2">Interview Intelligence</div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{scope.title}</h1>
            <p className="text-zinc-400 mt-2 text-sm">{desc}</p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold px-4 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity shrink-0"
            style={{ background: '#7C3AED' }}>
            <FileText size={14} /> Report your experience
          </button>
        </div>

        {intel.total === 0 ? (
          <div className="rounded-lg border border-white/10 bg-zinc-950 p-10 text-center">
            <p className="text-zinc-300 text-lg font-medium">No reports yet for {scope.companyName || scope.role}.</p>
            <p className="text-zinc-500 text-sm mt-2">Be the first to report â€” your experience becomes the baseline others learn from.</p>
            <button onClick={() => setModalOpen(true)} className="mt-5 inline-flex items-center gap-2 font-mono text-sm font-semibold px-4 py-2.5 rounded-md text-white" style={{ background: '#7C3AED' }}>
              <FileText size={14} /> Report the first experience
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stat row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Reported interviews" value={intel.total} />
              <Stat label="Avg difficulty" value={intel.avgDifficulty ? `${intel.avgDifficulty}/5` : 'â€”'} sub={intel.avgDifficulty ? DIFF_LABEL[Math.round(intel.avgDifficulty) - 1] : ''} />
              <Stat label="Selected" value={intel.outcomeFreq.Selected} color="#22c55e" />
              <Stat label="Rejected" value={intel.outcomeFreq.Rejected} color="#ef4444" />
            </div>

            {/* Difficulty distribution */}
            <Panel title="Difficulty distribution">
              <div className="space-y-2">
                {intel.difficultyDist.map((count, i) => {
                  const pct = intel.total ? Math.round((count / intel.total) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-3 font-mono text-xs">
                      <span className="w-20 text-zinc-400 shrink-0">{DIFF_LABEL[i]}</span>
                      <div className="flex-1 h-2 rounded bg-white/5 overflow-hidden"><div className="h-full rounded" style={{ width: `${pct}%`, background: '#7C3AED' }} /></div>
                      <span className="w-8 text-right text-zinc-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Common rounds */}
            {intel.commonRounds.length > 0 && (
              <Panel title="Most common rounds">
                <div className="flex flex-wrap gap-2">
                  {intel.commonRounds.map(r => (
                    <span key={r.name} className="font-mono text-xs px-2.5 py-1 rounded border border-white/10 text-zinc-300">
                      {r.name} <span className="text-zinc-600">Â· {r.count}</span>
                    </span>
                  ))}
                </div>
              </Panel>
            )}

            {/* Most asked topics */}
            {intel.topTopics.length > 0 && (
              <Panel title="Most asked topics">
                <div className="space-y-2">
                  {intel.topTopics.map(t => (
                    <div key={t.name} className="flex items-center gap-2 font-mono text-sm">
                      <TrendingUp size={12} className="text-purple-400 shrink-0" />
                      <span className="text-zinc-200">{t.name}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* Most reported questions */}
            {intel.topQuestions.length > 0 && (
              <Panel title="Most reported questions">
                <ol className="space-y-2.5">
                  {intel.topQuestions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-mono text-[11px] text-purple-400 mt-0.5 shrink-0">{q.count > 1 ? `${q.count}Ã—` : ''}</span>
                      <span className="text-zinc-200 text-sm leading-relaxed">{q.body}</span>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}

            {/* Related questions (linked to the Question Bank) */}
            {related.length > 0 && (
              <Panel title="Related questions in the bank">
                <div className="space-y-2.5">
                  {related.map((r, i) => (
                    <Link key={i} to={`/app/questions`} className="block rounded-md border border-white/8 bg-zinc-950 p-3 hover:border-white/20 transition-colors">
                      <p className="text-zinc-200 text-sm leading-relaxed">{r.body}</p>
                      {r.round && <div className="font-mono text-[10px] text-zinc-600 mt-1.5">{r.round}</div>}
                    </Link>
                  ))}
                </div>
              </Panel>
            )}

            {/* Related assessment CTA */}
            <div className="rounded-lg p-5" style={{ border: '1px solid rgba(59,111,212,0.3)', background: 'rgba(59,111,212,0.05)' }}>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-blue-300 mb-1.5">Related assessment</div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                Test yourself against {scope.companyName || scope.role} interview patterns and get a readiness score with a gap-driven study plan.
              </p>
              <Link to="/app/plan" className="inline-flex items-center gap-2 font-mono text-sm font-semibold px-4 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--accent)' }}>
                Take the assessment â†’
              </Link>
            </div>

            {/* Recent reports */}
            <Panel title="Recent interview reports">
              <div className="space-y-3">
                {intel.recent.map(exp => {
                  const om = OUTCOME_META[exp.outcome] || {};
                  const Icon = om.Icon;
                  return (
                    <div key={exp.id} className="rounded-md border border-white/8 bg-zinc-950 p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        {kind !== 'companyRole' && <span className="font-mono text-xs text-zinc-300">{exp.company} Â· {exp.role}</span>}
                        {Icon && <span className="inline-flex items-center gap-1 font-mono text-[11px]" style={{ color: om.color }}><Icon size={11} /> {exp.outcome}</span>}
                        {exp.difficulty && <span className="font-mono text-[11px] text-zinc-500">difficulty {exp.difficulty}/5</span>}
                        {exp.experienceYears && <span className="font-mono text-[11px] text-zinc-500">{exp.experienceYears}</span>}
                        <span className="ml-auto font-mono text-[11px] text-zinc-600">{exp.daysAgo === 0 ? 'Today' : `${exp.daysAgo}d ago`}</span>
                      </div>
                      <div className="font-mono text-[11px] text-zinc-500 mb-2">{exp.numRounds} round{exp.numRounds > 1 ? 's' : ''} Â· Reported by {attribution(exp)}</div>
                      {exp.notes && <p className="text-zinc-300 text-sm leading-relaxed">{exp.notes}</p>}
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        )}
      </div>

      <ExperienceModal open={modalOpen} onOpenChange={setModalOpen} onSubmitted={refresh}
        userId={userId} defaultRole={scope.role || undefined} />
    </div>
  );
}

const Stat = ({ label, value, sub, color }) => (
  <div className="rounded-lg border border-white/10 bg-zinc-950 p-4">
    <div className="font-mono text-2xl font-semibold" style={{ color: color || '#fafafa' }}>{value}</div>
    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 mt-1">{label}</div>
    {sub && <div className="font-mono text-[10px] text-zinc-600 mt-0.5">{sub}</div>}
  </div>
);

const Panel = ({ title, children }) => (
  <div className="rounded-lg border border-white/10 bg-zinc-950 p-5">
    <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-3">{title}</div>
    {children}
  </div>
);
