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
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-60">
            {loading === 'google' ? <Loader2 size={15} className="animate-spin" /> : <GoogleIcon />}
            <span className="font-mono text-sm font-medium">Continue with Google</span>
          </button>
          <button data-testid="modal-signin-linkedin" disabled={loading !== null} onClick={() => handle('linkedin')}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-60">
            {loading === 'linkedin' ? <Loader2 size={15} className="animate-spin" /> : <LinkedInIcon />}
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
  <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.92h5.45c-.24 1.36-1.66 4-5.45 4-3.28 0-5.95-2.71-5.95-6.05S8.72 5.95 12 5.95c1.86 0 3.11.79 3.83 1.47l2.61-2.52C16.84 3.42 14.62 2.5 12 2.5 6.97 2.5 2.9 6.57 2.9 11.6S6.97 20.7 12 20.7c6.92 0 9.6-4.85 9.6-7.34 0-.5-.05-.87-.12-1.16H12z"/></svg>
);
const LinkedInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.36V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
);
