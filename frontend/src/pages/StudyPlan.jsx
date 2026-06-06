import { useState } from 'react';
import { Loader2, Sparkles, ChevronDown, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { COMPANIES, ROLES, STUDY_PLAN, QUESTIONS } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { analyzeJD } from '../lib/api';
import { PixelBar } from '../components/PixelBar';

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

  if (step === 'plan') return <PlanCalendar expandedDay={expandedDay} setExpandedDay={setExpandedDay} onReset={() => setStep('input')} state={state} />;

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-4xl mx-auto">
      <Breadcrumb segments={['study-plan', step === 'input' ? 'jd-input' : step === 'analyzing' ? 'analyzing' : 'gap-analysis']} />
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-50 mt-1">JD → gap → plan</h1>
      <p className="text-zinc-400 mt-3 text-base max-w-xl leading-relaxed">
        Paste a job description. Stepkai extracts requirements, compares against your mastery, and generates a focused two-week prep plan.
      </p>

      <Stepper step={step} />

      {step === 'input' && (
        <div className="mt-7 rounded-lg border border-white/10 bg-zinc-950 animate-fade-up">
          <div className="px-5 py-3 border-b border-white/5 font-mono text-xs flex items-center gap-2">
            <span className="text-emerald-400">&gt;</span>
            <span className="text-zinc-500">paste-job-description</span>
            <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-zinc-600">step 1 of 3</span>
          </div>
          <textarea
            data-testid="jd-textarea"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={9}
            className="w-full bg-transparent border-0 p-5 text-sm font-mono text-zinc-100 placeholder:text-zinc-700 focus:outline-none resize-y"
            placeholder="// paste the JD here…"
          />
          <div className="border-t border-white/5 p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField label="target company" value={company} onChange={setCompany} testid="jd-company"
              options={COMPANIES.map(c => ({ id: c.id, label: c.name }))} />
            <SelectField label="target role" value={role} onChange={setRole} testid="jd-role"
              options={ROLES.map(r => ({ id: r, label: r }))} />
          </div>
          <div className="border-t border-white/5 p-5 flex items-center justify-between">
            <div className="font-mono text-xs text-zinc-500">{jd.length} chars</div>
            <button data-testid="analyze-jd" onClick={analyze} disabled={!jd.trim()}
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all disabled:opacity-50"
              style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 24px -8px rgba(245,158,11,0.6)' }}>
              <Sparkles size={14} strokeWidth={2.5} /> Analyze JD
            </button>
          </div>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="mt-7 rounded-lg border border-white/10 bg-zinc-950 p-14 flex flex-col items-center" data-testid="analyzing">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
          <div className="font-mono text-sm text-zinc-300 mt-5">extracting skills…</div>
          <div className="font-mono text-xs text-zinc-600 mt-1">comparing against your mastery profile</div>
        </div>
      )}

      {step === 'result' && analysis && <GapAnalysis analysis={analysis} onContinue={activatePlan} company={company} role={role} />}
    </div>
  );
}

const SelectField = ({ label, value, onChange, options, testid }) => (
  <label className="block">
    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 mb-1.5">{label}</div>
    <div className="relative">
      <select data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-zinc-900 border border-white/10 rounded-md px-3 py-2 pr-8 text-sm font-mono text-zinc-100 focus:outline-none focus:border-white/30">
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
    </div>
  </label>
);

const Stepper = ({ step }) => {
  const steps = [{ id: 'input', label: 'jd input' }, { id: 'result', label: 'gap analysis' }, { id: 'plan', label: 'plan' }];
  const idx = step === 'analyzing' ? 0 : steps.findIndex(s => s.id === step);
  return (
    <div className="flex items-center gap-3 mt-6 font-mono text-xs">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
            i <= idx ? 'bg-amber-500 text-zinc-950 font-semibold' : 'bg-zinc-900 text-zinc-600 border border-white/10'
          }`}>{i + 1}</div>
          <div className={`${i <= idx ? 'text-zinc-100' : 'text-zinc-600'}`}>{s.label}</div>
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
  const readinessColor = readiness < 40 ? '#ef4444' : readiness < 70 ? '#f59e0b' : '#22c55e';
  return (
    <div className="mt-7 animate-fade-up" data-testid="gap-analysis">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-white/10 bg-zinc-950 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">Extracted requirements</div>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(s => (
              <span key={s.name} className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] border border-white/10 bg-white/[0.03] text-zinc-300">{s.name}</span>
            ))}
          </div>
          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">Your mastery</div>
            <div className="space-y-2.5">
              {skills.map(s => {
                const color = s.mastery < 50 ? '#ef4444' : s.mastery < 70 ? '#f59e0b' : '#22c55e';
                return (
                  <div key={s.name} className="flex items-center gap-3 font-mono text-xs">
                    <div className="w-36 truncate text-zinc-300">{s.name}</div>
                    <PixelBar value={s.mastery} width={300} height={10} color={color} dotColor={color} />
                    <div className="w-10 text-right" style={{ color }}>{s.mastery}%</div>
                    {s.mastery < 50 && <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-red-500/40 text-red-400 bg-red-500/[0.06]">gap</span>}
                  </div>
                );
              })}
            </div>
          </div>
          {analysis.suggestions?.length > 0 && (
            <div className="mt-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-2">Coach notes</div>
              <ul className="space-y-1.5 font-mono text-xs">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-zinc-300 leading-relaxed flex gap-2">
                    <span className="text-zinc-600">{(i + 1).toString().padStart(2, '0')}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-zinc-950 p-6 flex flex-col">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Readiness</div>
          <div className="mt-3">
            <div className="font-mono text-6xl font-semibold tracking-tight" style={{ color: readinessColor }}>
              {readiness}<span className="text-2xl text-zinc-700">%</span>
            </div>
            <div className="font-mono text-sm text-zinc-400 mt-2">for <span className="text-zinc-100">{c?.name} {role}</span></div>
          </div>
          <div className="mt-5">
            <PixelBar value={readiness} width={250} height={14} color={readinessColor} dotColor={readinessColor} />
          </div>
          <p className="font-mono text-xs text-zinc-500 mt-4 leading-relaxed flex-1">
            You're <span className="text-amber-400">~{Math.max(0, 100 - readiness)}%</span> away. Plan biases toward your weakest skills.
          </p>
          <button data-testid="generate-plan" onClick={onContinue}
            className="mt-5 inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
            style={{ background: '#f59e0b' }}>
            Generate 14-day plan <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

const PlanCalendar = ({ expandedDay, setExpandedDay, onReset, state }) => {
  const company = COMPANIES.find(c => c.id === state.activePlan?.company) || COMPANIES[0];
  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-5xl mx-auto">
      <Breadcrumb segments={['study-plan', `${company.id}-${state.activePlan?.role?.toLowerCase()}`, '14-day-plan']} />
      <div className="flex items-start justify-between gap-4 mt-1 mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-50">{company.name} {state.activePlan?.role} prep</h1>
          <p className="font-mono text-sm text-zinc-400 mt-3">
            Day <span className="text-zinc-100">{state.activePlan?.currentDay}</span> of {state.activePlan?.totalDays} · click any day to expand
          </p>
        </div>
        <button onClick={onReset} data-testid="regenerate-plan"
          className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-400 hover:text-zinc-50 border border-white/10 rounded-md px-3 py-2">Regenerate</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {STUDY_PLAN.map(d => {
          const isToday = d.day === state.activePlan?.currentDay;
          const isDone = d.day < (state.activePlan?.currentDay || 1);
          const isExpanded = expandedDay === d.day;
          return (
            <button key={d.day} data-testid={`plan-day-${d.day}`}
              onClick={() => setExpandedDay(isExpanded ? null : d.day)}
              className={`relative text-left p-3 rounded-md border transition-colors overflow-hidden ${
                isExpanded ? 'border-amber-500/50 bg-amber-500/[0.05]'
                : isToday ? 'border-amber-500/40 bg-amber-500/[0.04]'
                : isDone ? 'border-emerald-500/25 bg-emerald-500/[0.03]'
                : 'border-white/10 bg-zinc-950 hover:border-white/20'
              }`}>
              {(isToday || isExpanded) && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#f59e0b' }} />}
              {isDone && !isExpanded && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#22c55e' }} />}
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">day</div>
                <div className="font-mono text-lg font-semibold text-zinc-50">{d.day}</div>
              </div>
              <div className="mt-2 space-y-1">
                {d.topics.slice(0, 3).map(t => (
                  <div key={t} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-300 truncate">{t}</div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {expandedDay && (
        <div className="mt-6 rounded-lg border border-white/10 bg-zinc-950 p-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-4 font-mono text-sm">
            <span className="text-zinc-500">day {expandedDay} ·</span>
            <span className="text-zinc-100">{STUDY_PLAN[expandedDay - 1].topics.join(' · ')}</span>
          </div>
          <div className="space-y-2">
            {STUDY_PLAN[expandedDay - 1].questions.map(qId => {
              const q = QUESTIONS.find(x => x.id === qId);
              if (!q) return null;
              return (
                <div key={qId} className="flex items-start gap-3 p-3 rounded-md border border-white/5 hover:bg-white/[0.02] transition-colors">
                  <div className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/[0.05] text-amber-400 shrink-0">{COMPANIES.find(c => c.id === q.company)?.name}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-zinc-500">{q.topicPath} · {q.difficulty}</div>
                    <div className="text-zinc-100 text-sm line-clamp-2 mt-0.5" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{q.body}</div>
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
