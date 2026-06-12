import React, { useMemo, useState } from 'react';
import { Loader2, Sparkles, ChevronDown, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { COMPANIES, QUESTIONS } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { extractSkills, generateAssessment, evaluateAssessment, generatePlan } from '../lib/api';
import { PixelBar } from '../components/PixelBar';

const ACTIVE_COMPANY_IDS = [...new Set(QUESTIONS.map(q => q.company))];
const ACTIVE_COMPANIES = COMPANIES.filter(c => ACTIVE_COMPANY_IDS.includes(c.id));
const ACTIVE_ROLES = [...new Set(QUESTIONS.map(q => q.role))];

const BAND_COLOR = { 'Strong': '#22c55e', 'Interview Ready': '#86efac', 'Needs Improvement': '#f59e0b', 'Weak': '#f97316', 'Critical Gap': '#ef4444' };
const BAND_ICON = { 'Strong': CheckCircle2, 'Interview Ready': CheckCircle2, 'Needs Improvement': AlertTriangle, 'Weak': AlertTriangle, 'Critical Gap': XCircle };

export default function StudyPlan({ isGuest = false }) {
  const [step, setStep] = useState('input');
  const [jd, setJd] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('SDE2');
  const [competencies, setCompetencies] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [heatmap, setHeatmap] = useState([]);
  const [gaps, setGaps] = useState({});
  const [readiness, setReadinessScore] = useState(0);
  const [summary, setSummary] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const { state, setActivePlan, setReadiness } = useAppState();

  // Step 1: extract competencies from JD
  const extract = async () => {
    if (isGuest) { window.location.href = '/signin'; return; }
    if (!jd.trim()) { toast.error('Paste a job description first.'); return; }
    setStep('extracting');
    try {
      const companyName = COMPANIES.find(c => c.id === company)?.name || company;
      const data = await extractSkills({ jd, targetCompany: companyName, targetRole: role });
      const comps = (data.skills || []).slice(0, 10);
      setCompetencies(comps);
      // generate assessment questions
      const asmData = await generateAssessment({ company: companyName, role, competencies: comps });
      setQuestions(asmData.questions || []);
      setCurrentQ(0);
      setAnswers({});
      setCurrentAnswer('');
      setStep('assessment');
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Failed to extract skills.';
      toast.error(msg, { duration: 6000 });
      setStep('input');
    }
  };

  // Step 2: save answer and advance
  const nextQuestion = () => {
    const q = questions[currentQ];
    if (q) {
      setAnswers(prev => ({ ...prev, [q.id]: { question: q.question, competency: q.competency, answer: currentAnswer } }));
    }
    setCurrentAnswer('');
    if (currentQ + 1 >= questions.length) {
      submitAssessment({ ...answers, [q.id]: { question: q.question, competency: q.competency, answer: currentAnswer } });
    } else {
      setCurrentQ(i => i + 1);
    }
  };

  const skipQuestion = () => {
    const q = questions[currentQ];
    if (q) setAnswers(prev => ({ ...prev, [q.id]: { question: q.question, competency: q.competency, answer: '' } }));
    setCurrentAnswer('');
    if (currentQ + 1 >= questions.length) {
      submitAssessment({ ...answers, [q.id]: { question: q.question, competency: q.competency, answer: '' } });
    } else {
      setCurrentQ(i => i + 1);
    }
  };

  // Step 3: evaluate
  const submitAssessment = async (finalAnswers) => {
    setStep('evaluating');
    try {
      const companyName = COMPANIES.find(c => c.id === company)?.name || company;
      const qa = Object.values(finalAnswers);
      const result = await evaluateAssessment({ company: companyName, role, qa });
      setHeatmap(result.heatmap || []);
      setGaps(result.gaps || {});
      setReadinessScore(result.readiness || 0);
      setSummary(result.summary || '');
      setReadiness(result.readiness || 0);
      setStep('gaps');
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Evaluation failed.';
      toast.error(msg, { duration: 6000 });
      setStep('assessment');
    }
  };

  // Step 4: generate plan
  const buildPlan = async () => {
    setStep('generating');
    try {
      const companyName = COMPANIES.find(c => c.id === company)?.name || company;
      const plan = await generatePlan({ company: companyName, role, heatmap, gaps, readiness });
      setGeneratedPlan(plan);
      setActivePlan({ company, role, currentDay: 1, totalDays: 14 });
      setExpandedDay(1);
      setStep('plan');
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Plan generation failed.';
      toast.error(msg, { duration: 6000 });
      setStep('gaps');
    }
  };

  if (step === 'plan') {
    return <PlanCalendar
      plan={generatedPlan}
      expandedDay={expandedDay}
      setExpandedDay={setExpandedDay}
      state={state}
      onReset={() => { setStep('input'); setGeneratedPlan(null); setExpandedDay(null); }}
    />;
  }

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-4xl mx-auto">
      <Breadcrumb segments={['study-plan', step]} />
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-zinc-50 mt-1">JD → assess → plan</h1>
      <p className="text-zinc-400 mt-3 text-base max-w-xl leading-relaxed">
        Paste a JD, answer 10 scenario questions, get a personalised 14-day roadmap built on your actual gaps.
      </p>

      <Stepper step={step} />

      {/* ── Input ── */}
      {step === 'input' && (
        <div className="mt-7 rounded-lg border border-white/10 bg-zinc-950 animate-fade-up">
          <div className="px-5 py-3 border-b border-white/5 font-mono text-xs flex items-center gap-2">
            <span className="text-emerald-400">&gt;</span>
            <span className="text-zinc-500">paste-job-description</span>
            <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-zinc-600">step 1 of 4</span>
          </div>
          <textarea value={jd} onChange={e => setJd(e.target.value)} rows={9}
            className="w-full bg-transparent border-0 p-5 text-sm font-mono text-zinc-100 placeholder:text-zinc-700 focus:outline-none resize-y"
            placeholder="// paste the full job description here…" />
          <div className="border-t border-white/5 p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Select label="target company" value={company} onChange={setCompany}
                options={ACTIVE_COMPANIES.map(c => ({ id: c.id, label: c.name }))}
                placeholder="Type company name…" />
              <p className="font-mono text-[10px] text-zinc-600 mt-1">Not listed? Just type your company name.</p>
            </div>
            <Select label="target role" value={role} onChange={setRole}
              options={ACTIVE_ROLES.map(r => ({ id: r, label: r }))}
              placeholder="Type or select role…" />
          </div>
          <div className="border-t border-white/5 p-5 flex items-center justify-between">
            <div className="font-mono text-xs text-zinc-500">{jd.length} chars</div>
            <button onClick={extract} disabled={!jd.trim()}
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all disabled:opacity-50"
              style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 24px -8px rgba(245,158,11,0.6)' }}>
              <Sparkles size={14} strokeWidth={2.5} /> Start assessment
            </button>
          </div>
        </div>
      )}

      {/* ── Loading states ── */}
      {(step === 'extracting') && <LoadingCard icon="emerald" text="Extracting competencies from JD…" sub="Generating 10 scenario questions" />}
      {(step === 'evaluating') && <LoadingCard icon="amber" text="Evaluating your answers…" sub="Calculating skill heatmap and gaps" />}
      {(step === 'generating') && <LoadingCard icon="amber" text="Building your personalised roadmap…" sub="Tailoring every task to your gaps" />}

      {/* ── Assessment quiz ── */}
      {step === 'assessment' && questions.length > 0 && (
        <AssessmentQuiz
          questions={questions}
          currentQ={currentQ}
          currentAnswer={currentAnswer}
          setCurrentAnswer={setCurrentAnswer}
          onNext={nextQuestion}
          onSkip={skipQuestion}
        />
      )}

      {/* ── Gap analysis ── */}
      {step === 'gaps' && (
        <GapView
          heatmap={heatmap}
          gaps={gaps}
          readiness={readiness}
          summary={summary}
          company={COMPANIES.find(c => c.id === company)?.name || company}
          role={role}
          onBack={() => setStep('assessment')}
          onContinue={buildPlan}
        />
      )}
    </div>
  );
}

// ─── Loading card ───────────────────────────────────────────────────────────
const LoadingCard = ({ icon, text, sub }) => (
  <div className="mt-7 rounded-lg border border-white/10 bg-zinc-950 p-14 flex flex-col items-center animate-fade-up">
    <Loader2 size={28} className={`animate-spin ${icon === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`} />
    <div className="font-mono text-sm text-zinc-300 mt-5">{text}</div>
    {sub && <div className="font-mono text-xs text-zinc-600 mt-1.5">{sub}</div>}
  </div>
);

// ─── Assessment quiz ─────────────────────────────────────────────────────────
const AssessmentQuiz = ({ questions, currentQ, currentAnswer, setCurrentAnswer, onNext, onSkip }) => {
  const q = questions[currentQ];
  const total = questions.length;
  const pct = Math.round((currentQ / total) * 100);

  return (
    <div className="mt-7 animate-fade-up">
      <div className="flex items-center justify-between mb-3 font-mono text-xs text-zinc-500">
        <span>Question <span className="text-zinc-100 font-semibold">{currentQ + 1}</span> of {total}</span>
        <span className="text-zinc-500">{q?.competency}</span>
      </div>
      <PixelBar value={pct} height={6} color="#f59e0b" />

      <div className="mt-5 rounded-lg border border-white/10 bg-zinc-950 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2 font-mono text-xs">
          <span className="text-amber-400">Q{currentQ + 1}</span>
          <span className="text-zinc-700">·</span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/[0.06] text-amber-400">{q?.competency}</span>
        </div>
        <div className="p-5">
          <p className="text-zinc-100 text-base leading-relaxed" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{q?.question}</p>
          {q?.hint && (
            <p className="font-mono text-xs text-zinc-600 mt-3">// hint: {q.hint}</p>
          )}
        </div>
        <div className="border-t border-white/5 p-5">
          <textarea
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            rows={5}
            placeholder="Type your answer here… or skip if you don't know."
            className="w-full bg-zinc-900 border border-white/10 rounded-md p-4 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-y"
          />
        </div>
        <div className="border-t border-white/5 p-4 flex items-center justify-between gap-3">
          <button onClick={onSkip}
            className="font-mono text-xs px-4 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            Skip →
          </button>
          <button onClick={onNext}
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
            style={{ background: '#f59e0b' }}>
            {currentQ + 1 === questions.length ? <>Submit <CheckCircle2 size={14} /></> : <>Next <ArrowRight size={14} strokeWidth={2.5} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Gap view ────────────────────────────────────────────────────────────────
const GapView = ({ heatmap, gaps, readiness, summary, company, role, onBack, onContinue }) => {
  const rc = readiness < 40 ? '#ef4444' : readiness < 60 ? '#f97316' : readiness < 75 ? '#f59e0b' : '#22c55e';
  return (
    <div className="mt-7 animate-fade-up space-y-4" data-testid="gap-analysis">
      {/* Readiness header */}
      <div className="rounded-lg border border-white/10 bg-zinc-950 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-2">Interview readiness · {company} {role}</div>
            <div className="font-mono text-6xl font-semibold" style={{ color: rc }}>{readiness}<span className="text-2xl text-zinc-700">%</span></div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <PixelBar value={readiness} height={14} color={rc} dotColor={rc} />
            {summary && <p className="font-mono text-xs text-zinc-400 mt-3 leading-relaxed">{summary}</p>}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-lg border border-white/10 bg-zinc-950 p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-4">Skills heatmap</div>
        <div className="space-y-3">
          {heatmap.map(h => {
            const color = BAND_COLOR[h.band] || '#a1a1aa';
            const Icon = BAND_ICON[h.band] || AlertTriangle;
            return (
              <div key={h.skill}>
                <div className="flex items-center gap-3 mb-1 font-mono text-xs">
                  <Icon size={12} style={{ color }} className="shrink-0" />
                  <span className="text-zinc-200 w-36 sm:w-48 truncate shrink-0">{h.skill}</span>
                  <div className="flex-1 min-w-0"><PixelBar value={h.score} height={10} color={color} dotColor={color} /></div>
                  <span className="w-10 text-right shrink-0 font-semibold" style={{ color }}>{h.score}%</span>
                  <span className="hidden sm:block font-mono text-[10px] px-1.5 py-0.5 rounded border shrink-0"
                    style={{ color, borderColor: color + '50', background: color + '10' }}>{h.band}</span>
                </div>
                {h.feedback && <p className="font-mono text-[10px] text-zinc-600 ml-5 leading-relaxed">{h.feedback}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap buckets */}
      {(gaps.critical?.length > 0 || gaps.weak?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gaps.critical?.length > 0 && (
            <GapBucket color="#ef4444" label="Critical gaps" items={gaps.critical}
              desc="Front-loaded in days 1–7 with maximum effort." />
          )}
          {gaps.weak?.length > 0 && (
            <GapBucket color="#f97316" label="Weak areas" items={gaps.weak}
              desc="Covered in days 5–10 with targeted exercises." />
          )}
          {gaps.moderate?.length > 0 && (
            <GapBucket color="#f59e0b" label="Moderate" items={gaps.moderate}
              desc="Reinforced in mid-plan revision sessions." />
          )}
          {gaps.strong?.length > 0 && (
            <GapBucket color="#22c55e" label="Strengths" items={gaps.strong}
              desc="Minimal prep needed — maintenance cadence only." />
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
        <button onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-sm px-3 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
          <ArrowLeft size={13} /> Retake assessment
        </button>
        <button onClick={onContinue}
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
          style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 24px -8px rgba(245,158,11,0.6)' }}>
          Generate personalised roadmap <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

const GapBucket = ({ color, label, items, desc }) => (
  <div className="rounded-md border p-4" style={{ borderColor: color + '40', background: color + '08' }}>
    <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color }}>{label}</div>
    <div className="flex flex-wrap gap-1.5 mb-2">
      {items.map(s => (
        <span key={s} className="font-mono text-xs px-2 py-0.5 rounded border" style={{ color, borderColor: color + '40', background: color + '10' }}>{s}</span>
      ))}
    </div>
    <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">{desc}</p>
  </div>
);

// ─── Plan calendar ────────────────────────────────────────────────────────────
const PlanCalendar = ({ plan, expandedDay, setExpandedDay, state, onReset }) => {
  const company = COMPANIES.find(c => c.id === state.activePlan?.company) || COMPANIES[0];
  const days = plan?.days || [];
  const currentDay = state.activePlan?.currentDay || 1;
  const expandedData = days.find(d => d.day === expandedDay);
  const mockDays = new Set((plan?.mockInterviews || []).map(m => m.day));

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-5xl mx-auto">
      <Breadcrumb segments={['study-plan', `${company.id}-${state.activePlan?.role?.toLowerCase()}`, '14-day-plan']} />

      <div className="flex items-start justify-between gap-4 mt-1 mb-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-zinc-50">{company.name} · {state.activePlan?.role}</h1>
          <p className="font-mono text-sm text-zinc-400 mt-2">Tap any day to expand · mock interviews marked in blue</p>
        </div>
        <div className="flex items-center gap-2">
          {plan?.successProbability && (
            <div className="font-mono text-xs border border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400 px-3 py-1.5 rounded-md">
              <Trophy size={11} className="inline mr-1.5" />success probability: {plan.successProbability}
            </div>
          )}
          <button onClick={onReset} className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-400 hover:text-zinc-50 border border-white/10 rounded-md px-3 py-2">New plan</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map(d => {
          const isToday = d.day === currentDay;
          const isDone = d.day < currentDay;
          const isExpanded = expandedDay === d.day;
          const isMock = mockDays.has(d.day);
          return (
            <button key={d.day} onClick={() => setExpandedDay(isExpanded ? null : d.day)}
              className={`relative text-left p-2 rounded-md border transition-all overflow-hidden ${
                isExpanded
                  ? 'border-amber-500/60 bg-amber-500/[0.07] ring-1 ring-amber-500/30'
                  : isMock
                  ? 'border-blue-500/40 bg-blue-500/[0.05] hover:border-blue-500/60'
                  : isToday
                  ? 'border-emerald-500/40 bg-emerald-500/[0.04]'
                  : isDone
                  ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                  : 'border-white/10 bg-zinc-950 hover:border-white/20'
              }`}>
              {isExpanded && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#f59e0b' }} />}
              {!isExpanded && isToday && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#22c55e' }} />}
              {!isExpanded && isMock && !isToday && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#3b82f6' }} />}
              <div className="font-mono text-[9px] text-zinc-600">d{d.day}</div>
              <div className="font-mono text-base font-semibold text-zinc-50">{d.day}</div>
              {isMock && <div className="font-mono text-[8px] text-blue-400 mt-0.5 truncate">mock</div>}
              <div className="mt-0.5 font-mono text-[8px] text-zinc-600 truncate leading-tight">{d.focus?.split('·')[0]?.trim()}</div>
            </button>
          );
        })}
      </div>

      {expandedData && (
        <div className="mt-4 rounded-lg border border-white/10 bg-zinc-950 p-5 sm:p-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">day {expandedData.day}</span>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-sm text-zinc-100 font-semibold">{expandedData.focus}</span>
            {expandedData.theme && <span className="font-mono text-[10px] text-zinc-600">{expandedData.theme}</span>}
            {expandedData.mockInterview && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-blue-500/40 bg-blue-500/[0.08] text-blue-400">
                {expandedData.mockInterview.type} · {expandedData.mockInterview.duration}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">Study tasks</div>
              <ol className="space-y-2.5">
                {(expandedData.tasks || []).map((task, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-mono text-[10px] text-zinc-700 mt-0.5 shrink-0 w-4">{i + 1}.</span>
                    <span className="text-zinc-200 text-sm leading-relaxed" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{task}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">Practice questions</div>
              <div className="space-y-2.5">
                {(expandedData.practiceQuestions || []).map((q, i) => (
                  <div key={i} className="p-3 rounded-md border border-amber-500/20 bg-amber-500/[0.03]">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[10px] text-amber-500 mt-0.5 shrink-0">Q{i + 1}</span>
                      <span className="text-zinc-100 text-sm leading-relaxed" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{q}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {expandedData.mockInterview && (
            <div className="mt-5 rounded-md border border-blue-500/30 bg-blue-500/[0.05] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-400 mb-2">Mock interview · {expandedData.mockInterview.type}</div>
              <p className="font-mono text-xs text-zinc-300">Topics: {expandedData.mockInterview.topics?.join(', ')}</p>
              <p className="font-mono text-xs text-zinc-500 mt-1">Duration: {expandedData.mockInterview.duration} · score yourself honestly and note weaknesses for day {expandedData.day + 1}</p>
            </div>
          )}
        </div>
      )}

      {/* Mock interview schedule */}
      {plan?.mockInterviews?.length > 0 && (
        <div className="mt-6 rounded-lg border border-white/10 bg-zinc-950 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">Mock interview schedule</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {plan.mockInterviews.map(m => (
              <div key={m.day} className="rounded-md border border-blue-500/30 bg-blue-500/[0.05] p-3">
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-[0.14em]">Day {m.day}</div>
                <div className="font-mono text-sm text-zinc-100 mt-0.5 font-semibold">{m.type}</div>
                <div className="font-mono text-[10px] text-zinc-500 mt-1">{m.duration}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Stepper ─────────────────────────────────────────────────────────────────
const Stepper = ({ step }) => {
  const steps = [
    { id: 'input', label: 'JD input' },
    { id: 'assessment', label: 'assessment' },
    { id: 'gaps', label: 'gap analysis' },
    { id: 'plan', label: 'roadmap' },
  ];
  const loading = ['extracting', 'evaluating', 'generating'];
  const activeId = loading.includes(step)
    ? step === 'extracting' ? 'input' : step === 'evaluating' ? 'assessment' : 'gaps'
    : step;
  const idx = steps.findIndex(s => s.id === activeId);
  return (
    <div className="flex items-center gap-2 mt-6 font-mono text-xs flex-wrap">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] transition-colors ${
            i < idx ? 'bg-emerald-500 text-zinc-950 font-semibold'
            : i === idx ? 'bg-amber-500 text-zinc-950 font-semibold'
            : 'bg-zinc-900 text-zinc-600 border border-white/10'
          }`}>{i < idx ? '✓' : i + 1}</div>
          <div className={i <= idx ? 'text-zinc-100' : 'text-zinc-600'}>{s.label}</div>
          {i < steps.length - 1 && <div className="w-6 h-px bg-white/10 mx-1" />}
        </div>
      ))}
    </div>
  );
};

// ─── Select ──────────────────────────────────────────────────────────────────
const Select = ({ label, value, onChange, options, placeholder = 'Type or select…' }) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const ref = React.useRef(null);
  const displayLabel = options.find(o => o.id === value)?.label || value || '';
  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref}>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 mb-1.5">{label}</div>
      <div className="relative">
        <input
          value={open ? search : displayLabel}
          onChange={e => { setSearch(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setSearch(''); }}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-white/10 rounded-md p-2.5 pr-8 text-sm font-mono text-zinc-100 focus:outline-none focus:border-white/30 placeholder:text-zinc-600"
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        {open && (
          <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-md border border-white/10 bg-zinc-900 shadow-xl">
            {filtered.map(o => (
              <button key={o.id} type="button"
                onMouseDown={() => { onChange(o.id); setSearch(''); setOpen(false); }}
                className={`w-full text-left px-3 py-2 font-mono text-sm hover:bg-white/5 transition-colors ${value === o.id ? 'text-amber-400' : 'text-zinc-200'}`}>
                {o.label}
              </button>
            ))}
            {search && !filtered.find(o => o.label.toLowerCase() === search.toLowerCase()) && (
              <button type="button"
                onMouseDown={() => { onChange(search); setSearch(''); setOpen(false); }}
                className="w-full text-left px-3 py-2 font-mono text-sm text-emerald-400 hover:bg-white/5 border-t border-white/5">
                Use "{search}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Breadcrumb ──────────────────────────────────────────────────────────────
const Breadcrumb = ({ segments }) => (
  <div className="font-mono text-sm text-zinc-600 mb-4">
    <span className="text-emerald-400">~</span>
    {segments.map((s, i) => (
      <span key={i}>
        <span className="mx-1.5">/</span>
        <span className={i === segments.length - 1 ? 'text-zinc-200' : 'text-zinc-400'}>{s}</span>
      </span>
    ))}
  </div>
);
