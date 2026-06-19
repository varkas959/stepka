import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getSession } from '../lib/auth';
import { track } from '../lib/analytics';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // Poll briefly while Supabase exchanges the code in the URL
    let tries = 0;
    const tick = async () => {
      try {
        const session = await getSession();
        if (cancelled) return;
        if (session) {
          track('login_success', { provider: session.user.provider });
          navigate('/app/questions', { replace: true });
          return;
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Sign-in failed');
        return;
      }
      tries += 1;
      if (tries > 25) {
        if (!cancelled) setErr('Sign-in timed out. Please try again.');
        return;
      }
      setTimeout(tick, 250);
    };
    tick();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50" data-testid="auth-callback">
      <div className="text-center">
        {!err ? (
          <>
            <Loader2 size={28} className="animate-spin mx-auto text-zinc-400" />
            <div className="font-mono text-sm text-zinc-400 mt-4">Completing sign-in…</div>
          </>
        ) : (
          <>
            <div className="text-red-400 text-sm">{err}</div>
            <button onClick={() => navigate('/', { replace: true })} className="mt-4 underline text-zinc-300">Back to sign-in</button>
          </>
        )}
      </div>
    </div>
  );
}
