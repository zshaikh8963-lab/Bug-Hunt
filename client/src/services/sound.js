// Web Audio API Synthesizer for BUG HUNT
// Zero external assets needed; 100% offline & instantaneous

class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('bughunt_muted') === 'true';
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('bughunt_muted', this.muted);
    return this.muted;
  }

  playTone(freq, type, duration, startTime = 0, gainLevel = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    } catch (e) {
      // Audio not permitted yet
    }
  }

  // Correct answer: bright cyber chime (C5 -> E5 -> G5)
  playCorrect() {
    if (this.muted) return;
    this.init();
    this.playTone(523.25, 'sine', 0.15, 0, 0.15);     // C5
    this.playTone(659.25, 'sine', 0.15, 0.08, 0.15);  // E5
    this.playTone(783.99, 'sine', 0.25, 0.16, 0.18);  // G5
  }

  // Wrong answer: low buzz glitch
  playWrong() {
    if (this.muted) return;
    this.init();
    this.playTone(150, 'sawtooth', 0.25, 0, 0.18);
    this.playTone(130, 'square', 0.25, 0.04, 0.15);
  }

  // Timer tick for <10s urgent warning
  playTimerTick() {
    if (this.muted) return;
    this.init();
    this.playTone(880, 'sine', 0.05, 0, 0.08);
  }

  // Combo streak fanfares (escalating pitches)
  playCombo(level = 1) {
    if (this.muted) return;
    this.init();
    const base = 440 + level * 70;
    this.playTone(base, 'triangle', 0.12, 0, 0.15);
    this.playTone(base * 1.25, 'triangle', 0.12, 0.06, 0.18);
    this.playTone(base * 1.5, 'sine', 0.2, 0.12, 0.2);
  }

  // Boss alert: deep ominous siren pulses
  playBossAlert() {
    if (this.muted) return;
    this.init();
    this.playTone(90, 'sawtooth', 0.4, 0, 0.25);
    this.playTone(70, 'sawtooth', 0.5, 0.3, 0.3);
    this.playTone(110, 'sawtooth', 0.4, 0.7, 0.25);
  }

  // Round completed: victory chord sweep
  playRoundComplete() {
    if (this.muted) return;
    this.init();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      this.playTone(freq, 'sine', 0.4, i * 0.1, 0.18);
    });
  }

  // Victory fanfare (alias for round complete)
  playVictory() {
    this.playRoundComplete();
  }

  // Soft interface click
  playClick() {
    if (this.muted) return;
    this.init();
    this.playTone(1200, 'sine', 0.03, 0, 0.05);
  }
}

const rawSoundService = new SoundController();

// Safe proxy wrapper to guarantee sound calls never crash the UI
export const soundService = new Proxy(rawSoundService, {
  get(target, prop) {
    if (prop in target) {
      const val = target[prop];
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    }
    return () => {};
  }
});
