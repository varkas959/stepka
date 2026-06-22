import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, X, Clock, ArrowRight, Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';

const C = {
  bg: 'var(--page)', bg2: 'var(--surface)', bg3: 'var(--surface-2)',
  border: 'var(--border)', border2: 'var(--border-2)',
  text1: 'var(--text-1)', text2: 'var(--text-2)', text3: 'var(--text-3)',
  accent: 'var(--accent)', green: '#22C55E', amber: '#F59E0B', red: '#EF4444',
};

function scoreColor(s) { return s >= 75 ? C.green : s >= 50 ? C.amber : C.red; }
function scoreLabel(s) { return s >= 75 ? 'Loop Ready' : s >= 50 ? 'Interview Ready' : 'Needs Prep'; }
function prepLabel(weeks) {
  if (!weeks) return '3â€“5 weeks';
  if (weeks === 1) return '1 week Â· 30 min/day';
  return `${weeks} weeks Â· 45 min/day`;
}

export default function ReportPage() {
  const { slug } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/report-data/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const shareUrl = `${window.location.origin}/r/${slug}`;

  const copy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied');
  };

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="font-mono text-sm" style={{ color: C.text3 }}>Loading reportâ€¦</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="font-mono text-sm mb-4" style={{ color: C.text3 }}>Report not found.</div>
          <Link to="/" style={{ color: C.accent }} className="text-sm">? Home</Link>
        </div>
      </div>
    );
  }

  const strengths = (report.heatmap || []).filter(h => h.score >= 65).slice(0, 4);
  const gaps = (report.heatmap || []).filter(h => h.score < 50).sort((a, b) => a.score - b.score).slice(0, 4);
  const scoreClr = scoreColor(report.readiness);
  const date = new Date(report.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const ogTitle = `${report.company} ${report.role} Â· ${report.readiness}% Readiness Â· Stepkai`;
  const ogDesc = [
    strengths.length ? `Strengths: ${strengths.map(s => s.skill).join(', ')}.` : '',
    gaps.length ? `Gaps: ${gaps.map(g => g.skill).join(', ')}.` : '',
    `Estimated prep: ${prepLabel(report.prep_weeks)}.`,
  ].filter(Boolean).join(' ');

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text1 }}>
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDesc} />
      </Helmet>

      {/* Nav */}
      <header className="sticky top-0 z-10 backdrop-blur-sm" style={{ borderBottom: `1px solid ${C.border}`, background: 'var(--surface-blur)' }}>
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded text-xs font-bold text-white flex items-center justify-center font-mono" style={{ background: C.accent }}>S</div>
            <span className="font-semibold text-sm" style={{ color: C.text1 }}>Stepkai</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={copy} className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-md transition-opacity hover:opacity-80" style={{ border: `1px solid ${C.border}`, color: C.text2 }}>
              <Copy size={11} /> {copied ? 'Copied!' : 'Copy link'}
            </button>
            <Link to="/app/plan" className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: C.accent }}>
              Get yours <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6">
        {/* Report card */}
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}`, background: C.bg2 }}>
          {/* Header */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.text3 }}>Readiness Report</span>
            <span className="font-mono text-[10px]" style={{ color: C.text3 }}>{date}</span>
          </div>

          {/* Candidate + score */}
          <div className="px-5 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold" style={{ color: C.text1 }}>{report.company}</div>
                <div className="font-mono text-xs mt-0.5" style={{ color: C.text3 }}>{report.role} Â· Technical loop</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-semibold leading-none" style={{ fontSize: 44, color: scoreClr }}>
                  {report.readiness}<span style={{ fontSize: 22 }}>%</span>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] mt-1.5" style={{ color: scoreClr }}>
                  {scoreLabel(report.readiness)}
                </div>
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: C.bg3 }}>
              <div className="h-full rounded-full" style={{ width: `${report.readiness}%`, background: scoreClr }} />
            </div>
            {gaps.length > 0 && (
              <div className="font-mono text-[10px] mt-2" style={{ color: C.text3 }}>
                {gaps.length} gap{gaps.length > 1 ? 's' : ''} to close before loop
              </div>
            )}
          </div>

          {/* Strengths + gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="px-5 py-5" style={{ borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-4" style={{ color: C.green }}>Strengths</div>
              <div className="space-y-3">
                {strengths.length > 0 ? strengths.map(s => (
                  <div key={s.skill} className="flex items-center gap-2">
                    <Check size={12} strokeWidth={2.5} style={{ color: C.green, flexShrink: 0 }} />
                    <span className="text-sm flex-1" style={{ color: C.text2 }}>{s.skill}</span>
                    <span className="font-mono text-xs" style={{ color: C.green }}>{s.score}%</span>
                  </div>
                )) : <div className="text-xs" style={{ color: C.text3 }}>Complete an assessment to see strengths.</div>}
              </div>
            </div>
            <div className="px-5 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-4" style={{ color: C.red }}>Weak Areas</div>
              <div className="space-y-3">
                {gaps.length > 0 ? gaps.map(s => (
                  <div key={s.skill} className="flex items-center gap-2">
                    <X size={12} strokeWidth={2.5} style={{ color: C.red, flexShrink: 0 }} />
                    <span className="text-sm flex-1" style={{ color: C.text2 }}>{s.skill}</span>
                    <span className="font-mono text-xs" style={{ color: C.red }}>{s.score}%</span>
                  </div>
                )) : <div className="text-xs" style={{ color: C.green }}>No critical gaps found.</div>}
              </div>
            </div>
          </div>

          {/* Prep time */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ background: C.bg }}>
            <Clock size={13} style={{ color: C.text3 }} />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: C.text3 }}>Estimated Preparation</div>
              <div className="font-mono text-sm font-semibold mt-0.5" style={{ color: C.text1 }}>{prepLabel(report.prep_weeks)}</div>
            </div>
          </div>

          {report.summary && (
            <div className="px-5 py-4 text-sm leading-relaxed" style={{ borderTop: `1px solid ${C.border}`, color: C.text2 }}>
              {report.summary}
            </div>
          )}
        </div>

        {/* Share panel */}
        <div className="mt-5 rounded-lg p-5" style={{ border: `1px solid ${C.border}`, background: C.bg2 }}>
          <div className="flex items-center gap-2 mb-3">
            <Share2 size={12} style={{ color: C.text3 }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.text3 }}>Share this report</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-xs px-3 py-2 rounded-md truncate" style={{ background: C.bg3, color: C.text2, border: `1px solid ${C.border}` }}>{shareUrl}</div>
            <button onClick={copy} className="shrink-0 font-mono text-xs px-3 py-2 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: C.accent }}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
               target="_blank" rel="noopener noreferrer"
               className="flex-1 text-center font-mono text-xs py-2 rounded-md transition-opacity hover:opacity-80"
               style={{ border: `1px solid ${C.border}`, color: C.text2 }}>LinkedIn</a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`My ${report.company} ${report.role} readiness: ${report.readiness}%. Here's the breakdown:`)}`}
               target="_blank" rel="noopener noreferrer"
               className="flex-1 text-center font-mono text-xs py-2 rounded-md transition-opacity hover:opacity-80"
               style={{ border: `1px solid ${C.border}`, color: C.text2 }}>Twitter / X</a>
            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`My ${report.company} ${report.role} interview readiness: ${report.readiness}%. See the full breakdown: ${shareUrl}`)}`}
               target="_blank" rel="noopener noreferrer"
               className="flex-1 text-center font-mono text-xs py-2 rounded-md transition-opacity hover:opacity-80"
               style={{ border: `1px solid ${C.border}`, color: C.text2 }}>WhatsApp</a>
          </div>
        </div>

        {/* CTA for visitors */}
        <div className="mt-6 text-center">
          <div className="font-mono text-xs mb-4" style={{ color: C.text3 }}>Know your readiness before your next interview.</div>
          <Link to="/app/plan"
            className="inline-flex items-center gap-2 font-medium px-5 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ background: C.accent }}>
            Measure your readiness <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
