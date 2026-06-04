import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

import { AppStateProvider } from './lib/appState';
import { getSession, onAuthStateChange } from './lib/auth';
import { AuthGate } from './components/AuthGate';
import { Sidebar } from './components/Sidebar';
import { ActivePlanBanner } from './components/ActivePlanBanner';

import QuestionBank from './pages/QuestionBank';
import DailyReview from './pages/DailyReview';
import StudyPlan from './pages/StudyPlan';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import AuthCallback from './pages/AuthCallback';

function ProtectedShell({ session, onSignOut, children }) {
  if (!session) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Sidebar user={session.user} onSignOut={onSignOut} />
      <div className="md:pl-64 pt-14 md:pt-0">
        <ActivePlanBanner />
        <div className="pb-20">{children}</div>
      </div>
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

  if (!hydrated) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  return (
    <AppStateProvider>
      <Toaster theme="dark" position="bottom-right" toastOptions={{
        style: { background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa', fontFamily: 'IBM Plex Sans' },
      }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            session ? <Navigate to="/app/questions" replace /> : <AuthGate />
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/app/questions" element={
            <ProtectedShell session={session} onSignOut={() => setSession(null)}><QuestionBank /></ProtectedShell>
          } />
          <Route path="/app/review" element={
            <ProtectedShell session={session} onSignOut={() => setSession(null)}><DailyReview /></ProtectedShell>
          } />
          <Route path="/app/plan" element={
            <ProtectedShell session={session} onSignOut={() => setSession(null)}><StudyPlan /></ProtectedShell>
          } />
          <Route path="/app/practice" element={
            <ProtectedShell session={session} onSignOut={() => setSession(null)}><Practice /></ProtectedShell>
          } />
          <Route path="/app/progress" element={
            <ProtectedShell session={session} onSignOut={() => setSession(null)}><Progress /></ProtectedShell>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
