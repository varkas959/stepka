import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, Check, X, GitMerge, Pencil, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { loadMyRole, adminAction } from '../lib/pipeline';

const diffColor = d => d === 'Hard' ? 'var(--diff-hard)' : d === 'Easy' ? 'var(--diff-easy)' : 'var(--diff-medium)';

export default function AdminReview() {
  const [role, setRole] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null);
  const [editBody, setEditBody] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadMyRole().then(r => {
      setRole(r);
      if (['admin', 'moderator'].includes(r)) refresh();
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setLoading(true);
    try { const { pending } = await adminAction('list'); setPending(pending); setSelected(new Set()); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const drop = (id) => setPending(p => p.filter(x => x.id !== id));

  const single = async (action, payload, msg) => {
    setBusy(true);
    try { await adminAction(action, payload); drop(payload.id); toast.success(msg); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const batchApprove = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    setBusy(true);
    try { const { approved } = await adminAction('batch_approve', { ids }); toast.success(`Approved ${approved}.`); await refresh(); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const saveEdit = async (id) => {
    setBusy(true);
    try { await adminAction('edit', { id, fields: { body: editBody } }); setPending(p => p.map(x => x.id === id ? { ...x, body: editBody } : x)); setEditing(null); toast.success('Saved.'); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const toggle = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading && role === null) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page)', color: 'var(--text-3)' }}><Loader2 className="animate-spin" /></div>;
  }
  if (!['admin', 'moderator'].includes(role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4" style={{ background: 'var(--page)' }}>
        <ShieldCheck size={28} style={{ color: 'var(--text-3)' }} />
        <div className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>Not authorized</div>
        <Link to="/app/questions" className="font-mono text-sm" style={{ color: 'var(--accent)' }}>← Back to app</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--page)', color: 'var(--text-1)' }}>
      <Helmet><title>Review queue · Stepkai</title><meta name="robots" content="noindex" /></Helmet>

      <header className="sticky top-0 z-20 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-sm"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-blur)' }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
          <span className="font-semibold text-sm">Review queue</span>
          <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>{pending.length} pending · {role}</span>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={batchApprove} disabled={busy}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-md text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
              <Check size={14} /> Approve {selected.size}
            </button>
          )}
          <button onClick={refresh} disabled={busy} className="text-sm px-3 py-2 rounded-md border" style={{ borderColor: 'var(--border-2)', color: 'var(--text-2)' }}>Refresh</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {loading ? (
          <div className="flex items-center gap-2 font-mono text-sm py-10" style={{ color: 'var(--text-3)' }}><Loader2 size={14} className="animate-spin" /> Loading queue…</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-20">
            <Check size={28} className="mx-auto mb-3" style={{ color: 'var(--diff-easy)' }} />
            <div className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>Queue clear</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>No drafts awaiting review.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(q => {
              const isDup = q.dupSimilarity >= 0.8 && q.dupBody;
              return (
                <div key={q.id} className="rounded-lg p-4" style={{ border: `1px solid ${isDup ? 'rgba(217,162,74,0.35)' : 'var(--border)'}`, background: 'var(--surface)' }}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggle(q.id)} className="mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      {editing === q.id ? (
                        <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={3}
                          className="w-full rounded-md p-2 text-sm mb-2" style={{ border: '1px solid var(--border-2)', background: 'var(--inset)', color: 'var(--text-1)' }} />
                      ) : (
                        <p className="text-[15px] font-medium leading-snug mb-2" style={{ color: 'var(--text-1)' }}>{q.body}</p>
                      )}

                      <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-[11px] mb-2" style={{ color: 'var(--text-3)' }}>
                        {q.company && <span style={{ color: 'var(--text-2)' }}>{q.company}</span>}
                        {q.role && <><span>·</span><span>{q.role}</span></>}
                        <span>·</span><span>{q.round}</span><span>·</span><span>{q.topic}</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium" style={{ border: `1px solid ${diffColor(q.difficulty)}55`, color: diffColor(q.difficulty) }}>{q.difficulty}</span>
                        {q.category && <span>· {q.category}</span>}
                        {typeof q.confidence === 'number' && <span>· {Math.round(q.confidence * 100)}% conf</span>}
                        {q.isFollowUp && <span style={{ color: 'var(--text-2)' }}>· follow-up</span>}
                      </div>

                      {isDup && (
                        <div className="text-[11px] rounded px-2 py-1.5 mb-2 leading-snug" style={{ background: 'rgba(217,162,74,0.08)', border: '1px solid rgba(217,162,74,0.25)', color: 'var(--diff-medium)' }}>
                          Likely duplicate · {Math.round(q.dupSimilarity * 100)}% — “{q.dupBody.length > 110 ? q.dupBody.slice(0, 109) + '…' : q.dupBody}”
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {editing === q.id ? (
                          <>
                            <button onClick={() => saveEdit(q.id)} disabled={busy} className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-white" style={{ background: 'var(--accent)' }}>Save</button>
                            <button onClick={() => setEditing(null)} className="text-xs px-2.5 py-1.5 rounded-md border" style={{ borderColor: 'var(--border-2)', color: 'var(--text-3)' }}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => single('approve', { id: q.id }, 'Published.')} disabled={busy}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md text-white disabled:opacity-50" style={{ background: 'var(--diff-easy)' }}>
                              <Check size={12} /> Approve
                            </button>
                            <button onClick={() => { setEditing(q.id); setEditBody(q.body); }}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border" style={{ borderColor: 'var(--border-2)', color: 'var(--text-2)' }}>
                              <Pencil size={12} /> Edit
                            </button>
                            {isDup && (
                              <button onClick={() => single('merge', { id: q.id, targetId: q.dupMatchId }, 'Merged.')} disabled={busy}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border" style={{ borderColor: 'var(--border-2)', color: 'var(--diff-medium)' }}>
                                <GitMerge size={12} /> Merge
                              </button>
                            )}
                            <button onClick={() => single('reject', { id: q.id }, 'Rejected.')} disabled={busy}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border" style={{ borderColor: 'var(--border-2)', color: 'var(--diff-hard)' }}>
                              <X size={12} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
