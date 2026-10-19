// Web Audio API based mystical ambient chime and sound effects (zero external files)
class MysticAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientInterval: any = null;
  private isAmbientPlaying: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a mystical singing bowl / bell harmonic
  playChime(frequency = 528, duration = 2.4) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      // Gentle frequency drift for crystal bell feeling
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.002, this.ctx.currentTime + duration);

      // Smooth attack and long decay
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, this.ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      // Add soft overtone
      const overtone = this.ctx.createOscillator();
      const overGain = this.ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(frequency * 2.02, this.ctx.currentTime);
      overGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      overGain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 0.05);
      overGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration * 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      overtone.connect(overGain);
      overGain.connect(this.ctx.destination);

      osc.start();
      overtone.start();
      osc.stop(this.ctx.currentTime + duration);
      overtone.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Card draw swoosh / flip sound
  playCardFlip() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Realistic multi-flutter card shuffle audio effect
  playCardShuffle() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // 5 staggered micro flutter taps for riffle shuffle feel
      const flutterOffsets = [0, 0.08, 0.16, 0.25, 0.35, 0.46, 0.58];
      flutterOffsets.forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        const startFreq = 180 + idx * 35 + Math.random() * 40;
        osc.frequency.setValueAtTime(startFreq, now + offset);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.8, now + offset + 0.07);

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.05, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
    } catch {}
  }

  // Toggle ambient celestial singing bowl loop
  toggleAmbient(force?: boolean): boolean {
    const nextState = force !== undefined ? force : !this.isAmbientPlaying;
    if (nextState) {
      this.isAmbientPlaying = true;
      this.initContext();
      // Play initial chord
      this.playChime(432, 4);
      setTimeout(() => this.playChime(528, 4), 600);

      if (this.ambientInterval) clearInterval(this.ambientInterval);
      const frequencies = [432, 528, 639, 741, 852];
      this.ambientInterval = setInterval(() => {
        if (this.isAmbientPlaying && !this.isMuted) {
          const randFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
          this.playChime(randFreq, 5);
        }
      }, 7000);
    } else {
      this.isAmbientPlaying = false;
      if (this.ambientInterval) {
        clearInterval(this.ambientInterval);
        this.ambientInterval = null;
      }
    }
    return this.isAmbientPlaying;
  }

  get isPlaying() {
    return this.isAmbientPlaying;
  }
}

export const mysticAudio = new MysticAudioEngine();
