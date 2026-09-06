import type { GameAssets } from "./assets";
import { Input } from "./input";
import { AudioBus } from "./audio";
import { buildLevel, LEVEL_COUNT } from "./levels";
import { TILE, type ClueId, type Platform, type World } from "./types";

export type HudSnap = {
  diamonds: number;
  level: number;
  name: string;
  subtitle: string;
  clue: ClueId;
  clueTaken: boolean;
  letters: number;
  hintCost: number;
  canHint: boolean;
  paused: boolean;
};

export type GameHooks = {
  onHud: (h: HudSnap) => void;
  onDialogue: (name: string, lines: string[]) => void;
  onToast: (msg: string) => void;
  onClue: (id: ClueId, level: number) => void;
  onPortal: (level: number) => void;
  onWin: () => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  color: string;
};

type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: number;
  grounded: boolean;
  coyote: number;
  buffer: number;
  drop: number;
  anim: number;
  squash: number;
  lastX: number;
  lastY: number;
  inWater: boolean;
};

const PW = 26;
const PH = 40;
const SPEED = 228;
const ACC = 2700;
const AIR = 1550;
const FRIC = 2400;
const ICEF = 320;
const JUMPV = -910;
const GUP = 1620;
const GDOWN = 2580;
const GAPEX = 880;
const TERM = 1000;
const COYOTE = 0.11;
const BUFFER = 0.13;

function aabb(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  assets: GameAssets;
  hooks: GameHooks;
  input = new Input();
  audio = new AudioBus();
  world!: World;
  player!: Player;
  level = 0;
  diamonds = 0;
  letters = 0;
  clues: ClueId[] = [];
  hasRibbon = false;
  hasFirefly = false;
  camX = 0;
  camY = 0;
  trauma = 0;
  time = 0;
  acc = 0;
  running = false;
  paused = false;
  hintT = 0;
  hintOn = false;
  particles: Particle[] = [];
  pops: { x: number; y: number; t: number; text: string }[] = [];
  nearNpc: string | null = null;
  raf = 0;
  lastTs = 0;
  shakeOn = true;
  reduced = false;
  dpr = 1;
  vw = 960;
  vh = 540;
  private hudAcc = 0;


  constructor(canvas: HTMLCanvasElement, assets: GameAssets, hooks: GameHooks) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    this.ctx = ctx;
    this.assets = assets;
    this.hooks = hooks;
    this.reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }

  mount() {
    this.input.attach();
    this.resize();
    window.addEventListener("resize", this.resize);
    document.addEventListener("visibilitychange", this.onVis);
    this.installProbe();
  }

  unmount() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.input.detach();
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("visibilitychange", this.onVis);
    delete window.__controlsTest;
  }

  private onVis = () => {
    if (!document.hidden) this.audio.resume();
    else this.input.keys.clear();
  };

  resize = () => {
    const parent = this.canvas.parentElement ?? document.body;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.vw = w;
    this.vh = h;
  };

  startLevel(index: number, diamonds: number, clues: ClueId[], letters: number) {
    this.level = index;
    this.diamonds = diamonds;
    this.clues = [...clues];
    this.letters = letters;
    this.world = buildLevel(index);
    this.hasRibbon = false;
    this.hasFirefly = false;
    this.hintOn = false;
    this.hintT = 0;
    this.particles = [];
    this.pops = [];
    this.audio.setBiome(this.world.biome);
    this.player = {
      x: this.world.spawnX,
      y: this.world.spawnY,
      vx: 0,
      vy: 0,
      w: PW,
      h: PH,
      facing: 1,
      grounded: false,
      coyote: 0,
      buffer: 0,
      drop: 0,
      anim: 0,
      squash: 1,
      lastX: this.world.spawnX,
      lastY: this.world.spawnY,
      inWater: false,
    };
    this.camX = this.player.x - this.vw * 0.4;
    this.camY = this.player.y - this.vh * 0.55;
    this.paused = false;
    this.running = true;
    this.lastTs = 0;
    this.emitHud();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
  }

  private installProbe() {
    window.__controlsTest = {
      getYaw: () => (this.player.facing >= 0 ? 0 : Math.PI),
      getSpeed: () => Math.abs(this.player?.vx ?? 0),
      getX: () => this.player?.x ?? 0,
      setKeys: (codes: string[]) => {
        this.input.setKeys(codes);
      },
    };
  }

  private loop = (ts: number) => {
    if (!this.running) return;
    if (!this.lastTs) this.lastTs = ts;
    let dt = (ts - this.lastTs) / 1000;
    this.lastTs = ts;
    if (dt > 0.1) dt = 0.1;
    this.acc += dt;
    const step = 1 / 60;
    let n = 0;
    while (this.acc >= step && n < 5) {
      if (!this.paused) this.fixed(step);
      this.acc -= step;
      n++;
    }
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private fixed(dt: number) {
    this.time += dt;
    this.audio.tick(dt);
    const act = this.input.poll();
    if (act.pause) {
      this.paused = !this.paused;
      this.emitHud();
      return;
    }
    if (this.paused) return;

    const p = this.player;
    const w = this.world;

    if (act.jump) p.buffer = BUFFER;
    p.buffer = Math.max(0, p.buffer - dt);
    p.drop = Math.max(0, p.drop - dt);
    if (act.down && p.grounded) p.drop = 0.22;

    const onIce = this.standingOn(p, "moss") || this.standingOn(p, "ice");
    const acc = p.grounded ? ACC : AIR;
    const fr = onIce ? ICEF : FRIC;

    if (act.moveX !== 0) {
      p.vx += act.moveX * acc * dt;
      p.facing = act.moveX > 0 ? 1 : -1;
    } else if (p.grounded) {
      const s = Math.sign(p.vx);
      p.vx -= s * fr * dt;
      if (Math.sign(p.vx) !== s) p.vx = 0;
    } else {
      p.vx *= 1 - 0.55 * dt;
    }
    const cap = onIce ? SPEED * 1.15 : SPEED;
    if (p.vx > cap) p.vx = cap;
    if (p.vx < -cap) p.vx = -cap;

    for (const z of w.winds) {
      z.phase += dt;
      const t = (z.phase % z.period) / z.period;
      if (t < z.duty && p.x + p.w > z.x && p.x < z.x + z.w) {
        p.vx += z.force * dt;
        if (Math.random() < 0.02) this.audio.sfx("wind");
      }
    }

    const canJump = p.grounded || p.coyote > 0 || p.inWater;
    if (p.buffer > 0 && canJump) {
      p.vy = p.inWater ? JUMPV * 0.55 : JUMPV;
      p.grounded = false;
      p.coyote = 0;
      p.buffer = 0;
      p.squash = 1.22;
      this.audio.sfx("jump");
      this.burst(p.x + p.w / 2, p.y + p.h, 6, "#e7dcc8");
    }
    if (!act.jumpHeld && p.vy < -80) p.vy *= 0.52;

    let g = GDOWN;
    if (p.vy < 0) g = GUP;
    if (p.vy > -70 && p.vy < 90) g = GAPEX;
    if (p.inWater) g = 420;
    p.vy += g * dt;
    if (p.vy > TERM) p.vy = TERM;

    if (p.inWater) {
      p.vy -= 640 * dt;
      if (p.vy > 160) p.vy = 160;
      if (p.vy < -240) p.vy = -240;
    }

    this.moveAxis(p, p.vx * dt, 0);
    const wasGround = p.grounded;
    p.grounded = false;
    this.moveAxis(p, 0, p.vy * dt);

    if (p.grounded) {
      p.coyote = COYOTE;
      p.lastX = p.x;
      p.lastY = p.y;
      if (!wasGround && p.vy >= 0) {
        p.squash = 0.78;
        this.audio.sfx("land");
        this.burst(p.x + p.w / 2, p.y + p.h, 5, "#d8cbb8");
      }
    } else p.coyote = Math.max(0, p.coyote - dt);

    p.squash += (1 - p.squash) * Math.min(1, 12 * dt);
    p.anim += (p.grounded && Math.abs(p.vx) > 20 ? 10 : 3.2) * dt;

    if (p.y > w.height + 40) {
      p.x = p.lastX;
      p.y = p.lastY - 8;
      p.vx = 0;
      p.vy = 0;
      this.hooks.onToast("The path caught you. Try again gently.");
    }
    p.x = Math.max(8, Math.min(w.width - p.w - 8, p.x));

    this.stepMovers(dt);
    this.stepPushables(dt, act.moveX);
    this.stepPuzzles();
    this.collect(act.interact);
    this.stepHint(dt);
    this.stepParticles(dt);

    const look = p.facing * 90;
    const tx = p.x + p.w / 2 - this.vw * 0.5 + look;
    const ty = p.y + p.h / 2 - this.vh * 0.58;
    const k = 1 - Math.exp(-4.2 * dt);
    this.camX += (tx - this.camX) * k;
    this.camY += (ty - this.camY) * k;
    this.camX = Math.max(0, Math.min(w.width - this.vw, this.camX));
    this.camY = Math.max(0, Math.min(Math.max(0, w.height - this.vh), this.camY));
    this.trauma = Math.max(0, this.trauma - dt * 1.8);

    this.hudAcc += dt;
    if (this.hudAcc > 0.12) {
      this.hudAcc = 0;
      this.emitHud();
    }
  }

  private standingOn(p: Player, kind: string) {
    const probe = { x: p.x + 4, y: p.y + p.h, w: p.w - 8, h: 6 };
    return this.world.platforms.some((pl) => pl.kind === kind && aabb(probe, pl));
  }

  private solids(): Platform[] {
    const list = this.world.platforms.filter((p) => p.kind !== "water");
    const g = this.world.gates;
    if (g && g.open < 0.85) {
      list.push({
        x: g.x,
        y: this.world.groundY - g.h,
        w: g.w,
        h: g.h,
        kind: "stone",
        vx: 0,
        range: 0,
        originX: g.x,
        originY: 0,
        phase: 0,
        bob: 0,
        sink: 0,
      });
    }
    const pan = this.world.pantry;
    if (pan && !pan.open) {
      list.push({
        x: pan.x,
        y: pan.y,
        w: pan.w,
        h: pan.h,
        kind: "wood",
        vx: 0,
        range: 0,
        originX: pan.x,
        originY: pan.y,
        phase: 0,
        bob: 0,
        sink: 0,
      });
    }
    return list;
  }

  private moveAxis(p: Player, dx: number, dy: number) {
    p.x += dx;
    p.y += dy;
    p.inWater = false;
    for (const pl of this.world.platforms) {
      if (pl.kind === "water" && aabb(p, pl)) p.inWater = true;
    }
    for (const pl of this.solids()) {
      if (!aabb(p, pl)) continue;
      if (pl.kind === "oneway" || pl.kind === "cloud") {
        if (dx !== 0) continue;
        if (p.drop > 0) continue;
        if (dy < 0) continue;
        if (p.y + p.h - dy > pl.y + 10) continue;
      }
      if (dx > 0) p.x = pl.x - p.w;
      else if (dx < 0) p.x = pl.x + pl.w;
      if (dx !== 0) p.vx = 0;
      if (dy > 0) {
        p.y = pl.y - p.h;
        p.vy = 0;
        p.grounded = true;
        if (pl.range) p.x += Math.cos(pl.phase) * pl.vx * (1 / 60);
      } else if (dy < 0) {
        p.y = pl.y + pl.h;
        p.vy = 0;
      }
    }
  }

  private stepMovers(dt: number) {
    for (const pl of this.world.platforms) {
      if (pl.bob) {
        pl.phase += dt * 1.4;
        pl.y = pl.originY + Math.sin(pl.phase) * 16 * pl.bob;
      }
      if (pl.range) {
        pl.phase += dt;
        pl.x = pl.originX + Math.sin(pl.phase) * pl.range;
      }
    }
    const c = this.world.cloud;
    if (c && aabb(this.player, { x: c.x, y: c.y, w: c.w, h: c.h + 8 })) {
      if (this.player.vy > 0) {
        this.player.vy = JUMPV * 0.35;
        this.player.grounded = true;
      }
      c.x += this.player.facing * 70 * dt;
    }
  }

  private stepPushables(dt: number, moveX: number) {
    const p = this.player;
    for (const b of this.world.pushables) {
      b.vy += 2200 * dt;
      b.y += b.vy * dt;
      let grounded = false;
      for (const pl of this.solids()) {
        if (pl.kind === "oneway" || pl.kind === "cloud") continue;
        if (aabb(b, pl)) {
          b.y = pl.y - b.h;
          b.vy = 0;
          grounded = true;
        }
      }
      if (aabb(p, b) && grounded) {
        if (p.x < b.x) {
          b.x += Math.max(0, moveX) * 90 * dt;
        } else {
          b.x += Math.min(0, moveX) * 90 * dt;
        }
      }
      b.x = Math.max(8, Math.min(this.world.width - b.w - 8, b.x));
    }
  }

  private stepPuzzles() {
    const w = this.world;
    if (this.level === 3 && w.cloud && w.clue.locked) {
      const covered = Math.abs(w.cloud.x + w.cloud.w / 2 - w.clue.x) < 140;
      if (!covered) {
        w.clue.locked = false;
        this.hooks.onToast("The sun found the rainbow.");
      }
    }
    if (this.level === 4 && w.clue.locked) {
      const stool = w.pushables.find((b) => b.kind === "stool");
      if (stool && Math.abs(stool.x + stool.w / 2 - w.clue.x) < 70) {
        w.clue.locked = false;
        this.hooks.onToast("The shelf is within reach.");
      }
    }
    if (this.level === 6 && this.hasRibbon && w.pantry && !w.pantry.open) {
      w.pantry.open = true;
      w.clue.locked = false;
      this.hooks.onToast("The pantry ribbon slips free.");
    }
    if (this.level === 9 && w.gates && w.clue.locked) {
      let n = 0;
      for (const pad of w.pads) {
        pad.filled = w.pushables.some(
          (s) => s.kind === "statue" && s.x + s.w / 2 > pad.x && s.x + s.w / 2 < pad.x + pad.w && Math.abs(s.y + s.h - w.groundY) < 20,
        );
        if (pad.filled) n++;
      }
      if (n >= w.pads.length) {
        w.gates.open = Math.min(1, w.gates.open + 0.02);
        if (w.gates.open > 0.85) {
          w.clue.locked = false;
        }
      }
    }
  }

  private collect(interact: boolean) {
    const p = this.player;
    const box = { x: p.x - 6, y: p.y - 8, w: p.w + 12, h: p.h + 12 };
    for (const d of this.world.diamonds) {
      if (d.taken) continue;
      if (Math.hypot(d.x - (p.x + p.w / 2), d.y - (p.y + p.h / 2)) < 30) {
        d.taken = true;
        this.diamonds += 1;
        this.audio.sfx("gem");
        this.burst(d.x, d.y, 10, "#6aaec8");
        this.pops.push({ x: d.x, y: d.y, t: 0, text: "+1" });
        this.trauma = Math.min(1, this.trauma + 0.08);
      }
    }
    const c = this.world.clue;
    if (!c.taken && !c.locked && Math.hypot(c.x - (p.x + p.w / 2), c.y - (p.y + 12)) < 38) {
      c.taken = true;
      this.world.portalOpen = true;
      if (!this.clues.includes(c.id)) this.clues.push(c.id);
      this.audio.sfx("clue");
      this.burst(c.x, c.y, 22, "#c45c6a");
      this.trauma = Math.min(1, this.trauma + 0.28);
      this.hooks.onClue(c.id, this.level);
    }
    for (const pk of this.world.pickups) {
      if (pk.taken) continue;
      if (Math.hypot(pk.x - (p.x + p.w / 2), pk.y - (p.y + 10)) < 34) {
        pk.taken = true;
        if (pk.kind === "ribbon") {
          this.hasRibbon = true;
          this.hooks.onToast("A bakery ribbon, warm from the oven.");
        }
        if (pk.kind === "firefly") {
          this.hasFirefly = true;
          this.hooks.onToast("The firefly settles in your satchel and glows.");
        }
        if (pk.kind === "letter") {
          this.letters += 1;
          this.hooks.onToast("A letter in a familiar hand.");
          this.audio.sfx("letter");
        } else this.audio.sfx("gem");
        this.burst(pk.x, pk.y, 12, "#f4eee3");
      }
    }
    this.nearNpc = null;
    for (const n of this.world.npcs) {
      if (Math.abs(n.x - (p.x + p.w / 2)) < 50 && Math.abs(n.y - (p.y + p.h)) < 80) {
        this.nearNpc = n.name;
        if (interact) {
          this.audio.sfx("talk");
          this.hooks.onDialogue(n.name, n.lines);
        }
      }
    }
    if (this.world.portalOpen && Math.abs(p.x - this.world.portalX) < 46 && Math.abs(p.y + p.h - this.world.groundY) < 80) {
      if (interact || Math.abs(p.x - this.world.portalX) < 20) {
        this.audio.sfx("portal");
        if (this.level >= LEVEL_COUNT - 1) this.hooks.onWin();
        else this.hooks.onPortal(this.level);
      }
    }
  }

  useHint() {
    const cost = this.world.hintCost;
    if (this.world.clue.taken) {
      this.hooks.onToast("You already carry this clue.");
      return;
    }
    if (this.diamonds < cost) {
      this.hooks.onToast(`Hints cost ${cost} diamonds.`);
      return;
    }
    this.diamonds -= cost;
    this.hintOn = true;
    this.hintT = 14;
    this.audio.sfx("hint");
    this.hooks.onToast("A trail of light leads the way.");
    this.emitHud();
  }

  private stepHint(dt: number) {
    if (this.hintOn) {
      this.hintT -= dt;
      if (this.hintT <= 0) this.hintOn = false;
    }
  }

  private burst(x: number, y: number, n: number, color: string) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 40 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 30,
        life: 0.45 + Math.random() * 0.3,
        max: 0.7,
        r: 2 + Math.random() * 3,
        color,
      });
    }
  }

  private stepParticles(dt: number) {
    for (const q of this.particles) {
      q.life -= dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += 180 * dt;
    }
    this.particles = this.particles.filter((q) => q.life > 0);
    for (const pop of this.pops) pop.t += dt;
    this.pops = this.pops.filter((q) => q.t < 0.7);
  }

  private emitHud() {
    this.hooks.onHud({
      diamonds: this.diamonds,
      level: this.level,
      name: this.world.name,
      subtitle: this.world.subtitle,
      clue: this.world.clue.id,
      clueTaken: this.world.clue.taken,
      letters: this.letters,
      hintCost: this.world.hintCost,
      canHint: this.diamonds >= this.world.hintCost && !this.world.clue.taken,
      paused: this.paused,
    });
  }

  private draw() {
    const ctx = this.ctx;
    const { vw, vh, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    let sx = 0;
    let sy = 0;
    if (this.shakeOn && !this.reduced && this.trauma > 0) {
      const mag = this.trauma * this.trauma * 7;
      sx = (Math.random() * 2 - 1) * mag;
      sy = (Math.random() * 2 - 1) * mag;
    }
    const camX = this.camX + sx;
    const camY = this.camY + sy;
    const w = this.world;

    this.drawSky(ctx, vw, vh);
    const bg = this.assets.maps[w.biome];
    if (bg) {
      const par = camX * 0.22;
      const bw = Math.max(vw, (bg.width / bg.height) * vh * 1.05);
      const bh = vh * 1.05;
      ctx.drawImage(bg, - (par % bw), vh - bh + 10 - camY * 0.04, bw, bh);
      ctx.drawImage(bg, - (par % bw) + bw - 1, vh - bh + 10 - camY * 0.04, bw, bh);
    }

    ctx.save();
    ctx.translate(-camX, -camY);
    this.drawDecor(ctx);
    this.drawPlatforms(ctx);
    this.drawCloud(ctx);
    this.drawGates(ctx);
    this.drawPantry(ctx);
    this.drawPads(ctx);
    this.drawPushables(ctx);
    this.drawPickups(ctx);
    this.drawNpcs(ctx);
    this.drawPortal(ctx);
    this.drawHint(ctx);
    this.drawPlayer(ctx);
    this.drawParticles(ctx);
    ctx.restore();

    this.drawCaveDark(ctx, camX, camY);
    this.drawWind(ctx, camX);
  }

  private drawSky(ctx: CanvasRenderingContext2D, vw: number, vh: number) {
    const g = ctx.createLinearGradient(0, 0, 0, vh);
    const pal: Record<string, [string, string]> = {
      meadow: ["#9fd4ee", "#d9f0c7"],
      orchard: ["#f2d7a6", "#c5dd9a"],
      hills: ["#8ec8e6", "#cfe8b8"],
      sky: ["#b9d8f5", "#f3e9ff"],
      library: ["#3d2c24", "#c9a078"],
      village: ["#87c5e6", "#f0e0c0"],
      bakery: ["#e8c8a0", "#f6e6cc"],
      night: ["#1a2038", "#3a4568"],
      pond: ["#c5e4e2", "#d7e8c8"],
      castle: ["#a8d2ea", "#efe4c8"],
    };
    const [a, b] = pal[this.world.biome] ?? pal.meadow;
    g.addColorStop(0, a!);
    g.addColorStop(1, b!);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);
  }

  private drawDecor(ctx: CanvasRenderingContext2D) {
    for (const d of this.world.decorations) {
      const x = d.x;
      const y = d.y;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(d.s, d.s);
      ctx.strokeStyle = "#3a2a28";
      ctx.lineWidth = 1.6;
      if (d.kind === "tuft" || d.kind === "flower") {
        ctx.fillStyle = "#4c8a62";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-8, -16, -4, -22);
        ctx.quadraticCurveTo(0, -10, 0, 0);
        ctx.quadraticCurveTo(8, -18, 5, -24);
        ctx.quadraticCurveTo(2, -10, 0, 0);
        ctx.fill();
        ctx.stroke();
        if (d.kind === "flower") {
          ctx.fillStyle = "#c45c6a";
          ctx.beginPath();
          ctx.arc(0, -26, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (d.kind === "reed") {
        ctx.strokeStyle = "#3b6e4e";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(6, -20, 2, -36);
        ctx.stroke();
      } else if (d.kind === "rock") {
        ctx.fillStyle = "#b7a89a";
        roundRect(ctx, -10, -12, 22, 12, 4);
        ctx.fill();
        ctx.stroke();
      } else if (d.kind === "tree") {
        ctx.fillStyle = "#6b4a32";
        ctx.fillRect(-4, -28, 8, 28);
        ctx.fillStyle = "#4c8a62";
        ctx.beginPath();
        ctx.arc(0, -36, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (d.kind === "lamp") {
        ctx.fillStyle = "#5c4a43";
        ctx.fillRect(-2, -26, 4, 26);
        ctx.fillStyle = "#f4eee3";
        ctx.beginPath();
        ctx.arc(0, -30, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.kind === "banner") {
        ctx.fillStyle = "#c45c6a";
        ctx.fillRect(-2, -40, 4, 40);
        ctx.fillRect(2, -38, 16, 12);
      } else if (d.kind === "crate" || d.kind === "sack" || d.kind === "bookstack" || d.kind === "post") {
        ctx.fillStyle = d.kind === "bookstack" ? "#c45c6a" : "#c4a574";
        roundRect(ctx, -10, -16, 20, 16, 3);
        ctx.fill();
        ctx.stroke();
      } else if (d.kind === "cloud") {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.arc(0, -10, 12, 0, Math.PI * 2);
        ctx.arc(12, -8, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private platColor(kind: string): [string, string] {
    switch (kind) {
      case "wood":
        return ["#c9a36a", "#8a6238"];
      case "stone":
        return ["#c5b8a8", "#7d7166"];
      case "cloud":
        return ["#f7f4ee", "#d5d0c6"];
      case "moss":
        return ["#7da86a", "#4c8a62"];
      case "ice":
        return ["#d5eef2", "#7eafb8"];
      case "oneway":
        return ["#d7c39a", "#9a7a4a"];
      default:
        return ["#6faf72", "#3f7a48"];
    }
  }

  private drawPlatforms(ctx: CanvasRenderingContext2D) {
    for (const pl of this.world.platforms) {
      if (pl.kind === "water") {
        ctx.fillStyle = "rgba(90, 170, 190, 0.45)";
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = pl.x; x < pl.x + pl.w; x += 16) {
          const y = pl.y + Math.sin(this.time * 2 + x * 0.05) * 3;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        continue;
      }
      const [top, side] = this.platColor(pl.kind);
      ctx.fillStyle = side;
      roundRect(ctx, pl.x, pl.y, pl.w, pl.h, 8);
      ctx.fill();
      ctx.fillStyle = top;
      roundRect(ctx, pl.x, pl.y, pl.w, Math.min(16, pl.h * 0.45), 8);
      ctx.fill();
      ctx.strokeStyle = "#3a2a28";
      ctx.lineWidth = 1.8;
      roundRect(ctx, pl.x, pl.y, pl.w, pl.h, 8);
      ctx.stroke();
    }
  }

  private drawCloud(ctx: CanvasRenderingContext2D) {
    const c = this.world.cloud;
    if (!c) return;
    ctx.fillStyle = "rgba(120,140,160,0.85)";
    roundRect(ctx, c.x, c.y, c.w, c.h, 20);
    ctx.fill();
    ctx.strokeStyle = "#3a2a28";
    ctx.stroke();
    ctx.fillStyle = "rgba(180,210,230,0.5)";
    for (let i = 0; i < 6; i++) {
      const x = c.x + 20 + i * 18;
      ctx.fillRect(x, c.y + c.h, 3, 10 + (i % 3) * 6);
    }
  }

  private drawGates(ctx: CanvasRenderingContext2D) {
    const g = this.world.gates;
    if (!g) return;
    const h = g.h * (1 - g.open * 0.85);
    ctx.fillStyle = "#c5b8a8";
    ctx.fillRect(g.x, this.world.groundY - h, g.w, h);
    ctx.strokeStyle = "#3a2a28";
    ctx.strokeRect(g.x, this.world.groundY - h, g.w, h);
  }

  private drawPantry(ctx: CanvasRenderingContext2D) {
    const p = this.world.pantry;
    if (!p) return;
    ctx.fillStyle = p.open ? "#d8cbb8" : "#8a6238";
    roundRect(ctx, p.x, p.y, p.w, p.h, 6);
    ctx.fill();
    ctx.strokeStyle = "#3a2a28";
    ctx.stroke();
    if (!p.open) {
      ctx.fillStyle = "#c45c6a";
      ctx.beginPath();
      ctx.arc(p.x + p.w - 16, p.y + p.h / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPads(ctx: CanvasRenderingContext2D) {
    for (const pad of this.world.pads) {
      ctx.fillStyle = pad.filled ? "#4c8a62" : "#c5b8a8";
      roundRect(ctx, pad.x, pad.y, pad.w, 12, 4);
      ctx.fill();
      ctx.strokeStyle = "#3a2a28";
      ctx.stroke();
    }
  }

  private drawPushables(ctx: CanvasRenderingContext2D) {
    for (const b of this.world.pushables) {
      ctx.fillStyle = b.kind === "statue" ? "#c5b8a8" : "#c9a36a";
      roundRect(ctx, b.x, b.y, b.w, b.h, 6);
      ctx.fill();
      ctx.strokeStyle = "#3a2a28";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      if (b.kind === "statue") {
        ctx.fillStyle = "#8a7368";
        ctx.beginPath();
        ctx.arc(b.x + b.w / 2, b.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawPickups(ctx: CanvasRenderingContext2D) {
    const bob = (t: number) => Math.sin(this.time * 3 + t) * 5;
    for (const d of this.world.diamonds) {
      if (d.taken) continue;
      const img = this.assets.items.diamond;
      const y = d.y + bob(d.bob);
      ctx.drawImage(img, d.x - 16, y - 16, 32, 32);
    }
    const c = this.world.clue;
    if (!c.taken) {
      const img = this.assets.items[c.id];
      const glow = 0.45 + Math.sin(this.time * 3) * 0.2;
      ctx.save();
      ctx.globalAlpha = c.locked ? 0.4 : 1;
      ctx.shadowColor = `rgba(196,92,106,${glow})`;
      ctx.shadowBlur = 18;
      ctx.drawImage(img, c.x - 22, c.y + bob(1) - 22, 44, 44);
      ctx.restore();
    }
    for (const pk of this.world.pickups) {
      if (pk.taken) continue;
      if (pk.kind === "firefly") {
        ctx.drawImage(this.assets.items.firefly, pk.x - 16, pk.y + bob(2) - 16, 32, 32);
      } else if (pk.kind === "ribbon") {
        ctx.fillStyle = "#c45c6a";
        roundRect(ctx, pk.x - 12, pk.y + bob(2) - 8, 24, 14, 6);
        ctx.fill();
        ctx.strokeStyle = "#3a2a28";
        ctx.stroke();
      } else {
        ctx.fillStyle = "#fffaf2";
        ctx.strokeStyle = "#3a2a28";
        roundRect(ctx, pk.x - 12, pk.y + bob(2) - 10, 24, 18, 3);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  private drawNpcs(ctx: CanvasRenderingContext2D) {
    for (const n of this.world.npcs) {
      const bounce = Math.sin(this.time * 2 + n.x) * 2;
      ctx.save();
      ctx.translate(n.x, n.y - 28 + bounce);
      this.stampNpc(ctx, n.kind);
      ctx.restore();
      if (this.nearNpc === n.name) {
        ctx.fillStyle = "#fffaf2";
        roundRect(ctx, n.x - 18, n.y - 70, 36, 18, 8);
        ctx.fill();
        ctx.strokeStyle = "#3a2a28";
        ctx.stroke();
        ctx.fillStyle = "#2f241f";
        ctx.font = "700 11px Nunito, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Talk", n.x, n.y - 57);
      }
    }
  }

  private stampNpc(ctx: CanvasRenderingContext2D, kind: string) {
    ctx.lineWidth = 1.7;
    ctx.strokeStyle = "#2f241f";
    const body = kind === "frog" ? "#4c8a62" : kind === "cat" ? "#d08a4a" : kind === "owl" ? "#c4a574" : kind === "bird" ? "#6aaec8" : kind === "lamb" ? "#f4eee3" : "#f7f0e6";
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 8, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -6, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (kind === "bunny" || kind === "lamb") {
      ctx.beginPath();
      ctx.ellipse(-6, -18, 3, 9, -0.2, 0, Math.PI * 2);
      ctx.ellipse(6, -18, 3, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "#2f241f";
    ctx.beginPath();
    ctx.arc(-3.5, -7, 1.5, 0, Math.PI * 2);
    ctx.arc(3.5, -7, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c45c6a";
    ctx.beginPath();
    ctx.arc(0, -3, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPortal(ctx: CanvasRenderingContext2D) {
    if (!this.world.portalOpen) return;
    const x = this.world.portalX;
    const y = this.world.groundY;
    const h = 92;
    const g = ctx.createLinearGradient(x, y - h, x, y);
    g.addColorStop(0, "rgba(196,92,106,0.0)");
    g.addColorStop(0.4, "rgba(196,92,106,0.55)");
    g.addColorStop(1, "rgba(244,238,227,0.85)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y - 8, 22 + Math.sin(this.time * 2) * 3, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c45c6a";
    ctx.stroke();
  }

  private drawHint(ctx: CanvasRenderingContext2D) {
    if (!this.hintOn || this.world.clue.taken) return;
    const p = this.player;
    const tx = this.world.clue.x;
    const ty = this.world.clue.y;
    ctx.strokeStyle = "rgba(196,92,106,0.65)";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 10]);
    ctx.lineDashOffset = -this.time * 40;
    ctx.beginPath();
    ctx.moveTo(p.x + p.w / 2, p.y);
    ctx.quadraticCurveTo((p.x + tx) / 2, Math.min(p.y, ty) - 80, tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const frames = this.assets.player;
    const moving = Math.abs(p.vx) > 18 && p.grounded;
    const fi = moving ? Math.floor(p.anim) % frames.length : Math.floor(this.time * 2) % frames.length;
    const img = frames[fi] ?? frames[0]!;
    const h = 58 * (2 - p.squash);
    const w = 58 * p.squash;
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h);
    ctx.scale(p.facing, 1);
    ctx.drawImage(img, -w / 2, -h + 4, w, h);
    ctx.restore();
    if (this.hasFirefly) {
      ctx.fillStyle = "rgba(250,230,120,0.8)";
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2 + 16 * p.facing, p.y + 8 + Math.sin(this.time * 6) * 4, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    for (const q of this.particles) {
      ctx.globalAlpha = Math.max(0, q.life / q.max);
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.font = "700 14px Nunito, sans-serif";
    ctx.textAlign = "center";
    for (const pop of this.pops) {
      ctx.globalAlpha = 1 - pop.t / 0.7;
      ctx.fillStyle = "#2f241f";
      ctx.fillText(pop.text, pop.x, pop.y - pop.t * 40);
    }
    ctx.globalAlpha = 1;
  }

  private drawCaveDark(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const cave = this.world.cave;
    if (!cave) return;
    const p = this.player;
    const inCave = p.x > cave.x && p.x < cave.x + cave.w;
    if (!inCave && p.x < cave.x - 80) return;
    const radius = this.hasFirefly ? 220 : 70;
    const sx = p.x + p.w / 2 - camX;
    const sy = p.y + p.h / 2 - camY;
    ctx.save();
    ctx.fillStyle = this.hasFirefly ? "rgba(8,10,20,0.35)" : "rgba(8,10,20,0.82)";
    ctx.fillRect(0, 0, this.vw, this.vh);
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(sx, sy, 20, sx, sy, radius);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.vw, this.vh);
    ctx.restore();
  }

  private drawWind(ctx: CanvasRenderingContext2D, camX: number) {
    for (const z of this.world.winds) {
      const t = (z.phase % z.period) / z.period;
      if (t > z.duty) continue;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const x = z.x - camX + ((this.time * 80 * Math.sign(z.force) + i * 40) % z.w);
        const y = 80 + i * 40;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 28 * Math.sign(z.force), y + 4);
        ctx.stroke();
      }
    }
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getX: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}
