// Tiny procedural sound effects for the mascot — generated tones via the Web
// Audio API, not audio files, so there's nothing to host or license. Every
// call site triggers these synchronously from a real click handler, since
// browsers require audio playback to be tied to a user gesture.

let ctx = null;
function getCtx() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, startOffset, duration, gainPeak = 0.08) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const t0 = audioCtx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(gainPeak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playCorrect() {
  try { tone(660, 0, 0.14); tone(880, 0.1, 0.18); } catch { /* audio unsupported/blocked, ignore */ }
}

export function playIncorrect() {
  try { tone(220, 0, 0.22, 0.06); } catch { /* ignore */ }
}

export function playCelebrate() {
  try { tone(523, 0, 0.14); tone(659, 0.1, 0.14); tone(784, 0.2, 0.3); } catch { /* ignore */ }
}
