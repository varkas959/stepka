// App-aware wrapper around <Mascot>. Keeps Mascot.jsx a pure presentational
// component while centralising the two things every page would otherwise
// re-implement: the persisted "user tucked Kai away" preference, and the
// idle/scroll ambient behaviour.
//
// Pages drive Kai by passing `mode` + `message` (and optionally quiz props).
// Everything else — docking, idle yawns, glancing on scroll — happens here.
import { useCallback, useEffect, useRef } from 'react';
import { useKaiDismissed } from '../lib/useKaiDismissed';
import { Mascot } from './Mascot';

const IDLE_TIMEOUT_MS = 30000;

export function KaiCompanion({
  mode = 'idle',
  message = '',
  onModeChange,
  onMessageChange,
  // Ambient behaviour is on by default, but a page mid-quiz can disable it
  // so an idle yawn never interrupts a graded moment.
  ambient = true,
  // Lets a page say "this moment matters, show Kai even if he's tucked away"
  // — e.g. an end-of-session celebration. Any page can use this; it is not
  // tied to quiz-shaped props.
  demandAttention = false,
  ...mascotProps
}) {
  const [dismissed, setDismissed] = useKaiDismissed();

  // A quiz question, a teach-back claim, or an explicit page request all mean
  // Kai has something the user needs to see right now. This override is
  // deliberately TRANSIENT: it does not clear the stored preference, so once
  // the moment passes Kai returns to his docked tab instead of the dismissal
  // being silently revoked forever.
  const needsAttention = !!(mascotProps.question || mascotProps.claim || demandAttention);
  const docked = dismissed && !needsAttention;

  // Callbacks live in refs so the ambient effects below depend only on real
  // state. Otherwise a caller passing an inline arrow would tear down and
  // re-register the window listeners on every render, and the idle timer
  // would be restarted so often the yawn could never fire.
  const onModeChangeRef = useRef(onModeChange);
  const onMessageChangeRef = useRef(onMessageChange);
  useEffect(() => { onModeChangeRef.current = onModeChange; }, [onModeChange]);
  useEffect(() => { onMessageChangeRef.current = onMessageChange; }, [onMessageChange]);

  const idleTimer = useRef(null);
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      // Only yawn from a genuinely idle state — never interrupt a graded moment.
      if (modeRef.current === 'idle' || modeRef.current === 'look') {
        onModeChangeRef.current?.('sleepy');
        onMessageChangeRef.current?.('*yawn* Still there? Take your time.');
      }
    }, IDLE_TIMEOUT_MS);
  }, []);

  // One listener pair drives all ambient behaviour: waking from a yawn,
  // glancing on scroll, and restarting the idle countdown. Suppressed while
  // docked — a dismissed Kai should be completely inert, not quietly cycling
  // through moods behind his own tucked-away tab.
  useEffect(() => {
    if (!ambient || docked) return undefined;
    let lookTimeout = null;

    resetIdleTimer();

    const wake = () => {
      if (modeRef.current === 'sleepy') {
        onModeChangeRef.current?.('idle');
        onMessageChangeRef.current?.('Oh, welcome back!');
      }
      resetIdleTimer();
    };

    const onScroll = () => {
      wake();
      if (modeRef.current === 'idle') onModeChangeRef.current?.('look');
      clearTimeout(lookTimeout);
      lookTimeout = setTimeout(() => {
        if (modeRef.current === 'look') onModeChangeRef.current?.('idle');
      }, 1200);
    };

    window.addEventListener('click', wake);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      clearTimeout(lookTimeout);
      window.removeEventListener('click', wake);
      window.removeEventListener('scroll', onScroll);
    };
  }, [ambient, docked, resetIdleTimer]);

  return (
    <Mascot
      active
      mode={mode}
      message={message}
      docked={docked}
      onDockedChange={setDismissed}
      {...mascotProps}
    />
  );
}
