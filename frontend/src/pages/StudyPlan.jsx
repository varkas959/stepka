import React, { useState, useRef } from 'react';
import { Loader2, Sparkles, ChevronDown, ArrowRight, ArrowLeft, ArrowDown, CheckCircle2, AlertTriangle, XCircle, Trophy, Brain, Eye, Flame, Target, Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { COMPANIES, QUESTIONS } from '../lib/mockData';
import { useAppState } from '../lib/appState';
import { extractSkills, generateAssessment, evaluateAssessment, generatePlan, saveReport, getGapIntelligence, challengeTurn } from '../lib/api';
import { classifySkills, prioritizedGapSkills } from '../lib/gapIntelligence';
import { coverageDepth, depthColor } from '../lib/depthIntelligence';
import { track } from '../lib/analytics';
import { supabase } from '../lib/supabaseClient';
import { PixelBar } from '../components/PixelBar';
import { DepthChallenge } from '../components/DepthChallenge';

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
  const [answers, setAnswers] = useState({});          // { qId: answerPayload }
  const [screeningResult, setScreeningResult] = useState(null);
  const [deepDiveQuestions, setDeepDiveQuestions] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [gaps, setGaps] = useState({});
  const [readiness, setReadinessScore] = useState(0);
  const [summary, setSummary] = useState('');
  const [gapIntel, setGapIntel] = useState(null);      // classified skills
  const [gapCards, setGapCards] = useState([]);        // per-skill deep cards
  const [challengeSkill, setChallengeSkill] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [reportSlug, setReportSlug] = useState(null);
  const { state, setActivePlan, setReadiness } = useAppState();

  const companyName = COMPANIES.find(c => c.id === company)?.name || company;

  // ── Step 1: Extract competencies + generate screening questions ──
  const startAssessment = async () => {
    if (isGuest) { window.location.href = '/signin'; return; }
    if (!jd.trim()) { toast.error('Paste a job description first.'); return; }
    setStep('extracting');
    track('jd_upload_started', { company: companyName, role });
    try {
      const data = await extractSkills({ jd, targetCompany: companyName, targetRole: role });
      const comps = (data.skills || []).slice(0, 10);
      setCompetencies(comps);
      track('jd_upload_completed', { company: companyName, role, skill_count: comps.length });
      const asmData = await generateAssessment({ company: companyName, role, competencies: comps, mode: 'screening' });
      setQuestions(asmData.questions || []);
      setCurrentQ(0);
      setAnswers({});
      setStep('screening');
      track('assessment_started', { company: companyName, role, question_count: (asmData.questions || []).length });
    } catch (e) {
      toast.error(e?.response?.data?.error || e.message || 'Failed.', { duration: 6000 });
      setStep('input');
    }
  };

  // ── Step 2: Record answer and advance ──
  const recordAndAdvance = (answerPayload) => {
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.id]: { ...answerPayload, competency: q.competency, question: q.question, type: q.type, correctAnswer: q.correctAnswer, correctOrder: q.correctOrder, evaluation_criteria: q.evaluation_criteria } };
    setAnswers(newAnswers);
    if (currentQ + 1 >= questions.length) {
      runEvaluation(newAnswers, 'screening');
    } else {
      setCurrentQ(i => i + 1);
    }
  };

  // ── Step 3: Evaluate screening answers ──
  const runEvaluation = async (finalAnswers, phase) => {
    setStep('evaluating');
    try {
      const qa = Object.values(finalAnswers);
      const result = await evaluateAssessment({ company: companyName, role, qa });
      if (phase === 'screening') {
        setScreeningResult(result);
        setStep('screening-results');
      } else {
        setHeatmap(result.heatmap || []);
        setGaps(result.gaps || {});
        setReadinessScore(result.readiness || 0);
        setSummary(result.summary || '');
        setReadiness(result.readiness || 0);
        track('assessment_completed', { company: companyName, role, readiness: result.readiness || 0, phase: 'deep-dive' });
        setStep('gaps');
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || e.message || 'Evaluation failed.', { duration: 6000 });
      setStep(phase === 'screening' ? 'screening' : 'deep-dive');
    }
  };

  // ── Step 4a: Skip deep-dive, go straight to gap analysis ──
  const skipDeepDive = () => {
    const r = screeningResult;
    setHeatmap(r.heatmap || []);
    setGaps(r.gaps || {});
    setReadinessScore(r.readiness || 0);
    setSummary(r.summary || '');
    setReadiness(r.readiness || 0);
    track('assessment_completed', { company: companyName, role, readiness: r.readiness || 0, phase: 'screening' });
    setStep('gaps');
  };

  // ── Step 4b: Start deep-dive ──
  const startDeepDive = async () => {
    setStep('deep-generating');
    try {
      const asmData = await generateAssessment({
        company: companyName, role,
        weakSkills: screeningResult.deepDiveSkills,
        mode: 'deep-dive',
      });
      setDeepDiveQuestions(asmData.questions || []);
      setCurrentQ(0);
      // carry forward screening answers; deep-dive answers will be merged
      setStep('deep-dive');
    } catch (e) {
      toast.error(e?.response?.data?.error || e.message || 'Failed to generate deep-dive.', { duration: 6000 });
      skipDeepDive();
    }
  };

  const recordDeepDiveAnswer = (answerPayload) => {
    const q = deepDiveQuestions[currentQ];
    const newAnswers = {
      ...answers,
      [`dd_${q.id}`]: { ...answerPayload, competency: q.competency, question: q.question, type: q.type, correctAnswer: q.correctAnswer, correctOrder: q.correctOrder, evaluation_criteria: q.evaluation_criteria },
    };
    setAnswers(newAnswers);
    if (currentQ + 1 >= deepDiveQuestions.length) {
      runEvaluation(newAnswers, 'deep-dive');
    } else {
      setCurrentQ(i => i + 1);
    }
  };

  // ── Step 4c: Gap Intelligence — classify + fetch per-skill deep cards ──
  const runGapIntelligence = async () => {
    const classified = classifySkills(heatmap, { companyId: company, role });
    setGapIntel(classified);
    setStep('gap-intel');
    track('gap_intelligence_viewed', {
      company: companyName, role,
      false_confidence: classified.falseConfidence.length,
      high_risk: classified.highRisk.length,
    });
    // Fetch deep cards for the prioritised gap skills (non-blocking for the UI)
    const targets = prioritizedGapSkills(classified).slice(0, 6);
    if (targets.length) {
      try {
        const { cards } = await getGapIntelligence({
          company: companyName, role,
          skills: targets.map(s => ({
            skill: s.skill, score: s.score, falseConfidence: s.falseConfidence,
            objectiveScore: s.objectiveScore, deepScore: s.deepScore,
            riskScore: s.riskScore, askCount: s.frequency?.askCount || 0,
            questionCount: s.frequency?.questionCount || 0,
          })),
        });
        setGapCards(cards || []);
      } catch (e) { /* cards are enhancement-only; silent fail */ }
    }
  };

  // ── Step 5: Generate plan ──
  const buildPlan = async () => {
    setStep('generating');
    try {
      const plan = await generatePlan({
        company: companyName, role, heatmap, gaps, readiness,
        falseConfidenceSkills: gapIntel?.falseConfidence.map(s => s.skill) || [],
        highRiskSkills: gapIntel?.highRisk.map(s => s.skill) || [],
      });
      setGeneratedPlan(plan);
      setActivePlan({ company, role, currentDay: 1, totalDays: 14 });
      setExpandedDay(1);
      setStep('plan');
      track('study_plan_generated', { company: companyName, role, readiness });
      // Save shareable report in background (non-blocking)
      const { data: { user } = {} } = await supabase.auth.getUser().catch(() => ({}));
      saveReport({ company: companyName, role, readiness, heatmap, gaps, summary, userId: user?.id })
        .then(({ slug }) => setReportSlug(slug))
        .catch(() => {});
    } catch (e) {
      toast.error(e?.response?.data?.error || e.message || 'Plan generation failed.', { duration: 6000 });
      setStep('gaps');
    }
  };

  if (step === 'plan') {
    return <PlanCalendar plan={generatedPlan} expandedDay={expandedDay} setExpandedDay={setExpandedDay} state={state}
      reportSlug={reportSlug}
      onReset={() => { setStep('input'); setGeneratedPlan(null); setExpandedDay(null); setReportSlug(null); }} />;
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      {step === 'input' && (
        <InputStep jd={jd} setJd={setJd} company={company} setCompany={setCompany} role={role} setRole={setRole} onStart={startAssessment} />
      )}
      {step !== 'input' && (
        <>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50 mt-1">JD → assess → plan</h1>
          <p className="text-zinc-300 mt-2 text-base max-w-xl leading-loose">
            Paste a JD, complete a mixed-format assessment, then get a personalised roadmap built on your actual gaps.
          </p>
          <Stepper step={step} />
        </>
      )}
      {(step === 'extracting') && <LoadingCard color="emerald" text="Extracting competencies…" sub="Generating 10 mixed-format questions" />}
      {(step === 'evaluating') && <LoadingCard color="amber" text="Evaluating your answers…" sub="Applying confidence-weighted scoring" />}
      {(step === 'deep-generating') && <LoadingCard color="amber" text="Preparing deep-dive questions…" sub={`Targeting your ${screeningResult?.deepDiveSkills?.length} weak areas`} />}
      {(step === 'generating') && <LoadingCard color="amber" text="Building your personalised roadmap…" sub="Tailoring every task to your gaps" />}
      {(step === 'gap-intel-loading') && <LoadingCard color="amber" text="Running Gap Intelligence…" sub="Cross-checking your answers against real interview data" />}

      {(step === 'screening' || step === 'deep-dive') && (
        <AssessmentQuiz
          questions={step === 'screening' ? questions : deepDiveQuestions}
          currentQ={currentQ}
          onAnswer={step === 'screening' ? recordAndAdvance : recordDeepDiveAnswer}
          label={step === 'deep-dive' ? 'Deep-dive' : 'Screening'}
        />
      )}

      {step === 'screening-results' && screeningResult && (
        <ScreeningResults
          result={screeningResult}
          onSkip={skipDeepDive}
          onDeepDive={startDeepDive}
        />
      )}

      {step === 'gaps' && (
        <GapView heatmap={heatmap} gaps={gaps} readiness={readiness} summary={summary}
          company={companyName} role={role} onContinue={runGapIntelligence} onBack={() => setStep('screening-results')} />
      )}

      {step === 'gap-intel' && gapIntel && (
        <GapIntelligenceView
          intel={gapIntel} cards={gapCards} company={companyName} role={role}
          onChallenge={(skill) => { setChallengeSkill(skill); setStep('challenge'); }}
          onContinue={buildPlan} onBack={() => setStep('gaps')} />
      )}

      {step === 'challenge' && challengeSkill && (
        <ChallengeMode
          company={companyName} role={role} skill={challengeSkill}
          onExit={() => setStep('gap-intel')} />
      )}
    </div>
  );
}

// ─── JD screenshot import (on-device OCR) ────────────────────────────────────
// For job sites that block text selection. OCR runs in the browser (tesseract.js,
// lazy-loaded) — no image leaves the device, so no LLM/vision cost and no upload
// to moderate. Only the extracted text flows into the existing skill extraction.
const MAX_SHOTS = 3;
const JdImport = ({ onExtract }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [used, setUsed] = useState(0);

  const handle = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const remaining = MAX_SHOTS - used;
    if (remaining <= 0) { toast.error(`Up to ${MAX_SHOTS} screenshots — paste any extra text directly.`); return; }
    const take = files.slice(0, remaining);
    if (take.some(f => f.size > 6 * 1024 * 1024)) { toast.error('Each image must be under 6 MB.'); return; }

    setBusy(true); setProgress(0);
    try {
      // Self-hosted engine/data (see public/tesseract) so nothing loads from a CDN.
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, {
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract/tesseract-core-simd-lstm.wasm.js',
        langPath: '/tesseract',
        workerBlobURL: false,
        logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); },
      });
      let text = '';
      for (let i = 0; i < take.length; i++) {
        const { data } = await worker.recognize(take[i]);
        text += (data?.text || '') + '\n\n';
      }
      await worker.terminate();
      const clean = text.replace(/\n{3,}/g, '\n\n').trim();
      if (clean.length < 40) {
        toast.error("Couldn't read enough text — try a sharper, higher-contrast screenshot.");
      } else {
        onExtract(clean);
        setUsed(u => u + take.length);
        toast.success(`Added text from ${take.length} screenshot${take.length > 1 ? 's' : ''}. Review it before continuing.`);
      }
    } catch (err) {
      console.error('[OCR] failed:', err);
      toast.error('Could not read the image. Paste the text instead.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-5 pb-3 -mt-1 flex items-center gap-3 flex-wrap">
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handle} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={busy || used >= MAX_SHOTS}
        className="inline-flex items-center gap-2 font-mono text-xs px-3 py-2 rounded-md border transition-colors hover:bg-white/[0.04] disabled:opacity-50"
        style={{ borderColor: 'var(--border-2)', color: 'var(--text-2)' }}>
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        {busy ? `Reading… ${progress}%` : "Can't copy? Upload screenshot(s)"}
      </button>
      <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
        Reads on your device · up to {MAX_SHOTS}{used > 0 ? ` · ${used}/${MAX_SHOTS} used` : ''}
      </span>
    </div>
  );
};

// ─── Input step ──────────────────────────────────────────────────────────────
const InputStep = ({ jd, setJd, company, setCompany, role, setRole, onStart }) => (
  <div className="mt-4 animate-fade-up">
    {/* Page title */}
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-50">Find out exactly what to prepare.</h1>
      <p className="text-zinc-400 mt-1.5 text-sm">Upload a job description and get a personalised gap analysis in minutes.</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-5 items-start">
      {/* Left: value proposition */}
      <div className="rounded-xl border border-white/8 p-6" style={{ background: 'var(--inset)' }}>
        <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-500 mb-4">What you get</div>
        <ul className="space-y-3.5">
          {[
            { label: 'Skill gap analysis',             desc: 'See exactly where you are weak vs. what the role needs' },
            { label: 'Interview readiness score',      desc: 'A single number from your actual answers, not self-assessment' },
            { label: 'Personalised study plan',        desc: '14-day roadmap prioritised by your specific gaps' },
            { label: 'Role-specific practice questions', desc: 'Curated questions that match your target company and level' },
          ].map(({ label, desc }) => (
            <li key={label} className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>✓</span>
              <div>
                <div className="text-sm font-medium text-zinc-100">{label}</div>
                <div className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-5 border-t border-white/6">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-500 mb-3">How it works</div>
          <div className="space-y-2.5">
            {[
              { n: '1', t: 'Paste job description', d: 'Any JD from LinkedIn, Naukri, company sites' },
              { n: '2', t: 'Answer 10 questions',   d: 'Mixed format — scenario, MCQ, ranking, free-text' },
              { n: '3', t: 'Get your roadmap',      d: 'Gap-prioritised 14-day plan built on your answers' },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[11px] font-mono font-semibold mt-0.5"
                  style={{ background: 'rgba(59,111,212,0.15)', color: '#7AA9F7', border: '1px solid rgba(59,111,212,0.25)' }}>{n}</span>
                <div>
                  <div className="text-sm text-zinc-200 font-medium">{t}</div>
                  <div className="text-[12px] text-zinc-500 leading-relaxed">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: upload card */}
      <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'var(--inset)' }}>
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/6 flex items-center gap-2" style={{ background: 'var(--inset)' }}>
          <span className="text-emerald-400 font-mono text-sm">&gt;</span>
          <span className="font-mono text-sm text-zinc-300">paste-job-description</span>
          <span className="ml-auto font-mono text-[11px] text-zinc-500 px-2 py-0.5 rounded border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>step 1 of 4</span>
        </div>

        {/* Textarea */}
        <textarea value={jd} onChange={e => setJd(e.target.value)} rows={10}
          className="w-full bg-transparent border-0 px-5 py-4 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-y leading-relaxed"
          placeholder={"// Paste the full job description here…\n//\n// Can't copy from the job site? Upload a screenshot below.\n// Or just type the role + key responsibilities."} />

        {/* Screenshot → on-device OCR (for sites that block copy) */}
        <JdImport onExtract={(t) => setJd(prev => (prev ? prev.trim() + '\n\n' : '') + t)} />

        {/* Company + Role */}
        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/6 pt-4">
          <div>
            <Select label="Target company" value={company} onChange={setCompany}
              options={ACTIVE_COMPANIES.map(c => ({ id: c.id, label: c.name }))} placeholder="Search company…" />
          </div>
          <div>
            <Select label="Target role" value={role} onChange={setRole}
              options={ACTIVE_ROLES.map(r => ({ id: r, label: r }))} placeholder="Search role…" />
          </div>
        </div>

        {/* Sample output preview */}
        <div className="mx-5 mb-4 rounded-lg border border-white/8 overflow-hidden" style={{ background: 'var(--page)' }}>
          <div className="px-4 py-2.5 border-b border-white/6 flex items-center gap-2" style={{ background: 'var(--inset)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Sample output · Business Analyst at Google</span>
          </div>
          <div className="px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600 mb-2">Detected Skills</div>
              <div className="space-y-1">
                {['SQL', 'Stakeholder Mgmt', 'Requirements'].map(s => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className="text-[11px]" style={{ color: '#22c55e' }}>✓</span>
                    <span className="font-mono text-[12px] text-zinc-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600 mb-2">Readiness Score</div>
              <div className="font-mono text-3xl font-semibold" style={{ color: '#f59e0b' }}>61<span className="text-base text-zinc-600">%</span></div>
              <div className="font-mono text-[11px] text-zinc-500 mt-1">Needs improvement</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600 mb-2">Top Gaps</div>
              <div className="space-y-1">
                {['Process Mapping', 'Data Analysis', 'Reporting'].map(g => (
                  <div key={g} className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-600">•</span>
                    <span className="font-mono text-[12px] text-zinc-400">{g}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600 mb-2">Estimated Plan</div>
              <div className="font-mono text-3xl font-semibold text-zinc-100">14<span className="text-base text-zinc-600"> days</span></div>
              <div className="font-mono text-[11px] text-zinc-500 mt-1">Personalised roadmap</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/6 flex items-center justify-between gap-3" style={{ background: 'var(--inset)' }}>
          <div className="text-[12px] font-mono text-zinc-500">
            {jd.length > 0 ? <span>{jd.length} chars · <span style={{ color: jd.length > 200 ? '#22c55e' : '#f59e0b' }}>{jd.length > 200 ? 'Good length' : 'Add more for best results'}</span></span> : 'No JD pasted yet'}
          </div>
          <button onClick={onStart} disabled={!jd.trim()}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)' }}>
            <Sparkles size={14} strokeWidth={2.5} /> Start assessment
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Loading card ─────────────────────────────────────────────────────────────
const LoadingCard = ({ color, text, sub }) => (
  <div className="mt-7 rounded-lg border border-white/10 bg-zinc-950 p-14 flex flex-col items-center animate-fade-up">
    <Loader2 size={28} className={`animate-spin ${color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`} />
    <div className="font-mono text-base text-zinc-200 mt-5">{text}</div>
    {sub && <div className="font-mono text-sm text-zinc-400 mt-1.5">{sub}</div>}
  </div>
);

// ─── Assessment quiz (dispatches to question-type components) ─────────────────
const AssessmentQuiz = ({ questions, currentQ, onAnswer, label }) => {
  const [selected, setSelected] = useState(null);      // MCQ/Scenario: 'A'|'B'|'C'|'D'
  const [rankOrder, setRankOrder] = useState([]);       // Ranking: string[]
  const [freeText, setFreeText] = useState('');

  React.useEffect(() => { setSelected(null); setRankOrder([]); setFreeText(''); }, [currentQ]);

  const q = questions[currentQ];
  if (!q) return null;
  const total = questions.length;
  const pct = Math.round((currentQ / total) * 100);

  const canSubmit = () => {
    if (q.type === 'mcq' || q.type === 'scenario_selection') return !!selected;
    if (q.type === 'ranking') return rankOrder.length === (q.items || []).length;
    return true; // free_text can be empty (skipped)
  };

  const handleNext = () => {
    if (q.type === 'mcq' || q.type === 'scenario_selection') onAnswer({ candidateAnswer: selected || '' });
    else if (q.type === 'ranking') onAnswer({ candidateOrder: rankOrder });
    else onAnswer({ candidateAnswer: freeText });
  };

  const handleSkip = () => {
    if (q.type === 'mcq' || q.type === 'scenario_selection') onAnswer({ candidateAnswer: '' });
    else if (q.type === 'ranking') onAnswer({ candidateOrder: [] });
    else onAnswer({ candidateAnswer: '' });
  };

  const TYPE_LABEL = { mcq: 'MCQ', scenario_selection: 'Scenario', ranking: 'Ranking', free_text: 'Free-text' };
  const TYPE_COLOR = { mcq: 'text-blue-400 border-blue-500/30 bg-blue-500/[0.06]', scenario_selection: 'text-purple-400 border-purple-500/30 bg-purple-500/[0.06]', ranking: 'text-amber-400 border-amber-500/30 bg-amber-500/[0.06]', free_text: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/[0.06]' };

  return (
    <div className="mt-7 animate-fade-up">
      <div className="flex items-center justify-between mb-2 font-mono text-sm text-zinc-400">
        <span>{label} · question <span className="text-zinc-100 font-semibold">{currentQ + 1}</span> of {total}</span>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded border shrink-0 ml-2 {TYPE_COLOR[q.type]}"
          style={{ color: q.type === 'mcq' ? '#60a5fa' : q.type === 'scenario_selection' ? '#c084fc' : q.type === 'ranking' ? '#fbbf24' : '#34d399' }}>
          {TYPE_LABEL[q.type]}
        </span>
      </div>
      <PixelBar value={pct} height={5} color="var(--accent)" />

      <div className="mt-4 rounded-lg border border-white/10 bg-zinc-950 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2 font-mono text-xs">
          <span className="font-mono text-[12px] px-2 py-0.5 rounded border border-white/10 bg-white/[0.03] text-zinc-300">{q.competency}</span>
        </div>
        <div className="p-5">
          <p className="text-zinc-100 text-base leading-relaxed" style={{ fontFamily: 'inherit' }}>{q.question}</p>
        </div>

        <div className="px-5 pb-5">
          {(q.type === 'mcq' || q.type === 'scenario_selection') && (
            <MCQOptions options={q.options || []} selected={selected} onSelect={setSelected} />
          )}
          {q.type === 'ranking' && (
            <RankingPicker items={q.items || []} order={rankOrder} setOrder={setRankOrder} />
          )}
          {q.type === 'free_text' && (
            <FreeTextInput value={freeText} onChange={setFreeText} criteria={q.evaluation_criteria} />
          )}
        </div>

        <div className="border-t border-white/5 p-4 flex items-center justify-between gap-3">
          <button onClick={handleSkip}
            className="font-mono text-sm px-4 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors">
            Skip →
          </button>
          <button onClick={handleNext} disabled={!canSubmit() && q.type !== 'free_text'}
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            style={{ background: 'var(--accent)' }}>
            {currentQ + 1 === total ? <>Submit <CheckCircle2 size={14} /></> : <>Next <ArrowRight size={14} strokeWidth={2.5} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

const MCQOptions = ({ options, selected, onSelect }) => (
  <div className="space-y-2">
    {options.map((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSelected = selected === letter;
      return (
        <button key={i} onClick={() => onSelect(letter)}
          className={`w-full text-left p-3 rounded-md border font-mono text-sm transition-all leading-relaxed ${
            isSelected ? 'border-blue-500/60 bg-blue-500/[0.08] text-blue-100' : 'border-white/10 text-zinc-200 hover:border-white/25 hover:bg-white/[0.03]'
          }`}>
          <span className={`font-semibold mr-2 ${isSelected ? 'text-blue-400' : 'text-zinc-400'}`}>{letter}.</span>
          {opt.replace(/^[A-D]\.\s*/, '')}
        </button>
      );
    })}
  </div>
);

const RankingPicker = ({ items, order, setOrder }) => {
  const remaining = items.filter(item => !order.includes(item));
  const addItem = (item) => setOrder(prev => [...prev, item]);
  const removeItem = (item) => setOrder(prev => prev.filter(x => x !== item));

  return (
    <div>
      <p className="font-mono text-sm text-zinc-400 mb-3">Click items in priority order (1st = highest priority):</p>
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {remaining.map(item => (
            <button key={item} onClick={() => addItem(item)}
              className="font-mono text-sm px-3 py-1.5 rounded-md border border-white/15 bg-zinc-900 text-zinc-200 hover:border-blue-500/40 hover:text-blue-300 transition-colors">
              {item}
            </button>
          ))}
        </div>
      )}
      {order.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-zinc-400 mb-2">Your order:</div>
          {order.map((item, i) => (
            <div key={item} className="flex items-center gap-2 p-2 rounded-md border border-emerald-500/25 bg-emerald-500/[0.04]">
              <span className="font-mono text-sm text-emerald-400 w-4 shrink-0">{i + 1}.</span>
              <span className="font-mono text-sm text-zinc-200 flex-1">{item}</span>
              <button onClick={() => removeItem(item)} className="font-mono text-[12px] text-zinc-500 hover:text-red-400 transition-colors">✕</button>
            </div>
          ))}
        </div>
      )}
      {order.length < items.length && (
        <p className="font-mono text-[12px] text-zinc-500 mt-2">{items.length - order.length} item(s) remaining</p>
      )}
    </div>
  );
};

const FreeTextInput = ({ value, onChange, criteria }) => (
  <div>
    {criteria?.length > 0 && (
      <div className="mb-3 p-3 rounded-md border border-zinc-800 bg-zinc-900/50">
        <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-zinc-400 mb-1.5">Strong answers cover:</div>
        <ul className="space-y-0.5">
          {criteria.map((c, i) => <li key={i} className="font-mono text-sm text-zinc-300 leading-relaxed">· {c}</li>)}
        </ul>
      </div>
    )}
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={5}
      placeholder="Type your answer… or skip if you don't know."
      className="w-full bg-zinc-900 border border-white/10 rounded-md p-4 text-base font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/30 resize-y leading-loose" />
  </div>
);

// ─── Screening results ────────────────────────────────────────────────────────
const ScreeningResults = ({ result, onSkip, onDeepDive }) => {
  const { heatmap, gaps, readiness, summary, needsDeepDive, deepDiveCount, deepDiveSkills } = result;
  const rc = readiness < 40 ? '#ef4444' : readiness < 60 ? '#f97316' : readiness < 75 ? '#f59e0b' : '#22c55e';
  return (
    <div className="mt-7 animate-fade-up space-y-4">
      <div className="rounded-lg border border-white/10 bg-zinc-950 p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-400 mb-1">Screening results</div>
        <div className="flex items-end gap-4 mt-2 mb-4 flex-wrap">
          <div className="font-mono text-5xl font-semibold" style={{ color: rc }}>{readiness}<span className="text-xl text-zinc-500">%</span></div>
          <div className="flex-1 min-w-[180px] pb-1"><PixelBar value={readiness} height={12} color={rc} dotColor={rc} /></div>
        </div>
        {summary && <p className="font-mono text-sm text-zinc-300 leading-loose">{summary}</p>}
      </div>

      <div className="rounded-lg border border-white/10 bg-zinc-950 p-5">
        <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-400 mb-3">Preliminary heatmap</div>
        <div className="space-y-2.5">
          {heatmap.map(h => {
            const color = BAND_COLOR[h.band] || '#a1a1aa';
            const Icon = BAND_ICON[h.band] || AlertTriangle;
            return (
              <div key={h.skill} className="flex items-center gap-2 font-mono text-sm">
                <Icon size={11} style={{ color }} className="shrink-0" />
                <span className="text-zinc-200 w-32 sm:w-44 truncate shrink-0">{h.skill}</span>
                <div className="flex-1 min-w-0"><PixelBar value={h.score} height={9} color={color} dotColor={color} /></div>
                <span className="w-9 text-right shrink-0" style={{ color }}>{h.score}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {needsDeepDive && deepDiveSkills?.length > 0 ? (
        <div className="rounded-lg p-5" style={{ border: '1px solid rgba(59,111,212,0.3)', background: 'rgba(59,111,212,0.04)' }}>
          <div className="flex items-start gap-3">
            <Brain size={18} style={{ color: '#7AA9F7' }} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-mono text-base text-zinc-100 font-semibold">
                We identified {deepDiveSkills.length} area{deepDiveSkills.length > 1 ? 's' : ''} that need deeper evaluation
              </div>
              <p className="font-mono text-sm text-zinc-300 mt-1.5 leading-loose">
                A {deepDiveCount}-question deep-dive on <span style={{ color: '#7AA9F7' }}>{deepDiveSkills.map(s => s.skill).join(', ')}</span> will give your plan much higher accuracy.
              </p>
              <div className="flex gap-2 mt-4 flex-wrap">
                <button onClick={onDeepDive}
                  className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--accent)' }}>
                  Continue deep-dive ({deepDiveCount} questions) <ArrowRight size={13} strokeWidth={2.5} />
                </button>
                <button onClick={onSkip}
                  className="font-mono text-sm px-4 py-2.5 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors">
                  Skip → Generate plan now
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button onClick={onSkip}
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity"
            style={{ background: 'var(--accent)' }}>
            Generate personalised plan <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Final gap view ───────────────────────────────────────────────────────────
const GapView = ({ heatmap, gaps, readiness, summary, company, role, onContinue, onBack }) => {
  const rc = readiness < 40 ? '#ef4444' : readiness < 60 ? '#f97316' : readiness < 75 ? '#f59e0b' : '#22c55e';
  return (
    <div className="mt-7 animate-fade-up space-y-4">
      <div className="rounded-lg border border-white/10 bg-zinc-950 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-400 mb-2">Final readiness · {company} {role}</div>
            <div className="font-mono text-6xl font-semibold" style={{ color: rc }}>{readiness}<span className="text-2xl text-zinc-500">%</span></div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <PixelBar value={readiness} height={14} color={rc} dotColor={rc} />
            {summary && <p className="font-mono text-sm text-zinc-300 mt-3 leading-loose">{summary}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-zinc-950 p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-400 mb-4">Skills heatmap</div>
        <div className="space-y-3">
          {heatmap.map(h => {
            const color = BAND_COLOR[h.band] || '#a1a1aa';
            const Icon = BAND_ICON[h.band] || AlertTriangle;
            return (
              <div key={h.skill}>
                <div className="flex items-center gap-3 mb-0.5 font-mono text-sm">
                  <Icon size={12} style={{ color }} className="shrink-0" />
                  <span className="text-zinc-100 w-36 sm:w-48 truncate shrink-0">{h.skill}</span>
                  <div className="flex-1 min-w-0"><PixelBar value={h.score} height={10} color={color} dotColor={color} /></div>
                  <span className="w-10 text-right shrink-0 font-semibold" style={{ color }}>{h.score}%</span>
                  <span className="hidden sm:block text-[10px] px-1.5 py-0.5 rounded border shrink-0" style={{ color, borderColor: color + '50', background: color + '10' }}>{h.band}</span>
                </div>
                {h.feedback && <p className="font-mono text-[12px] text-zinc-400 ml-5 leading-loose">{h.feedback}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {(gaps.critical?.length > 0 || gaps.weak?.length > 0 || gaps.moderate?.length > 0 || gaps.strong?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gaps.critical?.length > 0 && <GapBucket color="#ef4444" label="Critical gaps" items={gaps.critical} desc="Front-loaded days 1–7 with maximum effort." />}
          {gaps.weak?.length > 0 && <GapBucket color="#f97316" label="Weak areas" items={gaps.weak} desc="Covered days 5–10 with targeted exercises." />}
          {gaps.moderate?.length > 0 && <GapBucket color="#f59e0b" label="Moderate" items={gaps.moderate} desc="Reinforced in mid-plan revision sessions." />}
          {gaps.strong?.length > 0 && <GapBucket color="#22c55e" label="Strengths" items={gaps.strong} desc="Maintenance cadence — minimal prep needed." />}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <button onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-sm px-3 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
          <ArrowLeft size={13} /> Back
        </button>
        <button onClick={onContinue}
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--accent)' }}>
          Generate personalised roadmap <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

const GapBucket = ({ color, label, items, desc }) => (
  <div className="rounded-md border p-4" style={{ borderColor: color + '40', background: color + '08' }}>
    <div className="font-mono text-[12px] uppercase tracking-[0.18em] mb-2" style={{ color }}>{label}</div>
    <div className="flex flex-wrap gap-1.5 mb-2">
      {items.map(s => <span key={s} className="font-mono text-xs px-2 py-0.5 rounded border" style={{ color, borderColor: color + '40', background: color + '10' }}>{s}</span>)}
    </div>
    <p className="font-mono text-[12px] text-zinc-400 leading-loose">{desc}</p>
  </div>
);

// ─── Gap Intelligence view ────────────────────────────────────────────────────
// The differentiator: classifies skills into 4 evidence-backed categories and
// surfaces per-skill "why it matters / what they test / mistakes / activities".
const GapIntelligenceView = ({ intel, cards, company, role, onChallenge, onContinue, onBack }) => {
  const { strong, weak, falseConfidence, highRisk } = intel;
  const cardBySkill = Object.fromEntries((cards || []).map(c => [c.skill, c]));
  const [openSkill, setOpenSkill] = useState(null);
  const [depthSkill, setDepthSkill] = useState(null);       // skill being depth-probed
  const [depthBySkill, setDepthBySkill] = useState({});     // skill -> deepest level passed

  const CATS = [
    { key: 'highRisk',  items: highRisk,        Icon: Flame,        color: '#ef4444', label: 'High interview risk',
      blurb: 'Weak AND frequently asked at this company/role. Fix these first — highest expected impact.' },
    { key: 'falseConf', items: falseConfidence, Icon: Eye,          color: '#a855f7', label: 'False confidence',
      blurb: 'You recognised correct answers but could not recall or articulate them. The interview tests recall, not recognition.' },
    { key: 'weak',      items: weak,            Icon: AlertTriangle,color: '#f97316', label: 'Weak skills',
      blurb: 'Below interview bar. Targeted practice will move these fastest.' },
    { key: 'strong',    items: strong,          Icon: CheckCircle2, color: '#22c55e', label: 'Strong skills',
      blurb: 'At or above bar. Maintain, do not over-invest.' },
  ];

  return (
    <div className="mt-7 animate-fade-up space-y-4">
      <div className="rounded-lg border border-white/10 bg-zinc-950 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={16} style={{ color: '#7AA9F7' }} />
          <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-300">Gap Intelligence</div>
        </div>
        <p className="font-mono text-sm text-zinc-400 leading-loose mt-1">
          Not a generic skill list — this is built from <span className="text-zinc-200">your actual answers</span> cross-checked against <span className="text-zinc-200">real reported {company} interview questions</span>.
        </p>
      </div>

      {/* Four categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATS.map(({ key, items, Icon, color, label, blurb }) => (
          <div key={key} className="rounded-lg border p-4" style={{ borderColor: color + '33', background: color + '07' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={14} style={{ color }} />
              <span className="font-mono text-[12px] uppercase tracking-[0.16em]" style={{ color }}>{label}</span>
              <span className="ml-auto font-mono text-xs text-zinc-500">{items.length}</span>
            </div>
            <p className="font-mono text-[11px] text-zinc-500 leading-relaxed mb-2.5">{blurb}</p>
            {items.length === 0 ? (
              <p className="font-mono text-xs text-zinc-600">None detected.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {items.map(h => (
                  <span key={h.skill} className="font-mono text-xs px-2 py-0.5 rounded border" style={{ color, borderColor: color + '40', background: color + '10' }}>
                    {h.skill} <span className="opacity-60">{h.score}%</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Per-skill deep cards */}
      {prioritizedGapSkills(intel).slice(0, 6).map(h => {
        const card = cardBySkill[h.skill];
        const isOpen = openSkill === h.skill;
        return (
          <div key={h.skill} className="rounded-lg border border-white/10 bg-zinc-950 overflow-hidden">
            <button onClick={() => setOpenSkill(isOpen ? null : h.skill)} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.02] transition-colors">
              {h.falseConfidence ? <Eye size={14} className="shrink-0" style={{ color: '#a855f7' }} />
                : h.highRisk ? <Flame size={14} className="shrink-0" style={{ color: '#ef4444' }} />
                : <AlertTriangle size={14} className="shrink-0" style={{ color: '#f97316' }} />}
              <span className="font-mono text-sm text-zinc-100 font-semibold">{h.skill}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-zinc-400">risk {h.riskScore}</span>
              {h.frequency?.questionCount > 0 && (
                <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline">asked ~{h.frequency.askCount}× · {h.frequency.questionCount} reported</span>
              )}
              <ChevronDown size={15} className={`ml-auto text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                {/* Coverage vs Depth — the core Depth Intelligence signal */}
                {(() => {
                  const { coverage, depth } = coverageDepth(h, depthBySkill[h.skill]);
                  const probed = typeof depthBySkill[h.skill] === 'number';
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <CovDepthBar label="Coverage" sub="Do you know it?" value={coverage} color="#7AA9F7" />
                      <CovDepthBar label="Depth" sub={probed ? `Level ${depthBySkill[h.skill]}/5 · probed` : 'How deep can you defend it?'} value={depth} color={depthColor(depth)} />
                    </div>
                  );
                })()}
                {!card ? (
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-500"><Loader2 size={13} className="animate-spin" /> Generating intelligence for this skill…</div>
                ) : (
                  <>
                    <Field label="Why it matters in interviews" text={card.whyItMatters} />
                    <Field label="What interviewers are actually testing" text={card.whatTheyTest} />
                    {card.commonMistakes?.length > 0 && (
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Most common mistakes</div>
                        <ul className="space-y-1">
                          {card.commonMistakes.map((m, i) => <li key={i} className="font-mono text-[13px] text-zinc-300 leading-relaxed flex gap-2"><span className="text-red-400">✕</span>{m}</li>)}
                        </ul>
                      </div>
                    )}
                    {card.activities?.length > 0 && (
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Targeted practice</div>
                        <div className="space-y-2">
                          {card.activities.map((a, i) => (
                            <div key={i} className="rounded-md border border-white/8 bg-white/[0.02] p-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Target size={12} style={{ color: '#7AA9F7' }} />
                                <span className="font-mono text-[13px] text-zinc-100 font-medium">{a.title}</span>
                                {a.time && <span className="ml-auto font-mono text-[10px] text-zinc-500">{a.time}</span>}
                              </div>
                              {a.outcome && <div className="font-mono text-[12px] text-zinc-400 mt-1 leading-relaxed">→ {a.outcome}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setDepthSkill(h.skill)}
                    className="inline-flex items-center gap-2 font-mono text-xs font-semibold px-3 py-2 rounded-md text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'var(--accent)' }}>
                    <ArrowDown size={13} /> Challenge my understanding
                  </button>
                  <button onClick={() => onChallenge(h.skill)}
                    className="inline-flex items-center gap-2 font-mono text-xs font-semibold px-3 py-2 rounded-md border transition-colors hover:bg-white/[0.04]"
                    style={{ borderColor: 'var(--border-2)', color: 'var(--text-2)' }}>
                    <Brain size={13} /> Full adaptive interview
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <DepthChallenge open={!!depthSkill} onOpenChange={(v) => !v && setDepthSkill(null)}
        skill={depthSkill} company={company} role={role}
        onComplete={(lvl) => setDepthBySkill(m => ({ ...m, [depthSkill]: lvl }))} />

      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 font-mono text-sm px-3 py-2 rounded-md border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
          <ArrowLeft size={13} /> Back
        </button>
        <button onClick={onContinue} className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] px-5 py-2.5 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--accent)' }}>
          Generate gap-driven roadmap <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, text }) => text ? (
  <div>
    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-1">{label}</div>
    <p className="text-[14px] text-zinc-200 leading-loose">{text}</p>
  </div>
) : null;

// Coverage vs Depth mini-bar for the Gap Intelligence skill cards.
const CovDepthBar = ({ label, sub, value, color }) => (
  <div className="rounded-md border border-white/8 bg-white/[0.02] p-3">
    <div className="flex items-baseline justify-between mb-1">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">{label}</span>
      <span className="font-mono text-sm font-semibold" style={{ color }}>{value}%</span>
    </div>
    <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: 'var(--surface-2)' }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
    </div>
    <div className="font-mono text-[10px] text-zinc-500">{sub}</div>
  </div>
);

// ─── Challenge My Readiness — adaptive interviewer ─────────────────────────────
const ChallengeMode = ({ company, role, skill, onExit }) => {
  const [transcript, setTranscript] = useState([]);   // [{ q, a }]
  const [current, setCurrent] = useState(null);        // { nextQuestion, probeReason, gapDetected, depthReached, confidence }
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [verdict, setVerdict] = useState(null);

  // Kick off with the opening question
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await challengeTurn({ company, role, skill, transcript: [] });
        if (cancelled) return;
        if (r.done) { setDone(true); setVerdict(r); }
        else setCurrent(r);
      } catch (e) { toast.error(e?.response?.data?.error || 'Challenge failed to start.'); onExit(); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!current) return;
    const newTranscript = [...transcript, { q: current.nextQuestion, a: answer.trim() }];
    setTranscript(newTranscript);
    setAnswer('');
    setCurrent(null);
    setLoading(true);
    try {
      const r = await challengeTurn({ company, role, skill, transcript: newTranscript });
      if (r.done) { setDone(true); setVerdict(r); }
      else setCurrent(r);
    } catch (e) { toast.error(e?.response?.data?.error || 'Challenge failed.'); }
    finally { setLoading(false); }
  };

  const cc = (c) => c < 40 ? '#ef4444' : c < 70 ? '#f59e0b' : '#22c55e';

  return (
    <div className="mt-7 animate-fade-up space-y-4">
      <div className="rounded-lg p-5" style={{ border: '1px solid rgba(124,58,237,0.35)', background: 'rgba(124,58,237,0.06)' }}>
        <div className="flex items-center gap-2">
          <Brain size={16} style={{ color: '#a855f7' }} />
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-zinc-200">Challenge mode · {skill}</div>
          <button onClick={onExit} className="ml-auto font-mono text-xs text-zinc-400 hover:text-zinc-100 border border-white/10 rounded px-2.5 py-1">Exit</button>
        </div>
        <p className="font-mono text-[12px] text-zinc-400 mt-2 leading-loose">
          A senior interviewer probes one question at a time, drilling into your answers until your true depth is clear.
        </p>
      </div>

      {/* Transcript */}
      {transcript.map((t, i) => (
        <div key={i} className="space-y-2">
          <div className="rounded-md border border-white/8 bg-zinc-950 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1">Interviewer · Q{i + 1}</div>
            <p className="text-[14px] text-zinc-100 leading-relaxed">{t.q}</p>
          </div>
          <div className="rounded-md border border-white/5 bg-zinc-900/40 p-4 ml-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1">You</div>
            <p className="text-[14px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{t.a || <span className="text-zinc-600 italic">(skipped)</span>}</p>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex items-center gap-2 font-mono text-sm text-zinc-400 px-1"><Loader2 size={14} className="animate-spin" /> Interviewer is thinking…</div>
      )}

      {/* Active question */}
      {!done && current && !loading && (
        <div className="rounded-lg border border-white/10 bg-zinc-950 p-5">
          {current.gapDetected && (
            <div className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2">
              <span className="font-mono text-[11px] text-amber-400">Gap detected: </span>
              <span className="font-mono text-[12px] text-zinc-300">{current.gapDetected}</span>
            </div>
          )}
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1">Interviewer · Q{transcript.length + 1}</div>
          <p className="text-[15px] text-zinc-100 leading-relaxed mb-1">{current.nextQuestion}</p>
          {current.probeReason && <p className="font-mono text-[11px] text-zinc-500 italic mb-3">why this: {current.probeReason}</p>}
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4}
            placeholder="Answer in your own words. Be specific — vague answers get probed harder."
            className="w-full bg-zinc-900 border border-white/10 rounded-md p-3 text-[14px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-y leading-relaxed" />
          <div className="flex items-center justify-between mt-3 gap-3">
            <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-500">
              <span>depth {current.depthReached}/5</span>
              <span>·</span>
              <span style={{ color: cc(current.confidence) }}>confidence {current.confidence}%</span>
            </div>
            <button onClick={submit}
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold px-4 py-2 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: '#7C3AED' }}>
              Submit answer <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Verdict */}
      {done && verdict && (
        <div className="rounded-lg border border-white/10 bg-zinc-950 p-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-zinc-300 mb-3">Verdict · {skill}</div>
          <div className="flex items-end gap-4 mb-3 flex-wrap">
            <div className="font-mono text-4xl font-semibold" style={{ color: cc(verdict.confidence) }}>{verdict.depthReached}<span className="text-lg text-zinc-500">/5</span></div>
            <div className="font-mono text-sm text-zinc-400 pb-1">demonstrated depth · interviewer confidence {verdict.confidence}%</div>
          </div>
          {verdict.verdict && <p className="text-[14px] text-zinc-200 leading-loose">{verdict.verdict}</p>}
          <button onClick={onExit} className="mt-4 inline-flex items-center gap-2 font-mono text-sm font-semibold px-4 py-2 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--accent)' }}>
            <ArrowLeft size={13} /> Back to Gap Intelligence
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Share panel ─────────────────────────────────────────────────────────────
const SharePanel = ({ slug }) => {
  const [copied, setCopied] = React.useState(false);
  if (!slug) return null;
  const url = `${window.location.origin}/r/${slug}`;
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mb-5 rounded-lg p-4" style={{ border: '1px solid rgba(59,111,212,0.25)', background: 'rgba(59,111,212,0.05)' }}>
      <div className="flex items-center gap-2 mb-3">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="3" cy="7" r="1.5" stroke="var(--accent)" strokeWidth="1.5"/><circle cx="11" cy="2.5" r="1.5" stroke="var(--accent)" strokeWidth="1.5"/><circle cx="11" cy="11.5" r="1.5" stroke="var(--accent)" strokeWidth="1.5"/><path d="M4.4 6.35L9.6 3.15M4.4 7.65L9.6 10.85" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>Share your readiness report</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 font-mono text-xs px-3 py-2 rounded-md truncate" style={{ background: 'rgba(0,0,0,0.3)', color: '#D1D5DB', border: '1px solid var(--border)' }}>{url}</div>
        <button onClick={copy} className="shrink-0 font-mono text-xs px-3 py-2 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--accent)' }}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
      <div className="flex gap-2 mt-2.5">
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
           className="flex-1 text-center font-mono text-xs py-1.5 rounded-md transition-opacity hover:opacity-80"
           style={{ border: '1px solid var(--border)', color: '#9CA3AF' }}>LinkedIn</a>
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('My interview readiness score is live. See the breakdown:')}`} target="_blank" rel="noopener noreferrer"
           className="flex-1 text-center font-mono text-xs py-1.5 rounded-md transition-opacity hover:opacity-80"
           style={{ border: '1px solid var(--border)', color: '#9CA3AF' }}>Twitter / X</a>
        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`My interview readiness report: ${url}`)}`} target="_blank" rel="noopener noreferrer"
           className="flex-1 text-center font-mono text-xs py-1.5 rounded-md transition-opacity hover:opacity-80"
           style={{ border: '1px solid var(--border)', color: '#9CA3AF' }}>WhatsApp</a>
      </div>
    </div>
  );
};

// ─── Plan calendar ────────────────────────────────────────────────────────────
const PlanCalendar = ({ plan, expandedDay, setExpandedDay, state, onReset, reportSlug }) => {
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
          <p className="font-mono text-sm text-zinc-300 mt-2">Tap any day · mock interviews in blue · today in green</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {plan?.successProbability && (
            <div className="font-mono text-xs border border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400 px-3 py-1.5 rounded-md">
              <Trophy size={11} className="inline mr-1.5" />success: {plan.successProbability}
            </div>
          )}
          <button onClick={onReset} className="font-mono text-sm uppercase tracking-[0.18em] text-zinc-300 hover:text-zinc-50 border border-white/10 rounded-md px-3 py-2">New plan</button>
        </div>
      </div>

      <SharePanel slug={reportSlug} />

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map(d => {
          const isToday = d.day === currentDay;
          const isDone = d.day < currentDay;
          const isExpanded = expandedDay === d.day;
          const isMock = mockDays.has(d.day);
          return (
            <button key={d.day} onClick={() => setExpandedDay(isExpanded ? null : d.day)}
              className={`relative text-left p-2 rounded-md border transition-all overflow-hidden ${
                isExpanded ? 'border-blue-500/60 bg-blue-500/[0.07] ring-1 ring-blue-500/20'
                : isMock ? 'border-blue-500/40 bg-blue-500/[0.05] hover:border-blue-500/60'
                : isToday ? 'border-emerald-500/40 bg-emerald-500/[0.04]'
                : isDone ? 'border-white/5 bg-zinc-950 opacity-60'
                : 'border-white/10 bg-zinc-950 hover:border-white/20'
              }`}>
              {isExpanded && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: 'var(--accent)' }} />}
              {!isExpanded && isToday && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#22c55e' }} />}
              {!isExpanded && isMock && !isToday && <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: '#3b82f6' }} />}
              <div className="font-mono text-[9px] text-zinc-500">d{d.day}</div>
              <div className="font-mono text-base font-semibold text-zinc-50">{d.day}</div>
              {isMock && <div className="font-mono text-[8px] text-blue-400 mt-0.5">mock</div>}
              <div className="mt-0.5 font-mono text-[8px] text-zinc-500 truncate">{d.focus?.split('·')[0]?.trim()}</div>
            </button>
          );
        })}
      </div>

      {expandedData && (
        <div className="mt-4 rounded-lg border border-white/10 bg-zinc-950 p-5 sm:p-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-zinc-400">day {expandedData.day}</span>
            <span className="text-zinc-500">·</span>
            <span className="font-mono text-base text-zinc-100 font-semibold">{expandedData.focus}</span>
            {expandedData.theme && <span className="font-mono text-[12px] text-zinc-400 hidden sm:block">{expandedData.theme}</span>}
            {expandedData.mockInterview && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-blue-500/40 bg-blue-500/[0.08] text-blue-400">
                {expandedData.mockInterview.type} · {expandedData.mockInterview.duration}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {/* New structured day model — outcome / task / success / avoid / time */}
              {(expandedData.outcome || expandedData.task) ? (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {expandedData.estimatedTime && (
                      <div className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-1 rounded border border-white/10 text-zinc-400">
                        ⏱ {expandedData.estimatedTime}
                      </div>
                    )}
                    {expandedData.depthTarget && (
                      <div className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-1 rounded border"
                        style={{ borderColor: 'var(--accent-35)', background: 'var(--accent-12)', color: 'var(--accent)' }}>
                        ↓ Depth target: Level {expandedData.depthTarget}/5
                      </div>
                    )}
                  </div>
                  {expandedData.outcome && (
                    <DayField color="#22c55e" label="Outcome" text={expandedData.outcome} />
                  )}
                  {expandedData.task && (
                    <DayField color="#7AA9F7" label="Task" text={expandedData.task} />
                  )}
                  {expandedData.successCriteria && (
                    <DayField color="#f59e0b" label="Success criteria" text={expandedData.successCriteria} />
                  )}
                  {expandedData.avoid && (
                    <DayField color="#ef4444" label="Avoid" text={expandedData.avoid} />
                  )}
                  {expandedData.commonFailure && (
                    <DayField color="#a855f7" label="Common failure" text={expandedData.commonFailure} />
                  )}
                </div>
              ) : (
                <>
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-400 mb-3">Study tasks</div>
                  <ol className="space-y-2.5">
                    {(expandedData.tasks || []).map((task, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="font-mono text-[12px] text-zinc-500 mt-0.5 shrink-0 w-4">{i + 1}.</span>
                        <span className="text-zinc-200 text-base leading-loose" style={{ fontFamily: 'inherit' }}>{task}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
            <div>
              <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-400 mb-3">Practice questions</div>
              <div className="space-y-2.5">
                {(expandedData.practiceQuestions || []).map((q, i) => (
                  <div key={i} className="p-3 rounded-md" style={{ border: '1px solid rgba(59,111,212,0.2)', background: 'rgba(59,111,212,0.03)' }}>
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[10px] shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>Q{i + 1}</span>
                      <span className="text-zinc-100 text-base leading-loose" style={{ fontFamily: 'inherit' }}>{q}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {expandedData.mockInterview && (
            <div className="mt-5 rounded-md border border-blue-500/30 bg-blue-500/[0.05] p-4">
              <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-blue-400 mb-1">Mock interview · {expandedData.mockInterview.type}</div>
              <p className="font-mono text-sm text-zinc-200">Topics: {expandedData.mockInterview.topics?.join(', ')}</p>
              <p className="font-mono text-sm text-zinc-400 mt-1">Duration: {expandedData.mockInterview.duration} · score honestly and note weaknesses</p>
            </div>
          )}
        </div>
      )}

      {plan?.mockInterviews?.length > 0 && (
        <div className="mt-5 rounded-lg border border-white/10 bg-zinc-950 p-5">
          <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-400 mb-3">Mock interview schedule</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {plan.mockInterviews.map(m => (
              <div key={m.day} className="rounded-md border border-blue-500/30 bg-blue-500/[0.05] p-3">
                <div className="font-mono text-[12px] text-blue-400 uppercase">Day {m.day}</div>
                <div className="font-mono text-base text-zinc-100 mt-0.5 font-semibold">{m.type}</div>
                <div className="font-mono text-[12px] text-zinc-400 mt-0.5">{m.duration}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Day field (structured plan day) ──────────────────────────────────────────
const DayField = ({ color, label, text }) => (
  <div className="border-l-2 pl-3" style={{ borderColor: color }}>
    <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-0.5" style={{ color }}>{label}</div>
    <p className="text-zinc-200 text-[15px] leading-loose" style={{ fontFamily: 'inherit' }}>{text}</p>
  </div>
);

// ─── Stepper ──────────────────────────────────────────────────────────────────
const Stepper = ({ step }) => {
  const steps = [{ id: 'input', label: 'JD input' }, { id: 'screening', label: 'assessment' }, { id: 'gaps', label: 'gap analysis' }, { id: 'plan', label: 'roadmap' }];
  const loadingMap = { extracting: 'input', evaluating: 'screening', 'screening-results': 'screening', 'deep-generating': 'screening', 'deep-dive': 'screening', 'deep-evaluating': 'screening', 'gap-intel': 'gaps', 'gap-intel-loading': 'gaps', challenge: 'gaps', generating: 'gaps' };
  const activeId = loadingMap[step] || step;
  const idx = steps.findIndex(s => s.id === activeId);
  return (
    <div className="flex items-center gap-2 mt-6 font-mono text-xs flex-wrap">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] transition-colors ${i < idx ? 'bg-emerald-500 text-zinc-950 font-semibold' : i === idx ? 'text-white font-semibold' : 'bg-zinc-900 text-zinc-600 border border-white/10'}`}
               style={i === idx ? { background: 'var(--accent)' } : {}}>
            {i < idx ? '✓' : i + 1}
          </div>
          <div className={i <= idx ? 'text-zinc-100' : 'text-zinc-500'}>{s.label}</div>
          {i < steps.length - 1 && <div className="w-5 h-px bg-white/10 mx-0.5" />}
        </div>
      ))}
    </div>
  );
};

// ─── Select ──────────────────────────────────────────────────────────────────
const Select = ({ label, value, onChange, options, placeholder = 'Type or select…' }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = React.useRef(null);
  const displayLabel = options.find(o => o.id === value)?.label || value || '';
  const filtered = search ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())) : options;
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref}>
      <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-zinc-400 mb-1.5">{label}</div>
      <div className="relative">
        <input value={open ? search : displayLabel} onChange={e => { setSearch(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setSearch(''); }} placeholder={placeholder}
          className="w-full bg-zinc-900 border border-white/10 rounded-md p-2.5 pr-8 text-sm font-mono text-zinc-100 focus:outline-none focus:border-white/30 placeholder:text-zinc-500" />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        {open && (
          <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-md border border-white/10 bg-zinc-900 shadow-xl">
            {filtered.map(o => (
              <button key={o.id} type="button" onMouseDown={() => { onChange(o.id); setSearch(''); setOpen(false); }}
                className={`w-full text-left px-3 py-2 font-mono text-sm hover:bg-white/5 transition-colors ${value === o.id ? 'text-blue-400' : 'text-zinc-200'}`}>
                {o.label}
              </button>
            ))}
            {search && !filtered.find(o => o.label.toLowerCase() === search.toLowerCase()) && (
              <button type="button" onMouseDown={() => { onChange(search); setSearch(''); setOpen(false); }}
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
  <div className="font-mono text-sm mb-4" style={{ color: '#6B7280' }}>
    <span style={{ color: 'var(--accent)' }}>~</span>
    {segments.map((s, i) => (
      <span key={i}><span className="mx-1.5">/</span><span style={{ color: i === segments.length - 1 ? '#D1D5DB' : '#6B7280' }}>{s}</span></span>
    ))}
  </div>
);
