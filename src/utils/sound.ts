let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx) sharedAudioCtx = new Ctx();
  return sharedAudioCtx;
}

/**
 * Plays a gentle, low-gain harmonic completion tone only when sound is enabled.
 * Uses pure Web Audio synthesis with soft fade-in/out envelope.
 */
export function playSubtleChime(kind: 'complete' | 'focus_end', enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const notes = kind === 'focus_end' ? [523.25, 659.25, 783.99] : [587.33, 880.0];

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.045, now + idx * 0.08 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.42);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.45);
  });
}
