import { useState } from 'react';
import { signInWithProvider } from '../lib/auth';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const AUTH_BG = 'https://static.prod-images.emergentagent.com/jobs/6e0c1b0e-c9a7-49df-9644-8904e4e93206/images/4ff9432aa47a36bcc0feb0b76c6fa7b7cb9b21f93216690c53918b1c38062e86.png';

export const AuthGate = () => {
  const [loading, setLoading] = useState(null);

  const handle = async (provider) => {
    setLoading(provider);
    try {
      // signInWithProvider triggers a full browser redirect to the OAuth provider.
      // The redirect lands on /auth/callback which finalizes the session.
      await signInWithProvider(provider);
    } catch (e) {
      toast.error(e.message || 'Sign-in failed. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-zinc-950 relative overflow-hidden" data-testid="auth-gate">
      {/* Left visual */}
      <div className="hidden md:flex md:w-1/2 relative items-end p-12 grain"
           style={{ backgroundImage: `linear-gradient(180deg, rgba(9,9,11,0.4) 0%, rgba(9,9,11,0.85) 100%), url(${AUTH_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-white/10 bg-black/40 mb-6">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-300">Built for engineers in motion</span>
          </div>
          <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-zinc-50">
            Real questions.
            <br />
            <span className="text-zinc-500">From real loops.</span>
          </h1>
          <p className="mt-6 text-zinc-400 leading-relaxed max-w-sm">
            Stepkai is the question bank, study plan, and rep system for engineers preparing to switch companies.
            No fluff, no filler — just signal.
          </p>
          <div className="mt-10 flex gap-8 font-mono text-xs">
            <div>
              <div className="text-zinc-50 text-2xl font-semibold">12,800+</div>
              <div className="text-zinc-500 uppercase tracking-[0.18em] mt-1 text-[10px]">verified questions</div>
            </div>
            <div>
              <div className="text-zinc-50 text-2xl font-semibold">47</div>
              <div className="text-zinc-500 uppercase tracking-[0.18em] mt-1 text-[10px]">companies tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right auth card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-zinc-950" style={{ background: '#f59e0b' }}>sk</div>
            <div>
              <div className="font-mono text-lg font-semibold tracking-tight">Stepkai</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">interview prep</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Sign in to continue</h2>
            <p className="text-sm text-zinc-400 mt-2">Pick a provider. We use your name only — no spam, ever.</p>
          </div>

          <div className="space-y-2.5">
            <button
              data-testid="signin-google"
              disabled={loading !== null}
              onClick={() => handle('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-md bg-zinc-900 border border-white/10 text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {loading === 'google'
                ? <Loader2 size={16} className="animate-spin" />
                : <GoogleIcon />}
              <span className="text-sm font-medium">Continue with Google</span>
            </button>

            <button
              data-testid="signin-linkedin"
              disabled={loading !== null}
              onClick={() => handle('linkedin')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-md bg-zinc-900 border border-white/10 text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {loading === 'linkedin'
                ? <Loader2 size={16} className="animate-spin" />
                : <LinkedInIcon />}
              <span className="text-sm font-medium">Continue with LinkedIn</span>
            </button>
          </div>

          <div className="my-7 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">supabase oauth</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Sign-in is powered by Supabase Auth with Google &amp; LinkedIn OIDC. You will be redirected
            to the provider, then back here. We never see your password.
          </p>

          <p className="text-xs text-zinc-600 mt-10 font-mono">
            stepkai.com · v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M12 10.2v3.92h5.45c-.24 1.36-1.66 4-5.45 4-3.28 0-5.95-2.71-5.95-6.05S8.72 5.95 12 5.95c1.86 0 3.11.79 3.83 1.47l2.61-2.52C16.84 3.42 14.62 2.5 12 2.5 6.97 2.5 2.9 6.57 2.9 11.6S6.97 20.7 12 20.7c6.92 0 9.6-4.85 9.6-7.34 0-.5-.05-.87-.12-1.16H12z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.36V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
  </svg>
);
