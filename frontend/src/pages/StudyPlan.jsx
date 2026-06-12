import React, { useMemo, useState } from 'react';
import { Loader2, Sparkles, ChevronDown, ArrowRight, Info, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { COMPANIES, ROLES, STUDY_PLAN, QUESTIONS } from '../lib/mockData';

// Derive only companies and roles that actually have questions
const ACTIVE_COMPANY_IDS = [...new Set(QUESTIONS.map(q => q.company))];
const ACTIVE_COMPANIES = COMPANIES.filter(c => ACTIVE_COMPANY_IDS.includes(c.id));
const ACTIVE_ROLES = [...new Set(QUESTIONS.map(q => q.role))];
import { useAppState } from '../lib/appState';
import { extractSkills, generatePlan } from '../lib/api';
import { PixelBar } from '../components/PixelBar';

// 5 mastery levels — user self-rates each extracted skill
const MASTERY = [
  { v: 0,  label: 'no exp',       pct: 5,   color: '#ef4444' },
  { v: 25, label: 'novice',       pct: 25,  color: '#ef4444' },
  { v: 50, label: 'intermediate', pct: 50,  color: '#f59e0b' },
  { v: 75, label: 'strong',       pct: 75,  color: '#22c55e' },
  { v: 95, label: 'expert',       pct: 95,  color: '#22c55e' },
];

export default function StudyPlan({ isGuest = false }) {
  const [step, setStep] = useState('input'); // input | extracting | assess | result | plan
  const [jd, setJd] = useState('We are hiring a Senior Software Engineer (SDE2) for our Payments team.\nResponsibilities: design distributed payment processing pipelines, own Kafka topics, partner with infra on latency.\nMust have: 4+ years Java, distributed systems, system design, LLD, microservices on AWS.');
  const [company, setCompany] = useState('amazon');
  const [role, setRole] = useState('SDE2');
  const [expandedDay, setExpandedDay] = useState(1);
  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState({});
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const { state, setActivePlan, setReadiness } = useAppState();

  const readiness = useMemo(() => {
    if (!skills.length) return 0;
    let num = 0, den = 0;
    skills.forEach(s => {
      const r = ratings[s.name] ?? 25; // default novice if unrated
      num += r * (s.weight || 3);
      den += (s.weight || 3);
    });
    return den ? Math.round(num / den) : 0;
  }, [skills, ratings]);

  const extract = async () => {
    if (isGuest) { window.location.href = '/signin'; return; }
    setStep('extracting');
    try {
      const data = await extractSkills({ jd, targetCompany: company, targetRole: role });
      const sk = (data.skills || []).slice(0, 10);
      setSkills(sk);
      // pre-fill mid mastery
      const r = {}; sk.forEach(s => { r[s.name] = 50; });
      setRatings(r);
      setStep('assess');
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.detail || e.message || 'Could not extract skills.';
      toast.error(msg, { duration: 6000 });
      setStep('input');
    }
  };

  const computeReadiness = () => {
    setReadiness(readiness);
    setStep('result');
  };

  const activatePlan = async () => {
    setStep('generating');
    try {
      const skillsPayload = skills.map(s => ({
        name: s.name,
        weight: s.weight || 3,
        mastery: ratings[s.name] ?? 25,
      }));
      const companyName = COMPANIES.find(c => c.id === company)?.name || company;
      const plan = await generatePlan({ company: companyName, role, skills: skillsPayload });
      setGeneratedPlan(plan);
      setActivePlan({ company, role, currentDay: 1, totalDays: 14, dueQuestions: 5 });
      setExpandedDay(1);
      setStep('plan');
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Could not generate plan.';
      toast.error(msg, { duration: 6000 });
      setStep('result');
    }
  };

  if (step === 'plan') return <PlanCalendar plan={generatedPlan} expandedDay={expandedDay} setExpandedDay={setExpandedDay} onReset={() => { setStep('input'); setGeneratedPlan(null); }} state={state} />;

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-4xl mx-auto">
      <Breadcrumb segments={['study-plan', step]} />
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-50 mt-1">JD → self-assess → plan</h1>
      <p className="text-zinc-400 mt-3 text-base max-w-xl leading-relaxed">
        Paste a JD, then rate yourself on each extracted skill. Stepkai weights your ratings against the JD's importance to compute readiness.
      </p>

      <Stepper step={step} />

      {step === 'input' && (
        <div className="mt-7 rounded-lg border border-white/10 bg-zinc-950 animate-fade-up">
          <div className="px-5 py-3 border-b border-white/5 font-mono text-xs flex items-center gap-2">
            <span className="text-emerald-400">&gt;</span>
            <span className="text-zinc-500">paste-job-description</span>
            <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-zinc-600">step 1 of 3</span>
          </div>
          <textarea data-testid="jd-textarea" value={jd} onChange={(e) => setJd(e.target.value)} rows={9}
            className="w-full bg-transparent border-0 p-5 text-sm font-mono text-zinc-100 placeholder:text-zinc-700 focus:outline-none resize-y"
            placeholder="// paste the JD here…" />
          <div className="border-t border-white/5 p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="target company" value={company} onChange={setCompany} testid="jd-company" options={ACTIVE_COMPANIES.map(c => ({ id: c.id, label: c.name }))} />
            <Select label="target role"    value={role}    onChange={setRole}    testid="jd-role"    options={ACTIVE_ROLES.map(r => ({ id: r, label: r }))} />
          </div>
          <div className="border-t border-white/5 p-5 flex items-center justify-between">
            <div className="font-mono text-xs text-zinc-500">{jd.length} chars</div>
            <button data-testid="analyze-jd" onClick={extract} disabled={!jd.trim()}
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all disabled:opacity-50"
              style={{ background: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 24px -8px rgba(245,158,11,0.6)' }}>
              <Sparkles size={14} strokeWidth={2.5} /> Extract skills
            </button>
          </div>
        </div>
      )}

      {step === 'extracting' && (
        <div className="mt-7 rounded-lg border border-white/10 bg-zinc-950 p-14 flex flex-col items-center" data-testid="analyzing">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
          <div className="font-mono text-sm text-zinc-300 mt-5">extracting required skills…</div>
        </div>
      )}

      {step === 'generating' && (
        <div className="mt-7 rounded-lg border border-white/10 bg-zinc-950 p-14 flex flex-col items-center">
          <Loader2 size={28} className="animate-spin text-amber-400" />
          <div className="font-mono text-sm text-zinc-300 mt-5">generating your 14-day plan…</div>
          <div className="font-mono text-xs text-zinc-600 mt-2">tailoring to your skill gaps</div>
        </div>
      )}

      {step === 'assess' && (
        <SelfAssess
          skills={skills}
          ratings={ratings}
          setRating={(name, v) => setRatings(r => ({ ...r, [name]: v }))}
          readiness={readiness}
          onBack={() => setStep('input')}
          onContinue={computeReadiness}
        />
      )}

      {step === 'result' && (
        <GapAnalysis
          skills={skills}
          ratings={ratings}
          readiness={readiness}
          company={company}
          role={role}
          onContinue={activatePlan}
          onBack={() => setStep('assess')}
        />
      )}
    </div>
  );
}

const SelfAssess = ({ skills, ratings, setRating, readiness, onBack, onContinue }) => (
  <div className="mt-7 animate-fade-up" data-testid="self-assess">
    <div className="rounded-lg border border-white/10 bg-zinc-950 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Step 2 · self-assess</div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 mt-1">Rate yourself honestly</h2>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">live readiness</div>
          <div className="font-mono text-3xl font-semibold" style={{ color: readiness < 40 ? '#ef4444' : readiness < 70 ? '#f59e0b' : '#22c55e' }}>{readiness}%</div>
        </div>
      </div>
      <p className="font-mono text-xs text-zinc-500 mb-5">// pick a mastery level for each extracted skill · pick fewer/lower if unsure</p>

      <div className="space-y-4">
        {skills.map(s => {
          const cur = ratings[s.name] ?? 50;
          return (
            <div key={s.name} className="rounded-md border border-white/5 bg-white/[0.02] p-3" data-testid={`assess-row-${s.name}`}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="font-mono text-sm text-zinc-100 truncate">{s.name}</div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/[0.05] text-amber-400 shrink-0">
                    weight {s.weight || 3}/5
                  </span>
                </div>
                <div className="font-mono text-xs text-zinc-400">{cur}%</div>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {MASTERY.map(m => {
                  const active = cur === m.v;
                  return (
                    <button key={m.v} data-testid={`mastery-${s.name}-${m.v}`}
                      onClick={() => setRating(s.name, m.v)}
                      className={`font-mono text-[9px] sm:text-[11px] py-1.5 px-0.5 rounded border transition-colors overflow-hidden whitespace-nowrap text-ellipsis ${
                        active
                          ? 'border-emerald-500/50 bg-emerald-500/[0.10] text-emerald-300'
                          : 'border-white/10 text-zinc-500 hover:text-zinc-100 hover:border-white/25'
                      }`}>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6 gap-2 flex-wrap">
        <button onClick={onBack} data-testid="assess-back"
          className="inline-flex items-center gap-1.5 font-mono text-sm px-3 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
          <ArrowLeft size={13} /> Back to JD
        </button>
        <button data-testid="assess-continue" onClick={onContinue}
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
          style={{ background: '#f59e0b' }}>
          See gap analysis <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </div>
);

const GapAnalysis = ({ skills, ratings, readiness, company, role, onContinue, onBack }) => {
  const c = COMPANIES.find(x => x.id === company);
  const rc = readiness < 40 ? '#ef4444' : readiness < 70 ? '#f59e0b' : '#22c55e';
  return (
    <div className="mt-7 animate-fade-up" data-testid="gap-analysis">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-white/10 bg-zinc-950 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">Your mastery vs JD weight</div>
          <div className="space-y-2.5">
            {skills.map(s => {
              const m = ratings[s.name] ?? 25;
              const color = m < 50 ? '#ef4444' : m < 70 ? '#f59e0b' : '#22c55e';
              return (
                <div key={s.name} className="flex items-center gap-3 font-mono text-xs">
                  <div className="w-28 sm:w-40 truncate text-zinc-300 shrink-0">{s.name}</div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/[0.05] text-amber-400 shrink-0">w{s.weight}</span>
                  <div className="flex-1 min-w-0"><PixelBar value={m} height={10} color={color} dotColor={color} /></div>
                  <div className="w-10 text-right shrink-0" style={{ color }}>{m}%</div>
                  {m < 50 && <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-red-500/40 text-red-400 bg-red-500/[0.06] shrink-0">gap</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-zinc-950 p-6 flex flex-col">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Readiness</div>
          <div className="mt-3">
            <div className="font-mono text-6xl font-semibold" style={{ color: rc }}>{readiness}<span className="text-2xl text-zinc-700">%</span></div>
            <div className="font-mono text-sm text-zinc-400 mt-2">for <span className="text-zinc-100">{c?.name} {role}</span></div>
          </div>
          <div className="mt-5">
            <PixelBar value={readiness} height={14} color={rc} dotColor={rc} />
          </div>
          <p className="font-mono text-xs text-zinc-500 mt-4 leading-relaxed flex-1">
            You're <span className="text-amber-400">~{Math.max(0, 100 - readiness)}%</span> away. Plan biases toward your weakest skills.
          </p>
          <div className="flex gap-2 mt-5">
            <button onClick={onBack} data-testid="gap-back"
              className="font-mono text-xs px-3 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
              ← Re-rate
            </button>
            <button data-testid="generate-plan" onClick={onContinue}
              className="flex-1 inline-flex items-center justify-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-zinc-950 hover:brightness-110 transition-all"
              style={{ background: '#f59e0b' }}>
              Generate plan <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-zinc-950 p-5" data-testid="gap-criteria">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-emerald-400" />
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">How we measure the gap</div>
        </div>
        <p className="font-mono text-xs text-zinc-400 leading-relaxed">
          <span className="text-emerald-400">// formula</span> &nbsp;readiness = Σ(your_mastery × jd_weight) ÷ Σ(jd_weight), clamped 0–100.
          Skill weights come from Gemini's JD parse (1=nice-to-have, 5=must-have). Your mastery comes from the self-assessment you just completed.
          We don't guess for you — your inputs drive the score.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
          <Criterion color="#22c55e" label="≥ 70% — strong" desc="counts toward readiness; plan keeps it on a maintenance cadence" />
          <Criterion color="#f59e0b" label="50–69% — warn"   desc="plan adds spaced repetitions in this topic to lift recall" />
          <Criterion color="#ef4444" label="< 50% — gap"     desc="plan front-loads this skill across days 1–7" />
          <Criterion color="#a1a1aa" label="weight"          desc="higher JD weight = larger contribution to the final score" />
        </div>
      </div>
    </div>
  );
};

const Criterion = ({ color, label, desc }) => (
  <div className="rounded-md border border-white/5 bg-white/[0.02] p-3">
    <div className="flex items-center gap-2 font-mono text-[11px]">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span style={{ color }}>{label}</span>
    </div>
    <p className="font-mono text-[11px] text-zinc-500 mt-1 leading-relaxed">{desc}</p>
  </div>
);

const Select = ({ label, value, onChange, options, testid }) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const ref = React.useRef(null);
  const displayLabel = options.find(o => o.id === value)?.label || value || '';
  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="block" ref={ref}>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 mb-1.5">{label}</div>
      <div className="relative">
        <input
          data-testid={testid}
          value={open ? search : displayLabel}
          onChange={e => { setSearch(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setSearch(''); }}
          placeholder={`Type or select…`}
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
            {filtered.length === 0 && search && (
              <button type="button"
                onMouseDown={() => { onChange(search); setSearch(''); setOpen(false); }}
                className="w-full text-left px-3 py-2 font-mono text-sm text-emerald-400 hover:bg-white/5">
                Use "{search}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Stepper = ({ step }) => {
  const steps = [
    { id: 'input', label: 'jd input' },
    { id: 'assess', label: 'self-assess' },
    { id: 'result', label: 'gap & plan' },
  ];
  const idx = step === 'extracting' ? 0 : steps.findIndex(s => s.id === step);
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

const PlanCalendar = ({ plan, expandedDay, setExpandedDay, onReset, state }) => {
  const company = COMPANIES.find(c => c.id === state.activePlan?.company) || COMPANIES[0];
  const days = plan?.days || [];
  const currentDay = state.activePlan?.currentDay || 1;
  const expandedData = days.find(d => d.day === expandedDay);

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-5xl mx-auto">
      <Breadcrumb segments={['study-plan', `${company.id}-${state.activePlan?.role?.toLowerCase()}`, '14-day-plan']} />
      <div className="flex items-start justify-between gap-4 mt-1 mb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-zinc-50">{company.name} · {state.activePlan?.role} prep</h1>
          <p className="font-mono text-sm text-zinc-400 mt-3">Day <span className="text-zinc-100">{currentDay}</span> of 14 · tap any day to expand</p>
        </div>
        <button onClick={onReset} data-testid="regenerate-plan" className="shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-zinc-400 hover:text-zinc-50 border border-white/10 rounded-md px-3 py-2">New plan</button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map(d => {
          const isToday = d.day === currentDay;
          const isDone = d.day < currentDay;
          const isExpanded = expandedDay === d.day;
          return (
            <button key={d.day} data-testid={`plan-day-${d.day}`} onClick={() => setExpandedDay(isExpanded ? null : d.day)}
              className={`relative text-left p-2 sm:p-3 rounded-md border transition-colors overflow-hidden ${
                isExpanded ? 'border-amber-500/50 bg-amber-500/[0.05]'
                : isToday ? 'border-amber-500/40 bg-amber-500/[0.04]'
                : isDone ? 'border-emerald-500/25 bg-emerald-500/[0.03]'
                : 'border-white/10 bg-zinc-950 hover:border-white/20'
              }`}>
              {(isToday || isExpanded) && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#f59e0b' }} />}
              {isDone && !isExpanded && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#22c55e' }} />}
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">d{d.day}</div>
              <div className="font-mono text-base sm:text-lg font-semibold text-zinc-50">{d.day}</div>
              <div className="mt-1 font-mono text-[9px] text-zinc-500 truncate leading-tight">{d.focus?.split('·')[0]?.trim()}</div>
            </button>
          );
        })}
      </div>

      {expandedData && (
        <div className="mt-6 rounded-lg border border-white/10 bg-zinc-950 p-5 sm:p-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">day {expandedData.day}</span>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-sm text-zinc-100">{expandedData.focus}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-3">Study tasks</div>
              <ol className="space-y-2">
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
              <div className="space-y-2">
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
