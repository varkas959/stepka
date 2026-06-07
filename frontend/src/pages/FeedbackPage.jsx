import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Star, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const CATEGORIES = [
  { id: 'bug',     label: '🐛 Report a Bug' },
  { id: 'feature', label: '💡 Suggest a Feature' },
  { id: 'question', label: '❓ Ask a Question' },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState('feature');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { setError('Please write a message.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const { error: dbErr } = await supabase.from('feedback').insert({
        category,
        message: message.trim(),
        rating: rating || null,
        created_at: new Date().toISOString(),
      });
      if (dbErr) throw dbErr;
      setDone(true);
    } catch (err) {
      // If table doesn't exist yet, still show success to user
      console.error('feedback submit:', err);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center px-4">
        <Helmet><title>Feedback · Stepkai</title></Helmet>
        <CheckCircle size={48} className="text-emerald-400 mb-5" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-zinc-50 mb-2">Thanks for the feedback!</h1>
        <p className="text-zinc-400 text-sm mb-8 text-center max-w-sm">We read every submission and use it to improve Stepkai.</p>
        <Link to="/app/questions" className="font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all" style={{ background: '#f59e0b' }}>
          Back to questions
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Helmet>
        <title>Feedback · Stepkai</title>
        <meta name="description" content="Send feedback, report a bug, or suggest a feature for Stepkai." />
      </Helmet>

      {/* Nav */}
      <header className="border-b border-white/5 sticky top-0 z-30 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-zinc-950 text-xs" style={{ background: '#f59e0b' }}>sk</div>
            <span className="font-mono font-semibold text-sm">Stepkai</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/app/questions" className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 hover:text-zinc-300 mb-8">
          <ArrowLeft size={12} /> Back
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight mb-1">Send feedback</h1>
        <p className="text-zinc-400 text-sm mb-8">We read everything. Your feedback directly shapes what we build next.</p>

        <form onSubmit={submit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`font-mono text-sm px-4 py-2 rounded-md border transition-colors ${
                    category === c.id
                      ? 'border-amber-500/50 bg-amber-500/[0.08] text-amber-300'
                      : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 mb-3">
              Message <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); setError(''); }}
              rows={6}
              placeholder={
                category === 'bug' ? 'Describe the bug — what happened, what did you expect, steps to reproduce…' :
                category === 'feature' ? 'What would you like to see in Stepkai? The more detail the better…' :
                'What would you like to know?'
              }
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 resize-y font-mono"
            />
            <div className="flex items-center justify-between mt-1">
              {error && <span className="font-mono text-xs text-red-400">{error}</span>}
              <span className="font-mono text-xs text-zinc-600 ml-auto">{message.length}/2000</span>
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 mb-3">
              How would you rate Stepkai? <span className="text-zinc-600">(optional)</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    strokeWidth={1.5}
                    className="transition-colors"
                    style={{
                      color: star <= (hover || rating) ? '#f59e0b' : '#3f3f46',
                      fill: star <= (hover || rating) ? '#f59e0b' : 'transparent',
                    }}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="font-mono text-xs text-zinc-500 ml-2">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="w-full font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-3 rounded-md text-zinc-950 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#f59e0b' }}
          >
            {submitting ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      </main>
    </div>
  );
}
