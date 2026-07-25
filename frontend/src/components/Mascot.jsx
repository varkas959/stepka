// Reusable animated mascot ("Kai") — an original character, not affiliated
// with any other product. Currently a round-headed hoodie-and-mug SVG
// character with an emoji face; swap to real Kai sprite images once
// available (see public/mascot/ — the pose-to-mode mapping stays here).
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const HOODIE = '#7C3AED'; // purple — Kai's signature color, distinct from the site's blue accent

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

// Real Kai sprite images. Only two clean poses exist so far (a neutral
// wink-and-point, and an arms-up celebration) — every mode maps to whichever
// of the two reads closer, so the character never flips to the hand-drawn
// SVG fallback mid-flow (that jump reads as "wrong mascot" to users). Swap
// individual entries to dedicated sprites as new poses are exported.
const SPRITE_BY_MODE = {
  idle: '/mascot/kai-wink.png',
  look: '/mascot/kai-wink.png',
  quiz: '/mascot/kai-wink.png',
  thinking: '/mascot/kai-wink.png',
  surprise: '/mascot/kai-wink.png',
  sleepy: '/mascot/kai-wink.png',
  happy: '/mascot/kai-happy.png',
  celebrate: '/mascot/kai-happy.png',
  graduate: '/mascot/kai-happy.png',
};

// Ambient, task-free chit-chat — shown when the user pokes the idle mascot
// or pulls it back out of its docked tab, so it feels alive between quizzes.
const FRIENDLY_MESSAGES = [
  "Hope your day's going good! \u{1F60A}",
  "Just checking in — you're doing great.",
  "Take a breather if you need one, I'll be right here.",
  "Fun fact: every concept you learn compounds. Keep at it!",
  "Coffee break? I won't judge ☕",
  "You've got this — one concept at a time.",
  "Curious minds ship better code. Keep exploring!",
  "Confused now, confident later — that's just how learning works.",
];

const WELCOME_BACK_MESSAGES = [
  "Hey, I'm back! Miss me? \u{1F604}",
  "Ready when you are!",
  "Let's pick up right where we left off.",
  "Back in action — what are we learning next?",
];

// The pose shown in the docked tab. Fixed on purpose — see the docked-tab
// render below for why it must not follow the live mode.
const DOCKED_SPRITE = '/mascot/kai-wink.png';

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

// ── The character: real Kai sprite where available, drawn SVG fallback otherwise ──
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

  const sprite = SPRITE_BY_MODE[mode];

  return (
    <div className="relative" style={{ width: 76, height: 76 }}>
      {mode === 'celebrate' && <Confetti burstKey={burstKey} />}
      <motion.div animate={mode} variants={bodyVariants} className="relative" style={{ width: 76, height: 76 }}>
        {sprite ? (
          <img
            src={sprite}
            alt="Kai"
            width={76}
            height={76}
            style={{ width: 76, height: 76, objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(124,58,237,0.25))' }}
          />
        ) : (
          <>
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
          </>
        )}
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
  onRetry,
  claim = null,
  onClaimAnswer,
  name = 'Kai',
  // Docked state is optionally controlled. Pass `docked` + `onDockedChange`
  // to hoist it (so dismissing Kai can persist across pages); omit both and
  // the component manages it internally, staying usable on its own.
  docked: dockedProp,
  onDockedChange,
}) {
  const [burstKey, setBurstKey] = useState(0);
  const [internalDocked, setInternalDocked] = useState(false);
  const [clickReaction, setClickReaction] = useState(null);
  const reactionTimer = useRef(null);

  const isControlled = dockedProp !== undefined;
  const docked = isControlled ? dockedProp : internalDocked;
  const setDocked = useCallback((next) => {
    if (!isControlled) setInternalDocked(next);
    onDockedChange?.(next);
  }, [isControlled, onDockedChange]);

  useEffect(() => { if (mode === 'celebrate') setBurstKey(k => k + 1); }, [mode]);
  useEffect(() => () => { if (reactionTimer.current) clearTimeout(reactionTimer.current); }, []);

  // Clear any in-flight ambient reaction once the parent hands us real
  // task-driven content (a question, a claim, feedback) so it never fights
  // with the actual quiz flow for the bubble.
  useEffect(() => {
    if (question || claim || feedback) setClickReaction(null);
  }, [question, claim, feedback]);

  const fireReaction = (pool) => {
    const text = pool[Math.floor(Math.random() * pool.length)];
    setClickReaction(text);
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => setClickReaction(null), 4200);
  };

  // Dismissing no longer removes Kai — it tucks him into a small peeking
  // tab on the left edge of the screen instead, so he's always one click away.
  const handleDock = () => setDocked(true);
  const handleUndock = () => {
    setDocked(false);
    fireReaction(WELCOME_BACK_MESSAGES);
  };

  const isAmbientClickable = !question && !(claim && !feedback) && !feedback &&
    ['idle', 'look', 'happy', 'sleepy', 'graduate'].includes(mode);
  const handleCharacterClick = () => {
    if (!isAmbientClickable) return;
    fireReaction(FRIENDLY_MESSAGES);
  };

  return (
    <>
    <AnimatePresence>
      {active && docked && (
        <motion.button
          key="docked-tab"
          onClick={handleUndock}
          aria-label={`Bring ${name} back`}
          title={`Bring ${name} back`}
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: [0, 6, 0], opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{
            x: { repeat: Infinity, duration: 2.2, ease: 'easeInOut', repeatDelay: 1 },
            opacity: { duration: 0.25 },
          }}
          className="fixed z-40 flex items-center justify-end rounded-full shadow-lg"
          style={{
            // Vertically centred via calc rather than translateY(-50%): this
            // element animates `x`, and framer-motion owns the transform
            // property outright, so any transform set here would be clobbered.
            top: 'calc(50% - 28px)',
            left: '-28px',
            width: 56,
            height: 56,
            paddingRight: 6,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          {/* Deliberately a fixed pose, not SPRITE_BY_MODE[mode]: while Kai is
              tucked away he should be a calm, stable affordance. Following the
              live mode made the tab flip between faces on scroll/idle, which
              read as him randomly looking surprised or sad. */}
          {/* Sized/offset so Kai's face lands in the ~28px of the tab that is
              actually on screen — the left half sits outside the viewport. */}
          <img
            src={DOCKED_SPRITE}
            alt=""
            aria-hidden="true"
            width={28}
            height={28}
            style={{ width: 28, height: 28, objectFit: 'contain' }}
          />
        </motion.button>
      )}
    </AnimatePresence>
    <AnimatePresence>
      {active && !docked && (
        <motion.div
          key="mascot-full"
          data-testid="mascot"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
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
              onClick={handleDock}
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
                    No, Kai!
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
              <div className="text-sm" style={{ color: 'var(--text-1)' }}>
                <Typewriter text={clickReaction || message} />
              </div>
            )}
          </div>

          {/* Character avatar */}
          <div
            className="shrink-0"
            title={isAmbientClickable ? `Say hi to ${name}` : name}
            onClick={handleCharacterClick}
            style={{ cursor: isAmbientClickable ? 'pointer' : 'default' }}
          >
            <Character mode={mode} burstKey={burstKey} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
