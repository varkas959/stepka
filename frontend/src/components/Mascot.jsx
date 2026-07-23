// Reusable animated mascot — a friendly original robot character (not affiliated
// with or copied from any other product's mascot). Slides in from the bottom
// right, greets, asks small comprehension questions, and reacts with
// encouragement or celebration. Generic enough to reuse on other pages later
// (Practice.jsx, DailyReview.jsx) by wiring different greeting/question props.
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const ACC = 'var(--accent)';

// ── The robot itself — plain inline SVG, animated via framer-motion variants ──
function RobotFace({ mode }) {
  const bodyVariants = {
    idle:      { rotate: 0, y: [0, -4, 0], transition: { y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } } },
    greet:     { rotate: 0, y: [0, -4, 0], transition: { y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } } },
    quiz:      { rotate: 0, y: 0 },
    celebrate: { rotate: 0, scale: [1, 1.18, 1], y: [0, -14, 0], transition: { duration: 0.6, ease: 'easeOut' } },
    encourage: { rotate: [0, -4, 4, -4, 0], transition: { duration: 0.7, ease: 'easeInOut' } },
  };
  const armVariants = {
    idle:      { rotate: 0 },
    greet:     { rotate: [0, -18, 0, -18, 0], transition: { duration: 1.1, ease: 'easeInOut' } },
    quiz:      { rotate: 0 },
    celebrate: { rotate: [0, -30, 20, -30, 0], transition: { duration: 0.6, ease: 'easeInOut' } },
    encourage: { rotate: 0 },
  };
  const eyeShape = mode === 'celebrate' ? 'M -4 0 Q 0 -4 4 0' : mode === 'encourage' ? 'M -4 -1 Q 0 2 4 -1' : null;

  return (
    <motion.svg width="72" height="72" viewBox="0 0 72 72" animate={mode} variants={bodyVariants}>
      {/* body */}
      <rect x="14" y="20" width="44" height="40" rx="14" fill={ACC} />
      {/* antenna */}
      <line x1="36" y1="20" x2="36" y2="8" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
      <circle cx="36" cy="6" r="4" fill={ACC} />
      {/* arm (waves on greet/celebrate) */}
      <motion.g variants={armVariants} animate={mode} style={{ originX: '58px', originY: '34px' }}>
        <rect x="54" y="30" width="16" height="8" rx="4" fill={ACC} />
      </motion.g>
      {/* face plate */}
      <rect x="22" y="30" width="28" height="20" rx="8" fill="white" />
      {/* eyes */}
      {eyeShape ? (
        <>
          <path d={eyeShape} stroke="#1a1d26" strokeWidth="2.5" fill="none" transform="translate(31,39)" />
          <path d={eyeShape} stroke="#1a1d26" strokeWidth="2.5" fill="none" transform="translate(41,39)" />
        </>
      ) : (
        <>
          <circle cx="31" cy="39" r="2.6" fill="#1a1d26" />
          <circle cx="41" cy="39" r="2.6" fill="#1a1d26" />
        </>
      )}
      {/* mouth */}
      <path
        d={mode === 'celebrate' ? 'M 30 45 Q 36 51 42 45' : mode === 'encourage' ? 'M 31 47 Q 36 44 41 47' : 'M 31 46 Q 36 49 41 46'}
        stroke="#1a1d26" strokeWidth="2" fill="none" strokeLinecap="round"
      />
    </motion.svg>
  );
}

export function Mascot({
  active,
  mode = 'idle',
  greeting = '',
  question = null,
  onAnswer,
  feedback = null,
  onDismiss,
  onRetry,
  name = 'Taaza',
}) {
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
                <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{question.question}</div>
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
            ) : feedback ? (
              <div className="space-y-2.5">
                <div className="text-sm" style={{ color: feedback.correct ? 'var(--diff-easy)' : 'var(--text-1)' }}>
                  {feedback.text}
                </div>
                {!feedback.correct && onRetry && (
                  <button
                    onClick={onRetry}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: ACC, color: '#fff' }}
                  >
                    Try again
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-1)' }}>{greeting}</div>
            )}
          </div>

          {/* Robot avatar */}
          <div className="shrink-0" title={name}>
            <RobotFace mode={mode} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
