let context;

export function playDiscovery(complete) {
  if (!window.AudioContext) return;
  context ??= new AudioContext();
  context.resume().catch(() => {});
  const start = context.currentTime + .02;
  const notes = complete ? [523.25, 659.25, 783.99, 1046.50] : [659.25, 880];
  notes.forEach((frequency, index) => {
    const time = start + index * .083;
    const voice = context.createOscillator();
    const envelope = context.createGain();
    voice.type = 'sine';
    voice.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(.095, time + .014);
    envelope.gain.exponentialRampToValueAtTime(.001, time + .28);
    voice.connect(envelope).connect(context.destination);
    voice.start(time);
    voice.stop(time + .29);
  });
}
