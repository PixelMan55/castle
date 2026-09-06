import type { Biome } from "./types";

const SCALES: Record<Biome, number[]> = {
  meadow: [0, 2, 4, 7, 9, 12, 14, 16],
  orchard: [0, 3, 5, 7, 10, 12, 15, 17],
  hills: [0, 2, 5, 7, 9, 12, 14, 17],
  sky: [0, 2, 4, 6, 9, 11, 14, 16],
  library: [0, 2, 3, 7, 8, 12, 14, 15],
  village: [0, 2, 4, 5, 9, 11, 12, 16],
  bakery: [0, 3, 5, 7, 10, 12, 14, 17],
  night: [0, 3, 5, 7, 10, 12, 15, 19],
  pond: [0, 2, 4, 7, 9, 11, 14, 16],
  castle: [0, 2, 4, 7, 9, 12, 16, 19],
};

const PATTERNS: Record<Biome, number[]> = {
  meadow: [0, 2, 4, 2, 5, 4, 2, 0, 3, 4, 6, 4, 2, 1, 0, 2],
  orchard: [0, 1, 3, 4, 3, 1, 0, 2, 4, 5, 4, 3, 1, 2, 0, 1],
  hills: [0, 4, 2, 5, 4, 2, 6, 4, 0, 2, 4, 7, 5, 4, 2, 0],
  sky: [4, 6, 7, 6, 4, 2, 4, 5, 7, 6, 4, 2, 0, 2, 4, 6],
  library: [0, 2, 3, 5, 3, 2, 0, 4, 5, 3, 2, 5, 3, 2, 1, 0],
  village: [0, 2, 4, 5, 4, 2, 3, 0, 4, 5, 7, 5, 4, 2, 0, 2],
  bakery: [2, 4, 5, 4, 2, 0, 2, 4, 5, 7, 5, 4, 1, 2, 4, 2],
  night: [0, 3, 4, 3, 6, 4, 3, 0, 2, 4, 6, 4, 3, 1, 0, 3],
  pond: [4, 2, 0, 2, 5, 4, 2, 4, 6, 4, 2, 0, 2, 3, 4, 2],
  castle: [0, 4, 7, 4, 6, 4, 2, 0, 4, 5, 7, 6, 4, 2, 0, 4],
};

export class AudioBus {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  musicGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  musicVol = 0.55;
  sfxVol = 0.85;
  muted = false;
  private step = 0;
  private acc = 0;
  private biome: Biome = "meadow";
  private playing = false;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyVol();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.playing = true;
  }

  setMusic(v: number) {
    this.musicVol = v;
    this.applyVol();
  }
  setSfx(v: number) {
    this.sfxVol = v;
    this.applyVol();
  }
  setMuted(m: boolean) {
    this.muted = m;
    this.applyVol();
  }

  private applyVol() {
    const t = this.ctx?.currentTime ?? 0;
    const m = this.muted ? 0 : 1;
    this.master?.gain.setTargetAtTime(m, t, 0.04);
    this.musicGain?.gain.setTargetAtTime(this.musicVol * this.musicVol, t, 0.04);
    this.sfxGain?.gain.setTargetAtTime(this.sfxVol * this.sfxVol, t, 0.04);
  }

  setBiome(b: Biome) {
    this.biome = b;
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  tick(dt: number) {
    if (!this.playing || !this.ctx || !this.musicGain) return;
    this.acc += dt;
    const beat = 0.42;
    if (this.acc < beat) return;
    this.acc -= beat;
    const pat = PATTERNS[this.biome];
    const sc = SCALES[this.biome];
    const idx = pat[this.step % pat.length] ?? 0;
    this.step++;
    const note = sc[idx] ?? 0;
    const bass = this.step % 4 === 1;
    this.pluck(261.63 * Math.pow(2, note / 12), 0.07, 0.55, true);
    if (bass) this.pluck(130.81 * Math.pow(2, (sc[0] ?? 0) / 12), 0.05, 0.9, true);
  }

  private pluck(freq: number, gain: number, dur: number, music: boolean) {
    const ctx = this.ctx;
    const bus = music ? this.musicGain : this.sfxGain;
    if (!ctx || !bus) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    osc.type = music ? "triangle" : "sine";
    osc.frequency.value = freq;
    f.type = "lowpass";
    f.frequency.value = music ? 1800 : 2400;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(f);
    f.connect(g);
    g.connect(bus);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.05);
    osc.onended = () => {
      osc.disconnect();
      f.disconnect();
      g.disconnect();
    };
  }

  sfx(kind: "jump" | "land" | "gem" | "clue" | "hint" | "talk" | "portal" | "push" | "wind" | "letter") {
    const jitter = 1 + (Math.random() * 2 - 1) * 0.08;
    switch (kind) {
      case "jump":
        this.pluck(520 * jitter, 0.08, 0.12, false);
        break;
      case "land":
        this.pluck(180 * jitter, 0.07, 0.1, false);
        break;
      case "gem":
        this.pluck(880 * jitter, 0.09, 0.18, false);
        this.pluck(1320 * jitter, 0.05, 0.22, false);
        break;
      case "clue":
        this.pluck(523, 0.1, 0.3, false);
        this.pluck(659, 0.09, 0.35, false);
        this.pluck(784, 0.08, 0.45, false);
        break;
      case "hint":
        this.pluck(700, 0.07, 0.2, false);
        this.pluck(940, 0.05, 0.28, false);
        break;
      case "talk":
        this.pluck(340 * jitter, 0.05, 0.08, false);
        break;
      case "portal":
        this.pluck(392, 0.08, 0.4, false);
        this.pluck(523, 0.07, 0.5, false);
        this.pluck(659, 0.06, 0.6, false);
        break;
      case "push":
        this.pluck(140 * jitter, 0.06, 0.08, false);
        break;
      case "wind":
        this.pluck(220 * jitter, 0.03, 0.3, false);
        break;
      case "letter":
        this.pluck(620, 0.08, 0.25, false);
        this.pluck(780, 0.06, 0.32, false);
        break;
    }
  }
}
