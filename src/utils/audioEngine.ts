/**
 * Web Audio API Engine for Choir Rehearsal and Pitch Pipe Tones.
 * Provides pure choral pitch pipe tones and harmonic progression playback.
 */

// Note frequencies in Hz (A4 = 440Hz standard concert pitch)
export const NOTE_FREQUENCIES: Record<string, number> = {
  'C4': 261.63,
  'C#4 / Db4': 277.18,
  'D4': 293.66,
  'Eb4 / D#4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4 / Gb4': 369.99,
  'G4': 392.00,
  'Ab4 / G#4': 415.30,
  'A4': 440.00,
  'Bb4 / A#4': 466.16,
  'B4': 493.88,
  'C5': 523.25,
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

interface ActiveTone {
  stop: () => void;
}

let currentTone: ActiveTone | null = null;

/**
 * Sounds a warm pitch pipe tone (mimicking physical choir pitch pipes with organ harmonics).
 */
export function playPitchPipeTone(frequency: number, durationSeconds: number = 3.5): () => void {
  const ctx = getAudioContext();

  // Stop any currently sounding tone
  if (currentTone) {
    currentTone.stop();
    currentTone = null;
  }

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.25, now + 0.12);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);
  masterGain.connect(ctx.destination);

  // Fundamental + warm ecclesiastical harmonics (1st, 2nd, 3rd, 4th partials)
  const partials = [
    { mult: 1.0, gain: 0.6, type: 'sine' as OscillatorType },
    { mult: 2.0, gain: 0.25, type: 'sine' as OscillatorType },
    { mult: 3.0, gain: 0.1, type: 'triangle' as OscillatorType },
    { mult: 4.0, gain: 0.05, type: 'sine' as OscillatorType },
  ];

  const oscillators: OscillatorNode[] = [];

  partials.forEach((p) => {
    const osc = ctx.createOscillator();
    osc.type = p.type;
    osc.frequency.setValueAtTime(frequency * p.mult, now);

    const partialGain = ctx.createGain();
    partialGain.gain.setValueAtTime(p.gain, now);

    osc.connect(partialGain);
    partialGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + durationSeconds);
    oscillators.push(osc);
  });

  const stopFn = () => {
    const stopTime = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(stopTime);
    masterGain.gain.linearRampToValueAtTime(0.0001, stopTime + 0.08);
    setTimeout(() => {
      oscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          // Ignored if already stopped
        }
      });
    }, 100);
  };

  currentTone = { stop: stopFn };
  return stopFn;
}

export function stopCurrentTone(): void {
  if (currentTone) {
    currentTone.stop();
    currentTone = null;
  }
}

/**
 * Key signature root frequencies for synthetic hymn rehearsal tracks.
 */
export const KEY_ROOTS: Record<string, number> = {
  'C Major': 261.63,
  'C Minor': 261.63,
  'D Major': 293.66,
  'D Minor': 293.66,
  'Eb Major': 311.13,
  'F Major': 349.23,
  'G Major': 392.00,
  'A Major': 440.00,
  'A Minor': 440.00,
  'Bb Major': 466.16,
  'Db Major': 277.18,
};

/**
 * Synthesizes a warm choral organ chord progression (I - IV - V - I) in a given key.
 * Used when no uploaded rehearsal audio is attached to a song.
 */
export class SyntheticRehearsalPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private rootFreq: number = 261.63;
  private bpm: number = 84;
  private onTickCallback?: (currentTime: number) => void;
  private onEndCallback?: () => void;
  private elapsedSeconds: number = 0;
  private durationSeconds: number = 180;
  private gainNode: GainNode | null = null;
  private speed: number = 1.0;

  constructor(keySignature: string = 'G Major', bpm: number = 84, duration: number = 180) {
    this.rootFreq = KEY_ROOTS[keySignature] || 261.63;
    this.bpm = bpm || 84;
    this.durationSeconds = duration || 180;
  }

  setCallbacks(onTick: (currentTime: number) => void, onEnd: () => void) {
    this.onTickCallback = onTick;
    this.onEndCallback = onEnd;
  }

  setPlaybackRate(speed: number) {
    this.speed = speed;
  }

  start() {
    this.ctx = getAudioContext();
    this.isPlaying = true;

    this.playChordCycle();

    const tickMs = 250;
    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.elapsedSeconds += (tickMs / 1000) * this.speed;
      if (this.onTickCallback) {
        this.onTickCallback(this.elapsedSeconds);
      }
      if (this.elapsedSeconds >= this.durationSeconds) {
        this.stop();
        if (this.onEndCallback) this.onEndCallback();
      }
    }, tickMs);
  }

  private playChordCycle() {
    if (!this.ctx || !this.isPlaying) return;

    // Progression: I (Tonic), IV (Subdominant), V (Dominant), I (Cadence)
    const chords = [
      [1.0, 1.25, 1.5, 2.0], // Tonic Major
      [1.333, 1.666, 2.0, 2.666], // Subdominant
      [1.5, 1.875, 2.25, 3.0], // Dominant
      [1.0, 1.25, 1.5, 2.0], // Tonic Cadence
    ];

    const chordDuration = (60 / this.bpm) * 3; // 3 beats per chord
    const now = this.ctx.currentTime;

    chords.forEach((chordPitches, chordIdx) => {
      const chordStart = now + (chordIdx * chordDuration) / this.speed;
      const duration = chordDuration / this.speed;

      chordPitches.forEach((ratio) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(this.rootFreq * (ratio / 2), chordStart);

        gain.gain.setValueAtTime(0, chordStart);
        gain.gain.linearRampToValueAtTime(0.08, chordStart + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + duration);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(chordStart);
        osc.stop(chordStart + duration);
      });
    });

    // Schedule next cycle
    const cycleDurationMs = (chords.length * chordDuration * 1000) / this.speed;
    setTimeout(() => {
      if (this.isPlaying) {
        this.playChordCycle();
      }
    }, cycleDurationMs - 150);
  }

  seek(seconds: number) {
    this.elapsedSeconds = Math.max(0, Math.min(seconds, this.durationSeconds));
    if (this.onTickCallback) {
      this.onTickCallback(this.elapsedSeconds);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.stop();
    this.elapsedSeconds = 0;
  }
}
