import {
  TILE,
  type Biome,
  type ClueId,
  type Npc,
  type Pickup,
  type Platform,
  type PlatKind,
  type Pushable,
  type WindZone,
  type World,
} from "./types";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function plat(
  x: number,
  y: number,
  w: number,
  h: number,
  kind: PlatKind = "solid",
  extra: Partial<Platform> = {},
): Platform {
  return {
    x,
    y,
    w,
    h,
    kind,
    vx: 0,
    range: 0,
    originX: x,
    originY: y,
    phase: 0,
    bob: 0,
    sink: 0,
    ...extra,
  };
}

export interface LevelBlueprint {
  id: number;
  name: string;
  subtitle: string;
  biome: Biome;
  clue: ClueId;
  widthTiles: number;
  hintCost: number;
  story: string;
  npcs: Npc[];
  extraPlatforms: Platform[];
  waters?: { x: number; w: number }[];
  caves?: { x: number; w: number };
  winds?: WindZone[];
  cloud?: { x: number; y: number; w: number; h: number };
  gates?: { x: number; w: number; h: number };
  pantry?: { x: number; y: number; w: number; h: number };
  pads?: { x: number; y: number; w: number }[];
  pickups: Pickup[];
  pushables: Pushable[];
  cluePos: { x: number; y: number };
  portalX: number;
  letter: { x: number; y: number };
  groundHoles?: { x: number; w: number }[];
  hills?: { x: number; w: number; h: number }[];
  walls?: { x: number; w: number; h: number }[];
}

const GROUND_Y = 18 * TILE;
const HEIGHT = 24 * TILE;

export function compile(bp: LevelBlueprint): World {
  const rng = mulberry32(bp.id * 9973 + 17);
  const width = bp.widthTiles * TILE;
  const platforms: Platform[] = [];

  const holes = bp.groundHoles ?? [];
  let cursor = 0;
  const groundSegs: { x: number; w: number }[] = [];
  for (const hole of [...holes].sort((a, b) => a.x - b.x)) {
    if (hole.x > cursor) groundSegs.push({ x: cursor, w: hole.x - cursor });
    cursor = hole.x + hole.w;
  }
  if (cursor < width) groundSegs.push({ x: cursor, w: width - cursor });
  for (const g of groundSegs) {
    platforms.push(plat(g.x, GROUND_Y, g.w, HEIGHT - GROUND_Y + 200, groundKind(bp.biome)));
  }

  for (const h of bp.hills ?? []) {
    platforms.push(plat(h.x, GROUND_Y - h.h, h.w, h.h, "stone"));
  }
  for (const w of bp.walls ?? []) {
    platforms.push(plat(w.x, GROUND_Y - w.h, w.w, w.h, "stone"));
  }
  for (const water of bp.waters ?? []) {
    platforms.push(plat(water.x, GROUND_Y + 18, water.w, 90, "water"));
    platforms.push(plat(water.x, GROUND_Y + 86, water.w, 160, "solid"));
  }

  platforms.push(...bp.extraPlatforms);

  const clusterCount = Math.floor(bp.widthTiles / 22);
  for (let i = 2; i < clusterCount - 1; i++) {
    const cx = i * 22 * TILE + rng() * 8 * TILE;
    if (bp.waters?.some((w) => cx > w.x - 80 && cx < w.x + w.w + 80)) continue;
    const layers = 2 + Math.floor(rng() * 3);
    for (let L = 0; L < layers; L++) {
      const pw = (3 + Math.floor(rng() * 5)) * TILE;
      const px = cx + (rng() - 0.5) * 10 * TILE;
      const py = GROUND_Y - (3 + L * 3) * TILE - Math.floor(rng() * 2) * TILE;
      platforms.push(plat(px, py, pw, 18, rng() > 0.35 ? "oneway" : "wood"));
    }
  }

  if (bp.id >= 3) {
    const movers = 3 + bp.id;
    for (let i = 0; i < movers; i++) {
      const x = 40 * TILE + rng() * (width - 80 * TILE);
      const y = GROUND_Y - (5 + Math.floor(rng() * 8)) * TILE;
      const range = (3 + rng() * 5) * TILE;
      platforms.push(
        plat(x, y, 3.5 * TILE, 16, bp.biome === "sky" ? "cloud" : "oneway", {
          vx: 40 + rng() * 30,
          range,
          originX: x,
          phase: rng() * Math.PI * 2,
        }),
      );
    }
  }

  const diamonds: World["diamonds"] = [];
  for (let i = 0; i < 10; i++) {
    diamonds.push({
      x: 7 * TILE + i * 2.2 * TILE,
      y: GROUND_Y - 32,
      taken: false,
      bob: i,
    });
  }
  const want = 52 + bp.id * 8;
  const tops = platforms.filter((p) => p.kind !== "water" && p.w >= TILE && p.y < GROUND_Y + 4);
  for (let i = 0; i < want; i++) {
    const p = tops[Math.floor(rng() * tops.length)];
    if (!p) continue;
    const x = p.x + 24 + rng() * Math.max(8, p.w - 48);
    const y = p.y - 28 - rng() * 18;
    if (x < 80 || x > width - 80) continue;
    diamonds.push({ x, y, taken: false, bob: rng() * Math.PI * 2 });
  }

  const decorations: World["decorations"] = [];
  const decoKinds = decoFor(bp.biome);
  for (let x = 40; x < width; x += 70 + rng() * 90) {
    decorations.push({
      x,
      y: GROUND_Y,
      kind: decoKinds[Math.floor(rng() * decoKinds.length)] ?? "tuft",
      s: 0.8 + rng() * 0.5,
    });
  }

  return {
    width,
    height: HEIGHT,
    groundY: GROUND_Y,
    spawnX: 3 * TILE,
    spawnY: GROUND_Y - 80,
    platforms,
    diamonds,
    clue: { id: bp.clue, x: bp.cluePos.x, y: bp.cluePos.y, taken: false, locked: false },
    npcs: bp.npcs,
    pickups: [...bp.pickups, { x: bp.letter.x, y: bp.letter.y, kind: "letter", taken: false }],
    pushables: bp.pushables,
    portalX: bp.portalX,
    portalY: GROUND_Y - 96,
    portalOpen: false,
    winds: bp.winds ?? [],
    cloud: bp.cloud ?? null,
    cave: bp.caves ?? null,
    gates: bp.gates ? { ...bp.gates, open: 0 } : null,
    pantry: bp.pantry ? { ...bp.pantry, open: false } : null,
    pads: (bp.pads ?? []).map((p) => ({ ...p, filled: false })),
    decorations,
    biome: bp.biome,
    name: bp.name,
    subtitle: bp.subtitle,
    hintCost: bp.hintCost,
  };
}

function groundKind(b: Biome): PlatKind {
  if (b === "library" || b === "bakery") return "wood";
  if (b === "castle") return "stone";
  if (b === "pond") return "moss";
  if (b === "night") return "stone";
  return "solid";
}

function decoFor(b: Biome): string[] {
  switch (b) {
    case "meadow":
      return ["tuft", "flower", "rock"];
    case "orchard":
      return ["tree", "tuft", "crate"];
    case "hills":
      return ["tuft", "rock", "reed"];
    case "sky":
      return ["tuft", "cloud"];
    case "library":
      return ["bookstack", "lamp"];
    case "village":
      return ["post", "tuft", "crate"];
    case "bakery":
      return ["sack", "crate", "lamp"];
    case "night":
      return ["rock", "lamp", "tuft"];
    case "pond":
      return ["reed", "rock", "tuft"];
    case "castle":
      return ["banner", "rock", "lamp"];
  }
}
