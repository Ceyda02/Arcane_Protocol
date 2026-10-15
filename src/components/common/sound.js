/**
 * Optional sound: tiny synthesized tones, no audio files, no autoplay. Muted by default.
 * Original, generated at runtime, so there are no third-party audio licenses to track.
 */
let ctx = null;
function getCtx() {
  if (ctx) return ctx;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  try { ctx = new AC(); } catch { ctx = null; }
  return ctx;
}
const SOUNDS = {
  click: [[520, 0.05]],
  page: [[300, 0.06], [380, 0.08]],
  correct: [[523, 0.09], [659, 0.09], [784, 0.14]],
  wrong: [[220, 0.12], [185, 0.16]],
  complete: [[392, 0.1], [494, 0.1], [587, 0.1], [784, 0.25]],
  open: [[262, 0.08], [330, 0.08], [392, 0.1]],
};
export function playSound(name, settings) {
  if (!settings || settings.muted || settings.volume <= 0) return;
  const c = getCtx();
  const seq = SOUNDS[name];
  if (!c || !seq) return;
  try {
    if (c.state === 'suspended') c.resume();
    let t = c.currentTime;
    for (const [freq, dur] of seq) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'square';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12 * settings.volume, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
      t += dur * 0.9;
    }
  } catch { /* sound is optional */ }
}
