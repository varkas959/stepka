import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { signInWithProvider } from '../lib/auth';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Shown when an anonymous visitor tries to do something that needs an account.
export const SignInRequiredModal = ({ open, onOpenChange, action = 'continue' }) => {
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const handle = async (provider) => {
    setLoading(provider);
    try { await signInWithProvider(provider); }
    catch (e) {
      toast.error(e.message || 'Sign-in failed. Please try again.');
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="signin-required-modal" className="max-w-md bg-zinc-950 border border-white/10 text-zinc-50">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-zinc-950 text-sm" style={{ background: '#f59e0b' }}>sk</div>
            <DialogTitle className="text-lg font-semibold tracking-tight">Sign in to {action}</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 mt-1">
            Pick a provider — Stepkai uses Supabase Auth, we never see your password. Takes 5 seconds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          <button data-testid="modal-signin-google" disabled={loading !== null} onClick={() => handle('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-md bg-zinc-900 border border-white/10 text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-60">
            {loading === 'google' ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
            <span className="font-mono text-sm font-medium">Continue with Google</span>
          </button>
          <button data-testid="modal-signin-linkedin" disabled={loading !== null} onClick={() => handle('linkedin')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-md bg-zinc-900 border border-white/10 text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-60">
            {loading === 'linkedin' ? <Loader2 size={18} className="animate-spin" /> : <LinkedInIcon />}
            <span className="font-mono text-sm font-medium">Continue with LinkedIn</span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-white/5 font-mono text-[11px] text-zinc-500 leading-relaxed">
          <Sparkles size={11} className="inline -mt-0.5 text-amber-400 mr-1" />
          You'll get: progress saved across devices, AI-graded practice, JD-driven study plans, and the SRS rep queue.
        </div>

        <button onClick={() => { onOpenChange(false); navigate('/signin'); }} className="mt-3 font-mono text-xs text-zinc-500 hover:text-zinc-300 underline-offset-2 hover:underline">
          See full sign-in page →
        </button>
      </DialogContent>
    </Dialog>
  );
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.36V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
  </svg>
);
