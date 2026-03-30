export type SoundName =
  | 'tick'
  | 'perfect'
  | 'success'
  | 'miss'
  | 'early'
  | 'pixelDrop'
  | 'streakUp'
  | 'buttonClick';

class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume = 1.0;
  private muted = false;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize the AudioContext. Must be called after a user gesture
   * (click/tap) to comply with browser autoplay policies.
   */
  init(): void {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(this.audioContext.destination);
  }

  isReady(): boolean {
    return this.audioContext !== null && this.audioContext.state === 'running';
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume;
    }
  }

  /**
   * Play a named sound effect.
   */
  play(sound: SoundName): void {
    if (!this.audioContext || !this.masterGain) return;

    // Resume context if it was suspended (e.g. after tab switch)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (sound) {
      case 'tick':
        this.playTickSound();
        break;
      case 'perfect':
        this.playPerfectSound();
        break;
      case 'success':
        this.playSuccessSound();
        break;
      case 'miss':
        this.playMissSound();
        break;
      case 'early':
        this.playEarlySound();
        break;
      case 'pixelDrop':
        this.playPixelDropSound();
        break;
      case 'streakUp':
        this.playStreakUpSound();
        break;
      case 'buttonClick':
        this.playButtonClickSound();
        break;
    }
  }

  /**
   * Play the tick/heartbeat sound at a given tempo.
   * @param tempo 0.0 (slowest) to 1.0 (fastest). Affects pitch and duration.
   */
  playTick(tempo: number): void {
    if (!this.audioContext || !this.masterGain) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const t = Math.max(0, Math.min(1, tempo));
    const now = this.audioContext.currentTime;

    // Higher tempo = higher pitch and shorter duration
    const frequency = 800 + t * 600; // 800Hz – 1400Hz
    const duration = 0.05 - t * 0.03; // 50ms – 20ms

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // ──────────────────────────────────────────────
  // Private sound generators
  // ──────────────────────────────────────────────

  /** Short sine wave beep (~50ms) */
  private playTickSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 1000;

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /** Ascending triumphant fanfare: C5 → E5 → G5 with a noise burst */
  private playPerfectSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // Note frequencies: C5=523.25, E5=659.25, G5=783.99
    const notes = [523.25, 659.25, 783.99];
    const noteSpacing = 0.1; // 100ms between notes
    const noteDuration = 0.15;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const start = now + i * noteSpacing;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.35, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(start);
      osc.stop(start + noteDuration);
    });

    // Noise burst at the end for sparkle
    const noiseStart = now + notes.length * noteSpacing;
    this.playNoiseBurst(noiseStart, 0.08, 0.15);
  }

  /** Satisfying cha-ching: two quick tones E4 → G4 */
  private playSuccessSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // E4=329.63, G4=392.00
    const notes = [329.63, 392.0];
    const noteSpacing = 0.08;
    const noteDuration = 0.12;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const start = now + i * noteSpacing;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(start);
      osc.stop(start + noteDuration);
    });
  }

  /** Deep bass boom at 80Hz with decay */
  private playMissSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /** Soft whoosh: filtered noise with quick fade */
  private playEarlySound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const duration = 0.15;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    source.start(now);
    source.stop(now + duration);
  }

  /** Rapid tick-tick-tick like coins dropping */
  private playPixelDropSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    const count = 6;
    const spacing = 0.04; // 40ms between clicks

    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = 1200 + i * 100; // ascending pitch

      const start = now + i * spacing;
      const clickDuration = 0.02;

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + clickDuration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(start);
      osc.stop(start + clickDuration);
    }
  }

  /** Sweeping frequency from 400Hz to 800Hz — power-up tone */
  private playStreakUpSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const duration = 0.25;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + duration);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.setValueAtTime(0.25, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }

  /** Very short noise burst (~20ms) for subtle UI click */
  private playButtonClickSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const duration = 0.02;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    source.start(now);
    source.stop(now + duration);
  }

  // ──────────────────────────────────────────────
  // Utility
  // ──────────────────────────────────────────────

  /** Play a short burst of filtered noise (used as sparkle/texture) */
  private playNoiseBurst(startTime: number, duration: number, volume: number): void {
    const ctx = this.audioContext!;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    source.start(startTime);
    source.stop(startTime + duration);
  }
}

export default SoundManager;
