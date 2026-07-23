import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { useAppState } from '../lib/appState';
import { JAVA_CONCEPTS, getConceptById } from '../lib/javaConcepts';
import { Mascot } from '../components/Mascot';

const ACC = 'var(--accent)';

export default function JavaConceptsSimple() {
  const { state, addXp, setJavaLearnProgress } = useAppState();
  const completed = state.javaLearn?.completedConceptIds || [];
  const lastConceptId = state.javaLearn?.lastConceptId;
  const lastConcept = lastConceptId ? getConceptById(lastConceptId) : null;

  const [openId, setOpenId] = useState(lastConceptId || JAVA_CONCEPTS[0].id);
  const [mascotActive, setMascotActive] = useState(true);
  const [mode, setMode] = useState('greet');
  const [activeQuiz, setActiveQuiz] = useState(null); // { conceptId, question }
  const [feedback, setFeedback] = useState(null);

  const greeting = lastConcept
    ? `Welcome back! You were on ${lastConcept.title} last time — want to pick up where you left off?`
    : `Hi, I'm Taaza! Let's make Java concepts simple. Pick one below to get started.`;

  const startQuiz = (concept) => {
    const q = concept.quiz[0];
    setActiveQuiz({ conceptId: concept.id, question: q });
    setFeedback(null);
    setMode('quiz');
    setMascotActive(true);
  };

  const answerQuiz = (optionIndex) => {
    const { conceptId, question } = activeQuiz;
    const correct = optionIndex === question.correctIndex;
    setJavaLearnProgress(conceptId);

    if (correct) {
      addXp(10);
      setMode('celebrate');
      setFeedback({ correct: true, text: question.explainCorrect });
      toast.success('Nice work! +10 XP');
    } else {
      setMode('encourage');
      setFeedback({ correct: false, text: question.explainIncorrect });
      toast('Not quite — but that\'s how learning works. Want to try again?');
    }
  };

  const retryQuiz = () => {
    setFeedback(null);
    setMode('quiz');
  };

  return (
    <div className="px-4 md:px-10 py-4 md:py-6 max-w-3xl mx-auto" data-testid="java-concepts-page">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
        Java Concepts, Explained Simply
      </h1>
      <p className="font-mono text-sm mt-2" style={{ color: 'var(--text-2)' }}>
        Every concept as an analogy a 5th grader would get — then the real code.
      </p>

      <div className="mt-6 space-y-2.5">
        {JAVA_CONCEPTS.map((concept) => {
          const isOpen = openId === concept.id;
          const isDone = completed.includes(concept.id);
          return (
            <div key={concept.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <button
                onClick={() => setOpenId(isOpen ? null : concept.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                {isOpen ? <ChevronDown size={16} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />}
                <span className="text-xl">{concept.analogy.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-[15px]" style={{ color: 'var(--text-1)' }}>{concept.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>{concept.tagline}</div>
                </div>
                {isDone && (
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--diff-easy)', opacity: 0.9 }}>
                    <Check size={13} color="#fff" strokeWidth={3} />
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-5 pt-1 space-y-4">
                  <div className="rounded-lg p-4 text-sm leading-relaxed" style={{ background: 'var(--accent-12)', color: 'var(--text-1)', border: '1px solid var(--accent-35)' }}>
                    {concept.analogy.text}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{concept.explainer}</p>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-3)' }}>{concept.codeExample.label}</div>
                    <pre className="rounded-lg p-4 text-xs overflow-x-auto font-mono" style={{ background: 'var(--inset)', color: 'var(--text-1)', border: '1px solid var(--border)' }}>
                      {concept.codeExample.code}
                    </pre>
                  </div>
                  <button
                    onClick={() => startQuiz(concept)}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white"
                    style={{ background: ACC }}
                  >
                    Quick check — am I getting this?
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Mascot
        active={mascotActive}
        mode={mode}
        greeting={greeting}
        question={mode === 'quiz' ? activeQuiz?.question : null}
        onAnswer={answerQuiz}
        feedback={mode === 'celebrate' || mode === 'encourage' ? feedback : null}
        onDismiss={() => setMascotActive(false)}
        onRetry={retryQuiz}
      />
    </div>
  );
}
