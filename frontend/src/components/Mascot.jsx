// Reusable animated mascot ("Taaza") — an original character, not affiliated
// with any other product. A round-headed character in a purple hoodie,
// holding a coffee mug, with a real emoji face that changes per emotional
// state. People remember faces, not robots — so the expression itself is
// always a genuine emoji, not an abstract drawn shape.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const HOODIE = '#7C3AED'; // purple — Taaza's signature color, distinct from the site's blue accent

// Reveals text character-by-character, re-typing whenever the text itself changes.
function Typewriter({ text, speed = 16 }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <>{shown}</>;
}

const FACE_BY_MODE = {
  idle: '😊',
  quiz: '😊',
  happy: '😄',
  thinking: '🤔',
  surprise: '😮',
  celebrate: '🥳',
  sleepy: '😴',
  graduate: '🎓',
  look: '👀',
};

const CONFETTI_COLORS = ['#7C3AED', '#3B6FD4', '#F59E0B', '#22C55E', '#EF4444'];

function Confetti({ burstKey }) {
  const [particles] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      angle: (i / 14) * Math.PI * 2 + Math.random() * 0.4,
      distance: 40 + Math.random() * 30,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 5 + Math.random() * 4,
    }))
  );
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" key={burstKey}>
      {particles.map(p => (
        <motion.span
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: '50%', top: '30%', width: p.size, height: p.size, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance - 20,
            opacity: 0,
            rotate: 180,
          }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ── The character: round hoodie body + mug, emoji face swapped per mode ──
function Character({ mode, burstKey }) {
  const bodyVariants = {
    idle:      { y: [0, -3, 0], transition: { y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' } } },
    quiz:      { y: 0, scale: 1 },
    happy:     { y: 0, scale: 1 },
    thinking:  { y: 0, rotate: [0, -3, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } },
    surprise:  { y: -4, scale: 1.05 },
    celebrate: { y: [0, -16, 0], scale: [1, 1.12, 1], transition: { duration: 0.55, ease: 'easeOut' } },
    sleepy:    { y: 2, rotate: 4 },
    graduate:  { y: [0, -6, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } },
    look:      { y: 0 },
  };
  const armVariants = {
    idle:      { rotate: [0, -22, 0], transition: { duration: 0.9, repeat: Infinity, repeatDelay: 3.2, ease: 'easeInOut' } },
    celebrate: { rotate: [0, -35, 15, -35, 0], transition: { duration: 0.6, ease: 'easeInOut' } },
  };

  return (
    <div className="relative" style={{ width: 76, height: 76 }}>
      {mode === 'celebrate' && <Confetti burstKey={burstKey} />}
      <motion.div animate={mode} variants={bodyVariants} className="relative">
        <svg width="76" height="76" viewBox="0 0 76 76">
          {/* hood/shoulders */}
          <path d="M14 62 Q14 34 38 34 Q62 34 62 62 Z" fill={HOODIE} />
          {/* hood drawstrings */}
          <circle cx="30" cy="46" r="1.6" fill="white" opacity="0.8" />
          <circle cx="46" cy="46" r="1.6" fill="white" opacity="0.8" />
          {/* waving arm */}
          <motion.g variants={armVariants} animate={mode === 'celebrate' ? 'celebrate' : 'idle'} style={{ originX: '60px', originY: '52px' }}>
            <rect x="56" y="46" width="15" height="9" rx="4.5" fill={HOODIE} />
          </motion.g>
          {/* mug */}
          <g transform="translate(16, 54)">
            <rect x="0" y="0" width="11" height="9" rx="2" fill="#fff" opacity="0.95" />
            <path d="M11 2 Q16 2 16 5 Q16 8 11 7" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.95" />
          </g>
          {/* face circle */}
          <circle cx="38" cy="30" r="22" fill="#FBEFE3" />
        </svg>
        {/* emoji face, centered over the face circle */}
        <div
          className="absolute flex items-center justify-center"
          style={{ left: 0, top: 0, width: 76, height: 60, fontSize: 26, lineHeight: 1 }}
        >
          {FACE_BY_MODE[mode] || FACE_BY_MODE.idle}
        </div>
      </motion.div>
    </div>
  );
}

export function Mascot({
  active,
  mode = 'idle',
  message = '',
  question = null,
  onAnswer,
  hintAvailable = false,
  hintText = null,
  onRequestHint,
  feedback = null,
  onDismiss,
  onRetry,
  claim = null,
  onClaimAnswer,
  name = 'Taaza',
}) {
  const [burstKey, setBurstKey] = useState(0);
  useEffect(() => { if (mode === 'celebrate') setBurstKey(k => k + 1); }, [mode]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          data-testid="mascot"
          initial={{ x: 140, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 140, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed z-40 flex items-end gap-3"
          style={{ bottom: '88px', right: '16px', maxWidth: 'min(340px, calc(100vw - 32px))' }}
        >
          {/* Speech bubble */}
          <div
            className="rounded-2xl rounded-br-sm px-4 py-3 shadow-xl relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', minWidth: 180 }}
          >
            <button
              onClick={onDismiss}
              aria-label="Dismiss"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
            >
              <X size={12} />
            </button>

            {mode === 'quiz' && question ? (
              <div className="space-y-2.5">
                <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}><Typewriter text={question.question} /></div>
                <div className="flex flex-col gap-1.5">
                  {question.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => onAnswer?.(i)}
                      className="text-left text-xs px-3 py-2 rounded-lg transition-colors"
                      style={{ border: '1px solid var(--border-2)', color: 'var(--text-2)', background: 'var(--inset)' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : claim && !feedback ? (
              <div className="space-y-2.5">
                <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}><Typewriter text={claim.text} /></div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onClaimAnswer?.(true)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: HOODIE, color: '#fff' }}
                  >
                    Yes, exactly!
                  </button>
                  <button
                    onClick={() => onClaimAnswer?.(false)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ border: '1px solid var(--border-2)', color: 'var(--text-2)' }}
                  >
                    No, Taaza!
                  </button>
                </div>
              </div>
            ) : feedback ? (
              <div className="space-y-2.5">
                <div className="text-sm" style={{ color: feedback.correct ? 'var(--diff-easy)' : 'var(--text-1)' }}>
                  <Typewriter text={feedback.text} />
                </div>
                {!feedback.correct && hintAvailable && !hintText && (
                  <div className="flex gap-2">
                    <button
                      onClick={onRequestHint}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: HOODIE, color: '#fff' }}
                    >
                      Give me a hint
                    </button>
                    <button
                      onClick={onRetry}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ border: '1px solid var(--border-2)', color: 'var(--text-2)' }}
                    >
                      Try again
                    </button>
                  </div>
                )}
                {hintText && (
                  <div className="text-xs italic" style={{ color: 'var(--text-2)' }}>💡 <Typewriter text={hintText} /></div>
                )}
                {!feedback.correct && hintText && (
                  <button
                    onClick={onRetry}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: HOODIE, color: '#fff' }}
                  >
                    Try again
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-1)' }}><Typewriter text={message} /></div>
            )}
          </div>

          {/* Character avatar */}
          <div className="shrink-0" title={name}>
            <Character mode={mode} burstKey={burstKey} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
