export type SoundName =
  | 'tick'
  | 'perfect'
  | 'success'
  | 'miss'
  | 'early'
  | 'pixelDrop'
  | 'streakUp'
  | 'buttonClick'
  | 'countdown'
  | 'nearMiss';

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
      case 'countdown':
        this.playCountdownSound(0.5);
        break;
      case 'nearMiss':
        this.playNearMissSound();
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
    const frequency = 800 + t * 600; // 800Hz - 1400Hz
    const duration = 0.05 - t * 0.03; // 50ms - 20ms

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

  /**
   * Play countdown beeps with escalating urgency.
   * @param urgency 0.0 (calm) to 1.0 (frantic). Affects pitch and speed.
   */
  playCountdown(urgency: number): void {
    if (!this.audioContext || !this.masterGain) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.playCountdownSound(Math.max(0, Math.min(1, urgency)));
  }

  // ──────────────────────────────────────────────
  // Private sound generators
  // ──────────────────────────────────────────────

  /** Short sine wave beep with harmonic overtone for richer tone (~50ms) */
  private playTickSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const duration = 0.05;

    // Fundamental
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 1000;
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc1.connect(gain1);
    gain1.connect(this.masterGain!);
    osc1.start(now);
    osc1.stop(now + duration);

    // Second harmonic overtone (octave up, quieter)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 2000;
    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(now);
    osc2.stop(now + duration);
  }

  /**
   * JACKPOT! Dramatic slot-machine win sound.
   * Sub-bass thump -> sharp attack -> ascending arpeggio C5 E5 G5 C6
   * -> high-frequency shimmer burst. ~0.6s total.
   */
  private playPerfectSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // --- Sub-bass thump at the very start (60Hz, 80ms) ---
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.value = 60;
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain!);
    subOsc.start(now);
    subOsc.stop(now + 0.08);

    // --- Sharp attack burst (white noise, 30ms) ---
    this.playFilteredNoiseBurst(now, 0.03, 0.2, 'bandpass', 3000, 1.0);

    // --- Ascending arpeggio: C5, E5, G5, C6 ---
    // C5=523.25, E5=659.25, G5=783.99, C6=1046.50
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const noteSpacing = 0.1;
    const noteDuration = 0.18;

    notes.forEach((freq, i) => {
      const startTime = now + 0.03 + i * noteSpacing;
      // Each note slightly louder: 0.25, 0.30, 0.35, 0.40
      const noteVolume = 0.25 + i * 0.05;

      // Main tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(noteVolume, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + noteDuration);

      // Harmonic overtone for richness (octave up, 30% volume)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2;
      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(noteVolume * 0.3, startTime + 0.008);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
      osc2.connect(gain2);
      gain2.connect(this.masterGain!);
      osc2.start(startTime);
      osc2.stop(startTime + noteDuration);
    });

    // --- Shimmer: bandpass-filtered noise burst at 8000Hz at the peak ---
    const shimmerStart = now + 0.03 + notes.length * noteSpacing - 0.05;
    this.playFilteredNoiseBurst(shimmerStart, 0.15, 0.18, 'bandpass', 8000, 2.0);
  }

  /**
   * Richer cha-ching: triangle wave chime (E4 -> G4) + metallic shimmer.
   * ~0.2s total.
   */
  private playSuccessSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // E4=329.63, G4=392.00
    const notes = [329.63, 392.0];
    const noteSpacing = 0.08;
    const noteDuration = 0.12;

    notes.forEach((freq, i) => {
      const startTime = now + i * noteSpacing;

      // Triangle wave for bell-like tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + noteDuration);

      // Harmonic overtone for shimmer
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 2;
      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(0.12, startTime + 0.008);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
      osc2.connect(gain2);
      gain2.connect(this.masterGain!);
      osc2.start(startTime);
      osc2.stop(startTime + noteDuration);
    });

    // Subtle metallic shimmer (short noise burst, highpass 6000Hz)
    this.playFilteredNoiseBurst(now + 0.04, 0.05, 0.1, 'highpass', 6000, 1.0);
  }

  /**
   * Dramatic explosion: sharp noise crack -> deep bass sweep -> square wave rumble.
   * ~0.5s total.
   */
  private playMissSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // --- Sharp noise crack (50ms) ---
    this.playFilteredNoiseBurst(now, 0.05, 0.45, 'highpass', 800, 0.5);

    // --- Deep bass sweep 120Hz -> 30Hz over 0.5s ---
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(120, now);
    bassOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    bassGain.gain.setValueAtTime(0.5, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    bassOsc.connect(bassGain);
    bassGain.connect(this.masterGain!);
    bassOsc.start(now);
    bassOsc.stop(now + 0.5);

    // --- Square wave rumble at 50Hz for distortion-like effect ---
    const rumbleOsc = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumbleOsc.type = 'square';
    rumbleOsc.frequency.value = 50;
    rumbleGain.gain.setValueAtTime(0.15, now + 0.03);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(this.masterGain!);
    rumbleOsc.start(now + 0.03);
    rumbleOsc.stop(now + 0.45);
  }

  /**
   * Soft, non-punishing whoosh: descending sine sweep 600Hz -> 200Hz over 0.15s.
   */
  private playEarlySound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const duration = 0.15;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + duration);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Casino coin cascade: 8 rapid ascending clicks with triangle wave
   * and reverb-like detuned tails. 35ms spacing.
   */
  private playPixelDropSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    const count = 8;
    const spacing = 0.035;

    for (let i = 0; i < count; i++) {
      const startTime = now + i * spacing;
      const clickDuration = 0.03;
      const freq = 1200 + i * 120; // ascending pitch

      // Main click (triangle wave for metallic coin sound)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + clickDuration);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + clickDuration);

      // Reverb-like tail (slightly detuned, quieter, longer decay)
      const tailOsc = ctx.createOscillator();
      const tailGain = ctx.createGain();
      tailOsc.type = 'triangle';
      tailOsc.frequency.value = freq * 1.01; // slightly detuned for chorus effect
      tailGain.gain.setValueAtTime(0.08, startTime);
      tailGain.gain.exponentialRampToValueAtTime(0.001, startTime + clickDuration * 2.5);
      tailOsc.connect(tailGain);
      tailGain.connect(this.masterGain!);
      tailOsc.start(startTime);
      tailOsc.stop(startTime + clickDuration * 2.5);
    }
  }

  /**
   * Power-up sweep with harmonics and shimmer at the peak.
   * Main: 400Hz -> 1000Hz, Harmonic: 800Hz -> 2000Hz at 30%. ~0.3s.
   */
  private playStreakUpSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const duration = 0.3;

    // Main sweep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.exponentialRampToValueAtTime(1000, now + duration);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.setValueAtTime(0.25, now + duration * 0.7);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc1.connect(gain1);
    gain1.connect(this.masterGain!);
    osc1.start(now);
    osc1.stop(now + duration);

    // Parallel harmonic sweep (octave up, 30% volume)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.exponentialRampToValueAtTime(2000, now + duration);
    gain2.gain.setValueAtTime(0.075, now);
    gain2.gain.setValueAtTime(0.075, now + duration * 0.7);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(now);
    osc2.stop(now + duration);

    // Noise shimmer at the peak
    this.playFilteredNoiseBurst(now + duration * 0.75, 0.08, 0.1, 'highpass', 6000, 1.0);
  }

  /**
   * Crisp button click with a subtle "thock":
   * Short sine at 200Hz (10ms) + noise burst.
   */
  private playButtonClickSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // Thock: short low sine
    const thockOsc = ctx.createOscillator();
    const thockGain = ctx.createGain();
    thockOsc.type = 'sine';
    thockOsc.frequency.value = 200;
    thockGain.gain.setValueAtTime(0.15, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
    thockOsc.connect(thockGain);
    thockGain.connect(this.masterGain!);
    thockOsc.start(now);
    thockOsc.stop(now + 0.01);

    // Noise burst for the click texture
    const noiseDuration = 0.02;
    const bufferSize = Math.ceil(ctx.sampleRate * noiseDuration);
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
    gain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    source.start(now);
    source.stop(now + noiseDuration);
  }

  /**
   * Countdown double-beep with urgency control.
   * Two 1200Hz+ pips, 30ms each, 50ms apart. Higher urgency = higher pitch and louder.
   */
  private playCountdownSound(urgency: number): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    const baseFreq = 1200 + urgency * 600; // 1200Hz - 1800Hz
    const pipDuration = 0.03;
    const pipGap = 0.05 - urgency * 0.02; // 50ms - 30ms gap (faster at high urgency)
    const vol = 0.2 + urgency * 0.15; // 0.2 - 0.35

    for (let i = 0; i < 2; i++) {
      const startTime = now + i * (pipDuration + pipGap);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = baseFreq;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + pipDuration);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + pipDuration);
    }
  }

  /**
   * Near-miss "wah-wah" disappointment sound: descending slide from
   * success chime frequency, gentle and not punishing. ~0.3s.
   */
  private playNearMissSound(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const duration = 0.3;

    // Start at a success-like chime frequency and slide down
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(392, now); // G4 (success end note)
    osc1.frequency.exponentialRampToValueAtTime(220, now + duration); // slide down to A3

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gain1.gain.setValueAtTime(0.25, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain1);
    gain1.connect(this.masterGain!);
    osc1.start(now);
    osc1.stop(now + duration);

    // Subtle second voice slightly detuned for "wah" character
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(395, now); // slightly detuned
    osc2.frequency.exponentialRampToValueAtTime(222, now + duration);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.01);
    gain2.gain.setValueAtTime(0.12, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(now);
    osc2.stop(now + duration);
  }

  // ──────────────────────────────────────────────
  // Utility
  // ──────────────────────────────────────────────

  /**
   * Play a short burst of filtered noise (used as sparkle/texture/shimmer).
   * Supports bandpass, highpass, and lowpass filter types.
   */
  private playFilteredNoiseBurst(
    startTime: number,
    duration: number,
    volume: number,
    filterType: BiquadFilterType,
    filterFreq: number,
    filterQ: number
  ): void {
    const ctx = this.audioContext!;

    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;

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
