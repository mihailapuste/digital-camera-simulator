export function triggerShutterHaptic(): void {}

/** A short mechanical click. Browsers have no camera shutter. */
export function playShutterClick(): void {
  const Ctx =
    window.AudioContext ||
    (window as Window & {webkitAudioContext?: typeof AudioContext})
      .webkitAudioContext;
  if (!Ctx) {
    return;
  }
  const context = new Ctx();
  const oscillator = context.createOscillator();
  const noise = context.createBufferSource();
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.05), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) {
    const envelope = Math.exp(-index / (samples.length * 0.18));
    samples[index] = (Math.random() * 2 - 1) * envelope;
  }
  noise.buffer = buffer;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.35, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.06);
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(1400, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(180, context.currentTime + 0.05);
  const toneGain = context.createGain();
  toneGain.gain.setValueAtTime(0.08, context.currentTime);
  toneGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);
  oscillator.connect(toneGain);
  toneGain.connect(context.destination);
  noise.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  noise.start();
  oscillator.stop(context.currentTime + 0.06);
  noise.stop(context.currentTime + 0.06);
  window.setTimeout(() => {
    context.close().catch(() => undefined);
  }, 200);
}
