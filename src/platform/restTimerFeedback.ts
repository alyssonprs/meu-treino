const countdownFrequencies: Record<number, number> = {
  1: 880,
  2: 740,
  3: 620,
};

let audioContext: AudioContext | null = null;

type WindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function prepareRestTimerFeedback() {
  const context = getAudioContext();

  if (context?.state === "suspended") {
    void context.resume();
  }
}

export function playRestCountdownFeedback(remainingSeconds: number) {
  const frequency = countdownFrequencies[remainingSeconds];

  if (!frequency) {
    return;
  }

  playTone({ frequency, durationMs: 150, volume: 0.14 });
  vibrate([35]);
}

export function playRestFinishedFeedback() {
  // Use a longer, three-note signal so it remains noticeable in a noisy gym.
  // Keep the gain below 1 to avoid clipping on phone speakers.
  playTone({ frequency: 784, durationMs: 260, volume: 0.24 });
  globalThis.setTimeout(() => {
    playTone({ frequency: 988, durationMs: 260, volume: 0.24 });
  }, 280);
  globalThis.setTimeout(() => {
    playTone({ frequency: 1319, durationMs: 520, volume: 0.28 });
  }, 560);
  vibrate([180, 80, 180, 80, 320]);
}

function playTone({
  durationMs,
  frequency,
  volume,
}: {
  durationMs: number;
  frequency: number;
  volume: number;
}) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startTime = context.currentTime;
  const endTime = startTime + durationMs / 1000;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
  oscillator.start(startTime);
  oscillator.stop(endTime);
}

function getAudioContext() {
  if (audioContext) {
    return audioContext;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const audioWindow = window as WindowWithWebkitAudio;
  const AudioContextConstructor =
    audioWindow.AudioContext ?? audioWindow.webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  audioContext = new AudioContextConstructor();
  return audioContext;
}

function vibrate(pattern: VibratePattern) {
  if (typeof navigator === "undefined" || !navigator.vibrate) {
    return;
  }

  navigator.vibrate(pattern);
}
