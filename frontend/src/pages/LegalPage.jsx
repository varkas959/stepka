import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage({ kind = 'privacy' }) {
  const config = kind === 'terms' ? TERMS : PRIVACY;
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" data-testid="legal-home-link">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-zinc-950 text-xs" style={{ background: '#f59e0b' }}>sk</div>
            <span className="font-mono font-semibold tracking-tight text-sm">Stepkai</span>
          </Link>
          <Link to="/" className="font-mono text-xs text-zinc-400 hover:text-zinc-50 inline-flex items-center gap-1.5">
            <ArrowLeft size={12} /> Back home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="font-mono text-sm text-zinc-600 mb-4">
          <span className="text-emerald-400">~</span>
          <span className="mx-1.5">/</span>
          <span className="text-zinc-200">{config.slug}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{config.title}</h1>
        <p className="font-mono text-xs text-zinc-500 mt-2">Last updated: {config.updated}</p>

        <div className="mt-10 space-y-8">
          {config.sections.map((s, i) => (
            <section key={i} data-testid={`legal-section-${i}`}>
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-3">{s.h}</h2>
              {s.p.map((para, j) => (
                <p key={j} className="text-zinc-300 leading-relaxed mb-3 text-sm sm:text-base">{para}</p>
              ))}
              {s.list && (
                <ul className="font-mono text-xs sm:text-sm text-zinc-300 mt-2 ml-4 list-disc space-y-1.5">
                  {s.list.map((item, k) => <li key={k}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/5 font-mono text-xs text-zinc-500">
          Questions? Email <a className="text-zinc-200 hover:underline" href="mailto:hi@stepkai.com">hi@stepkai.com</a>.
        </div>
      </main>
    </div>
  );
}

const PRIVACY = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  updated: 'Feb 2026',
  sections: [
    { h: '1. What we collect',
      p: ['We collect the minimum we need to make the product work. When you sign in with Google or LinkedIn, we receive your name, email address, and profile picture URL from those providers.'],
      list: [
        'Identity: name, email, avatar URL (from Google or LinkedIn)',
        'Usage: which questions you view, your spaced-repetition ratings, XP, streak',
        'Submissions: text/code you submit to the AI grader',
        'Technical: IP address and browser metadata used for security',
      ] },
    { h: '2. How we use it',
      p: ['We use your data to operate Stepkai: to authenticate you, persist your progress, schedule your reviews, and generate AI feedback.'],
      list: [
        'Authenticate you via Supabase Auth',
        'Persist progress (streak, XP, due dates) so it survives across devices',
        'Send your submissions to Google Gemini for grading',
        'Detect abuse and prevent fraud',
      ] },
    { h: '3. What we never do',
      list: [
        'Sell your data to anyone',
        'Share with recruiters or employers',
        'Train public AI models on your private submissions',
        'Send marketing emails without your explicit opt-in',
      ] },
    { h: '4. Third parties',
      p: ['Stepkai relies on a small number of trusted services to operate:'],
      list: [
        'Supabase — authentication and database hosting',
        'Google (Gemini) — AI grading and JD analysis',
        'LinkedIn / Google — OAuth identity',
      ] },
    { h: '5. Your rights',
      p: ['You can request a full export or deletion of your data at any time. Email hi@stepkai.com and we will respond within 30 days. Signed-in users can delete their account from Profile → Settings → Danger zone.'] },
    { h: '6. Contact',
      p: ['Privacy questions: hi@stepkai.com. Data controller: Stepkai Inc.'] },
  ],
};

const TERMS = {
  slug: 'terms-of-service',
  title: 'Terms of Service',
  updated: 'Feb 2026',
  sections: [
    { h: '1. Acceptance',
      p: ['By creating an account or using Stepkai, you agree to these Terms. If you don\'t agree, please don\'t use the service.'] },
    { h: '2. The service',
      p: ['Stepkai is an interview-preparation platform. We provide a question bank, spaced-repetition reviews, study plans, AI-graded practice, and progress tracking. The content is contributed by users and curated for quality, but we make no guarantees about the outcome of any interview.'] },
    { h: '3. Your account',
      p: ['You are responsible for keeping your account secure. Don\'t share your credentials, don\'t impersonate others, and don\'t scrape the service.'] },
    { h: '4. Acceptable use',
      list: [
        'No automated scraping, crawling, or bulk export',
        'No reverse-engineering the AI grading endpoints',
        'No sharing of paid content with non-paying users',
        'No harassing, deceptive, or illegal content in submissions',
      ] },
    { h: '5. Your content',
      p: ['When you submit a question to the bank, you grant Stepkai a non-exclusive, royalty-free license to display it to other users. You retain ownership; we retain the right to moderate, edit for clarity, or remove.'] },
    { h: '6. AI grading disclaimer',
      p: ['The AI-graded feedback is generated by large language models and may contain errors. Treat it as a coaching signal, not an authoritative review. Decisions about your career are yours alone.'] },
    { h: '7. Payment & subscriptions',
      p: ['The current MVP is free. When we launch paid tiers, the pricing and refund policy will be presented at the point of purchase and added here.'] },
    { h: '8. Termination',
      p: ['We may suspend or terminate your account for violations of these Terms. You can close your account at any time from Profile → Settings.'] },
    { h: '9. Liability',
      p: ['Stepkai is provided "as is." We are not liable for any indirect damages — including missed interview offers — arising from your use of the service.'] },
    { h: '10. Changes',
      p: ['We may update these Terms. Material changes will be announced in-app at least 14 days before they take effect.'] },
  ],
};
