import { useMemo, useState } from 'react';
import { Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { COMPANIES, ROLES, STUDY_PLAN, QUESTIONS } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { CompanyBadge } from '../components/CompanyBadge';
import { analyzeJD } from '../lib/api';
import { toast } from 'sonner';

export default function StudyPlan() {
  const [step, setStep] = useState('input'); // input | analyzing | result | plan
  const [jd, setJd] = useState('We are hiring a Senior Software Engineer (SDE2) for our Payments team.\nResponsibilities: design distributed payment processing pipelines, own Kafka topics, partner with infra on latency.\nMust have: 4+ years Java, distributed systems, system design, LLD, microservices on AWS.');
  const [company, setCompany] = useState('amazon');
  const [role, setRole] = useState('SDE2');
  const [expandedDay, setExpandedDay] = useState(4);
  const [analysis, setAnalysis] = useState(null);
  const { state, setActivePlan, setReadiness } = useAppState();

  const analyze = async () => {
    setStep('analyzing');
    try {
      const data = await analyzeJD({ jd, targetCompany: company, targetRole: role });
      setAnalysis(data);
      setReadiness(data.readiness || 60);
      setStep('result');
    } catch (e) {
      toast.error(e?.response?.data?.detail || e.message || 'Could not analyze JD.');
      setStep('input');
    }
  };

  const activatePlan = () => {
    setActivePlan({ company, role, currentDay: 1, totalDays: 14, dueQuestions: 3 });
    setStep('plan');
  };

  if (step === 'plan' || (step !== 'input' && step !== 'analyzing' && step !== 'result')) {
    return <PlanCalendar expandedDay={expandedDay} setExpandedDay={setExpandedDay} onReset={() => setStep('input')} />;
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-4xl mx-auto">
      <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Study Plan</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">JD → Skill gap → 14-day plan</h1>
      <p className="text-zinc-400 mt-2 text-sm max-w-xl">Paste a job description. We extract requirements, compare against your mastery, and generate a focused two-week prep plan.</p>

      <Stepper step={step} />

      {step === 'input' && (
        <div className="mt-8 border border-white/10 rounded-lg bg-zinc-900/60 p-6 animate-fade-up">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono mb-3">Step 1 · Paste Job Description</div>
          <textarea
            data-testid="jd-textarea"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={9}
            className="w-full bg-zinc-950 border border-white/10 rounded-md p-4 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-y"
            placeholder="Paste the JD here…"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono mb-1.5">Target Company</div>
              <select data-testid="jd-company" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2.5 text-sm focus:outline-none focus:border-white/30">
                {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono mb-1.5">Target Role</div>
              <select data-testid="jd-role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2.5 text-sm focus:outline-none focus:border-white/30">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <button
            data-testid="analyze-jd"
            onClick={analyze}
            disabled={!jd.trim()}
            className="mt-5 inline-flex items-center gap-2 bg-white text-zinc-950 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} /> Analyze JD
          </button>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="mt-8 border border-white/10 rounded-lg bg-zinc-900/60 p-12 flex flex-col items-center" data-testid="analyzing">
          <Loader2 size={28} className="animate-spin text-zinc-400" />
          <div className="text-sm text-zinc-300 mt-4 font-mono">Extracting skills…</div>
          <div className="text-xs text-zinc-500 mt-1">Comparing against your mastery profile</div>
        </div>
      )}

      {step === 'result' && analysis && <GapAnalysis analysis={analysis} onContinue={activatePlan} company={company} role={role} />}
    </div>
  );
}

const Stepper = ({ step }) => {
  const steps = [
    { id: 'input', label: 'JD Input' },
    { id: 'result', label: 'Gap Analysis' },
    { id: 'plan', label: 'Plan' },
  ];
  const idx = step === 'analyzing' ? 0 : steps.findIndex(s => s.id === step);
  return (
    <div className="flex items-center gap-3 mt-6">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono ${
            i <= idx ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-500 border border-white/10'
          }`}>{i + 1}</div>
          <div className={`text-xs ${i <= idx ? 'text-zinc-50' : 'text-zinc-500'}`}>{s.label}</div>
          {i < steps.length - 1 && <div className="w-8 h-px bg-white/10 mx-1" />}
        </div>
      ))}
    </div>
  );
};

const GapAnalysis = ({ analysis, onContinue, company, role }) => {
  const c = COMPANIES.find(x => x.id === company);
  const skills = analysis.extractedSkills || [];
  const readiness = analysis.readiness ?? 60;
  return (
    <div className="mt-8 animate-fade-up" data-testid="gap-analysis">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-white/10 rounded-lg bg-zinc-900/60 p-6">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Extracted Requirements</div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skills.map(s => (
              <span key={s.name} className="font-mono text-xs px-2 py-1 rounded border border-white/10 bg-white/5 text-zinc-300">{s.name}</span>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Your mastery per skill</div>
            {skills.map(s => {
              const gap = s.mastery < 50;
              const warn = s.mastery >= 50 && s.mastery < 70;
              const color = gap ? '#ef4444' : warn ? '#f59e0b' : '#10b981';
              return (
                <div key={s.name} className="flex items-center gap-3 text-xs">
                  <div className="w-36 truncate font-mono text-zinc-300">{s.name}</div>
                  <div className="flex-1 h-2 bg-white/5 rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm transition-all" style={{ width: `${s.mastery}%`, background: color }} />
                  </div>
                  <div className="w-10 text-right font-mono" style={{ color }}>{s.mastery}%</div>
                  {gap && <div className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-red-500/30 text-red-400 bg-red-500/5">gap</div>}
                </div>
              );
            })}
          </div>

          {analysis.suggestions?.length > 0 && (
            <div className="mt-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono mb-2">Coach suggestions</div>
              <ul className="space-y-1.5 text-sm text-zinc-300">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="font-mono text-xs leading-relaxed flex gap-2">
                    <span className="text-zinc-500">{(i + 1).toString().padStart(2, '0')}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border border-white/10 rounded-lg bg-zinc-900/60 p-6 flex flex-col">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">Readiness</div>
          <div className="mt-3">
            <div className="font-mono text-6xl font-semibold tracking-tight" style={{ color: readiness < 70 ? '#f59e0b' : '#10b981' }}>
              {readiness}<span className="text-2xl text-zinc-500">%</span>
            </div>
            <div className="text-sm text-zinc-400 mt-2">for <span className="text-zinc-50">{c?.name} {role}</span></div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-6">
            <div className="h-full bg-amber-500 transition-all" style={{ width: `${readiness}%` }} />
          </div>
          <p className="text-xs text-zinc-500 mt-4 leading-relaxed flex-1">
            You're <span className="font-mono text-amber-400">~{Math.max(0, 100 - readiness)}%</span> away.
            We'll bias your 14-day plan toward your weakest skills.
          </p>
          <button data-testid="generate-plan" onClick={onContinue} className="mt-5 bg-white text-zinc-950 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors">
            Generate 14-day plan →
          </button>
        </div>
      </div>
    </div>
  );
};

const PlanCalendar = ({ expandedDay, setExpandedDay, onReset }) => {
  const { state } = useAppState();
  const company = COMPANIES.find(c => c.id === state.activePlan?.company) || COMPANIES[0];

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-mono">14-Day Study Plan</div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1 flex items-center gap-3">
            <CompanyBadge companyId={company.id} size="lg" />
            {company.name} {state.activePlan?.role} prep
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">Day <span className="font-mono text-zinc-50">{state.activePlan?.currentDay}</span> of {state.activePlan?.totalDays} · click any day to expand</p>
        </div>
        <button onClick={onReset} data-testid="regenerate-plan" className="text-xs text-zinc-400 hover:text-zinc-50 border border-white/10 rounded-md px-3 py-2">Regenerate</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {STUDY_PLAN.map((d) => {
          const isToday = d.day === state.activePlan?.currentDay;
          const isDone = d.day < (state.activePlan?.currentDay || 1);
          const isExpanded = expandedDay === d.day;
          return (
            <button
              key={d.day}
              data-testid={`plan-day-${d.day}`}
              onClick={() => setExpandedDay(isExpanded ? null : d.day)}
              className={`text-left p-3 rounded-md border transition-colors ${
                isExpanded ? 'border-white/40 bg-zinc-900'
                : isToday ? 'border-amber-500/40 bg-amber-500/5'
                : isDone ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-white/10 bg-zinc-900/60 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Day</div>
                <div className="font-mono text-lg font-semibold text-zinc-50">{d.day}</div>
              </div>
              <div className="mt-2 space-y-1">
                {d.topics.slice(0, 3).map(t => (
                  <div key={t} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 truncate">{t}</div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {expandedDay && (
        <div className="mt-6 border border-white/10 rounded-lg bg-zinc-900/60 p-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="font-mono text-xs text-zinc-500">Day {expandedDay} ·</div>
            <div className="font-medium text-zinc-50 text-sm">{STUDY_PLAN[expandedDay - 1].topics.join(' · ')}</div>
            <ChevronDown size={14} className="text-zinc-600 ml-auto" />
          </div>
          <div className="space-y-2">
            {STUDY_PLAN[expandedDay - 1].questions.map(qId => {
              const q = QUESTIONS.find(x => x.id === qId);
              if (!q) return null;
              return (
                <div key={qId} className="flex items-start gap-3 p-3 rounded-md border border-white/5 hover:bg-white/5 transition-colors">
                  <CompanyBadge companyId={q.company} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-zinc-500 font-mono">{q.topicPath} · {q.difficulty}</div>
                    <div className="text-sm text-zinc-200 line-clamp-2 mt-0.5 font-mono">{q.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
