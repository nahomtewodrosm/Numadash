type ToneType = OscillatorType;

interface ToneOptions {
  frequency: number;
  endFrequency?: number;
  duration?: number;
  type?: ToneType;
  gain?: number;
  delay?: number;
}

class GameAudio {
  private context: AudioContext | null = null;
  private muted = false;

  setMuted(value: boolean): void {
    this.muted = value;
  }

  isMuted(): boolean {
    return this.muted;
  }

  unlock(): void {
    if (typeof window === "undefined") return;
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === "suspended") {
      void this.context.resume();
    }
  }

  jump(): void {
    this.tone({ frequency: 210, endFrequency: 480, duration: 0.13, gain: 0.045 });
  }

  lane(): void {
    this.tone({
      frequency: 170,
      endFrequency: 140,
      duration: 0.07,
      type: "triangle",
      gain: 0.025,
    });
  }

  shard(): void {
    this.tone({ frequency: 820, duration: 0.08, type: "sine", gain: 0.035 });
    this.tone({
      frequency: 1240,
      duration: 0.11,
      type: "sine",
      gain: 0.03,
      delay: 0.055,
    });
  }

  crash(): void {
    this.tone({
      frequency: 150,
      endFrequency: 42,
      duration: 0.4,
      type: "sawtooth",
      gain: 0.07,
    });
    this.tone({
      frequency: 78,
      endFrequency: 30,
      duration: 0.5,
      type: "square",
      gain: 0.035,
    });
  }

  start(): void {
    this.tone({ frequency: 260, duration: 0.08, gain: 0.025 });
    this.tone({
      frequency: 390,
      duration: 0.1,
      gain: 0.03,
      delay: 0.09,
    });
    this.tone({
      frequency: 585,
      duration: 0.16,
      gain: 0.03,
      delay: 0.19,
    });
  }

  private tone({
    frequency,
    endFrequency,
    duration = 0.1,
    type = "square",
    gain = 0.03,
    delay = 0,
  }: ToneOptions): void {
    if (this.muted || typeof window === "undefined") return;
    this.unlock();
    if (!this.context) return;

    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, endFrequency),
        now + duration,
      );
    }

    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(envelope);
    envelope.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }
}

export const gameAudio = new GameAudio();
