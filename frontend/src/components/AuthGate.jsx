import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithProvider } from '../lib/auth';
import { track } from '../lib/analytics';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const AUTH_BG = 'https://static.prod-images.emergentagent.com/jobs/6e0c1b0e-c9a7-49df-9644-8904e4e93206/images/4ff9432aa47a36bcc0feb0b76c6fa7b7cb9b21f93216690c53918b1c38062e86.png';

export const AuthGate = () => {
  const [loading, setLoading] = useState(null);

  const handle = async (provider) => {
    setLoading(provider);
    track('login_clicked', { provider });
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
            <Sparkles size={12} style={{ color: '#3B6FD4' }} />
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
              <div className="text-zinc-50 text-2xl font-semibold">60+</div>
              <div className="text-zinc-500 uppercase tracking-[0.18em] mt-1 text-[10px]">verified questions</div>
            </div>
            <div>
              <div className="text-zinc-50 text-2xl font-semibold">20</div>
              <div className="text-zinc-500 uppercase tracking-[0.18em] mt-1 text-[10px]">companies tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right auth card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-white" style={{ background: '#3B6FD4' }}>S</div>
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
            <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">single sign-on</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            By signing in you agree to our <Link to="/terms" className="text-zinc-200 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-zinc-200 hover:underline">Privacy Policy</Link>.
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
  <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.36V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
  </svg>
);
