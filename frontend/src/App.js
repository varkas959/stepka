import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'next-themes';
import './App.css';

import { AppStateProvider } from './lib/appState';
import { getSession, onAuthStateChange } from './lib/auth';
import { AuthGate } from './components/AuthGate';
import { Sidebar } from './components/Sidebar';
import { ActivePlanBanner } from './components/ActivePlanBanner';

import Home from './pages/Home';
import QuestionBank from './pages/QuestionBank';
import PublicQuestions from './pages/PublicQuestions';
import DailyReview from './pages/DailyReview';
import StudyPlan from './pages/StudyPlan';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import LegalPage from './pages/LegalPage';
import FeedbackPage from './pages/FeedbackPage';
import SEOPage from './pages/SEOPage';

function AppShell({ session, onSignOut, children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Sidebar user={session?.user} onSignOut={onSignOut} isGuest={!session} />
      <div className="md:pl-64 pt-14 md:pt-0">
        {session && <ActivePlanBanner />}
        {!session && <GuestBanner />}
        <div className="pb-20">{children}</div>
      </div>
    </div>
  );
}

function GuestBanner() {
  return (
    <div className="border-b border-amber-500/20 bg-amber-500/[0.05] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
      <span className="font-mono text-xs text-amber-300">
        👋 Browsing as guest — sign in to track progress, upvote, and use Study Plan &amp; Practice
      </span>
      <a href="/signin"
        className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
        style={{ background: '#f59e0b' }}>
        Sign in
      </a>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let unsub = null;
    (async () => {
      const s = await getSession();
      setSession(s);
      setHydrated(true);
      unsub = onAuthStateChange((next) => setSession(next));
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  if (!hydrated) return <div className="min-h-screen bg-zinc-950" />;

  return (
    <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <AppStateProvider userId={session?.user?.id}>
      <Toaster theme="dark" position="bottom-right" toastOptions={{
        style: { background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa', fontFamily: 'IBM Plex Sans' },
      }} />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={
            session ? <Navigate to="/app/questions" replace /> : <AuthGate />
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="/questions" element={<PublicQuestions />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/questions/trending" element={<SEOPage kind="trending" />} />
          <Route path="/questions/company/:slug" element={<SEOPage kind="company" />} />
          <Route path="/questions/topic/:slug" element={<SEOPage kind="topic" />} />
          <Route path="/questions/tech/:slug" element={<SEOPage kind="tech" />} />

          {/* App shell — visible to all, actions gated by sign-in */}
          <Route path="/app/questions" element={
            <AppShell session={session} onSignOut={() => setSession(null)}>
              <QuestionBank isGuest={!session} />
            </AppShell>
          } />
          <Route path="/app/review" element={
            <AppShell session={session} onSignOut={() => setSession(null)}>
              <DailyReview isGuest={!session} />
            </AppShell>
          } />
          <Route path="/app/plan" element={
            <AppShell session={session} onSignOut={() => setSession(null)}>
              <StudyPlan isGuest={!session} />
            </AppShell>
          } />
          <Route path="/app/practice" element={
            <AppShell session={session} onSignOut={() => setSession(null)}>
              <Practice isGuest={!session} />
            </AppShell>
          } />
          <Route path="/app/progress" element={
            <AppShell session={session} onSignOut={() => setSession(null)}>
              <Progress isGuest={!session} />
            </AppShell>
          } />
          <Route path="/app/profile" element={
            <AppShell session={session} onSignOut={() => setSession(null)}>
              <Profile session={session} onSignOut={() => setSession(null)} isGuest={!session} />
            </AppShell>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
