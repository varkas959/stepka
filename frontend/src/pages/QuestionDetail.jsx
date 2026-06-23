import { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Share2, Check, ArrowUpRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { QUESTIONS, COMPANIES, ROLE_MAP } from '../lib/mockData';
import { loadUserQuestions } from '../lib/questions';

const canonicalRole = (role) => ROLE_MAP[role] || role;
const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const diffVar = d => d === 'Hard' ? 'var(--diff-hard)' : d === 'Easy' ? 'var(--diff-easy)' : 'var(--diff-medium)';
const diffBg = d => d === 'Hard' ? 'rgba(225,128,128,0.06)' : d === 'Easy' ? 'rgba(34,197,94,0.06)' : 'rgba(217,162,74,0.06)';

export default function QuestionDetail() {
  const { id } = useParams();
  const [extra, setExtra] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserQuestions().then(setExtra).catch(() => {}).finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const pool = useMemo(() => [...extra, ...QUESTIONS], [extra]);
  const q = useMemo(() => pool.find(x => x.id === id), [pool, id]);

  const related = useMemo(() => {
    if (!q) return [];
    return pool
      .filter(x => x.id !== q.id && (x.topic === q.topic || x.company === q.company))
      .sort((a, b) => (a.topic === q.topic ? -1 : 1) - (b.topic === q.topic ? -1 : 1))
      .slice(0, 6);
  }, [pool, q]);

  const alsoAskedIn = useMemo(() => {
    if (!q) return [];
    const ids = new Set();
    pool.forEach(x => { if (x.topic === q.topic && x.company !== q.company) ids.add(x.company); });
    return COMPANIES.filter(c => ids.has(c.id)).slice(0, 8);
  }, [pool, q]);

  const share = async () => {
    const url = window.location.href;
    const data = { title: 'Interview question · Stepkai', text: q?.body?.slice(0, 120), url };
    if (navigator.share) { try { await navigator.share(data); } catch { /* dismissed */ } }
    else { try { await navigator.clipboard.writeText(url); toast.success('Link copied to clipboard'); } catch { toast.error('Could not copy link'); } }
  };

  if (!q) {
    return (
      <div className="px-4 md:px-10 py-10 max-w-3xl mx-auto">
        {loading ? (
          <div className="font-mono text-sm" style={{ color: 'var(--text-3)' }}>Loading question…</div>
        ) : (
          <div className="text-center py-20">
            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text-1)' }}>Question not found</div>
            <Link to="/app/questions" className="font-mono text-sm" style={{ color: 'var(--accent)' }}>← Back to question bank</Link>
          </div>
        )}
      </div>
    );
  }

  const company = COMPANIES.find(c => c.id === q.company);
  const companyName = company?.name || q.company;
  const role = canonicalRole(q.role);
  const criteria = Array.isArray(q.evaluation_criteria) ? q.evaluation_criteria : [];

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto">
      <Helmet>
        <title>{companyName} {role} interview question · Stepkai</title>
        <meta name="description" content={q.body.slice(0, 155)} />
      </Helmet>

      <Link to="/app/questions" className="inline-flex items-center gap-1.5 font-mono text-xs mb-6 hover:opacity-80"
        style={{ color: 'var(--text-3)' }}>
        <ArrowLeft size={13} /> Question bank
      </Link>

      {/* Metadata line */}
      <div className="flex items-center flex-wrap gap-x-2 gap-y-1.5 text-[13px] mb-4" style={{ color: 'var(--text-3)' }}>
        <Link to={`/company/${slugify(companyName)}`} className="font-medium hover:underline" style={{ color: 'var(--text-2)' }}>{companyName}</Link>
        <span aria-hidden>·</span>
        <span>{role}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded font-medium text-xs"
          style={{ border: `1px solid ${diffVar(q.difficulty)}55`, background: diffBg(q.difficulty), color: diffVar(q.difficulty) }}>
          {q.difficulty}
        </span>
        {q.verifyCount >= 3 && <span style={{ color: 'var(--diff-easy)' }}>✓ Verified</span>}
        {q.source && <><span aria-hidden>·</span><span>{q.source}</span></>}
      </div>

      {/* Question */}
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug mb-5" style={{ color: 'var(--text-1)' }}>
        {q.body}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-2.5 mb-8 flex-wrap">
        <Link to="/app/practice" data-testid="practice-this"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white transition-transform hover:-translate-y-0.5"
          style={{ background: 'var(--accent)', boxShadow: '0 8px 20px -10px var(--accent)' }}>
          <Sparkles size={15} /> Practice this question
        </Link>
        <button onClick={share} data-testid="share-question"
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border transition-colors hover:bg-white/[0.04]"
          style={{ borderColor: 'var(--border-2)', color: 'var(--text-1)' }}>
          <Share2 size={15} /> Share
        </button>
      </div>

      {/* Answer */}
      {q.answer && (
        <div className="rounded-xl p-5 mb-6" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--text-3)' }}>Model answer</div>
          <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-2)' }}>{q.answer}</p>
        </div>
      )}

      {/* What interviewers look for */}
      {criteria.length > 0 && (
        <div className="rounded-xl p-5 mb-10" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--text-3)' }}>What interviewers look for</div>
          <ul className="space-y-2.5">
            {criteria.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-2)' }}>
                <Check size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--diff-easy)' }} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related questions */}
      {related.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Related questions</h2>
          <div className="divide-y border-y" style={{ borderColor: 'var(--border)' }}>
            {related.map(r => (
              <Link key={r.id} to={`/app/question/${r.id}`}
                className="flex items-start gap-3 py-3.5 group transition-colors"
                style={{ borderColor: 'var(--border)' }}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                <span className="text-[15px] leading-snug transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-2)' }}>
                  {r.body}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Also asked in */}
      {alsoAskedIn.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Also asked in</h2>
          <div className="flex flex-wrap gap-2.5">
            {alsoAskedIn.map(c => (
              <Link key={c.id} to={`/company/${slugify(c.name)}`}
                className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="w-7 h-7 rounded-lg text-[11px] font-bold flex items-center justify-center"
                  style={{ background: c.color + '1f', color: c.color }}>{c.initials}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{c.name}</span>
                <ArrowUpRight size={13} style={{ color: 'var(--text-3)' }} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
