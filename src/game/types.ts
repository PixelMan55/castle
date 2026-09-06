export const TILE = 48;
export const FIXED_DT = 1 / 60;

export type ClueId =
  | "flower"
  | "apple"
  | "horse"
  | "rainbow"
  | "book"
  | "hat"
  | "cookie"
  | "star"
  | "duck"
  | "key";

export type Biome =
  | "meadow"
  | "orchard"
  | "hills"
  | "sky"
  | "library"
  | "village"
  | "bakery"
  | "night"
  | "pond"
  | "castle";

export type PlatKind = "solid" | "oneway" | "ice" | "water" | "wood" | "stone" | "cloud" | "moss";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Platform extends Rect {
  kind: PlatKind;
  vx: number;
  range: number;
  originX: number;
  originY: number;
  phase: number;
  bob: number;
  sink: number;
}

export interface Diamond {
  x: number;
  y: number;
  taken: boolean;
  bob: number;
}

export interface ClueItem {
  id: ClueId;
  x: number;
  y: number;
  taken: boolean;
  locked: boolean;
}

export interface Npc {
  x: number;
  y: number;
  kind: string;
  name: string;
  lines: string[];
}

export interface Pickup {
  x: number;
  y: number;
  kind: "ribbon" | "firefly" | "letter";
  taken: boolean;
}

export interface Pushable extends Rect {
  kind: "crate" | "stool" | "statue";
  vx: number;
  vy: number;
}

export interface WindZone {
  x: number;
  w: number;
  force: number;
  period: number;
  duty: number;
  phase: number;
}

export interface World {
  width: number;
  height: number;
  groundY: number;
  spawnX: number;
  spawnY: number;
  platforms: Platform[];
  diamonds: Diamond[];
  clue: ClueItem;
  npcs: Npc[];
  pickups: Pickup[];
  pushables: Pushable[];
  portalX: number;
  portalY: number;
  portalOpen: boolean;
  winds: WindZone[];
  cloud: { x: number; y: number; w: number; h: number } | null;
  cave: { x: number; w: number } | null;
  gates: { x: number; w: number; h: number; open: number } | null;
  pantry: { x: number; y: number; w: number; h: number; open: boolean } | null;
  pads: { x: number; y: number; w: number; filled: boolean }[];
  decorations: { x: number; y: number; kind: string; s: number }[];
  biome: Biome;
  name: string;
  subtitle: string;
  hintCost: number;
}

export interface SaveData {
  version: number;
  diamonds: number;
  maxLevel: number;
  currentLevel: number;
  clues: ClueId[];
  letters: number[];
  settings: {
    music: number;
    sfx: number;
    shake: boolean;
  };
}

export const CLUE_ORDER: ClueId[] = [
  "flower",
  "apple",
  "horse",
  "rainbow",
  "book",
  "hat",
  "cookie",
  "star",
  "duck",
  "key",
];

export const CLUE_LABEL: Record<ClueId, string> = {
  flower: "Meadow Flower",
  apple: "Orchard Apple",
  horse: "Hill Horse",
  rainbow: "Sky Rainbow",
  book: "Library Book",
  hat: "Village Hat",
  cookie: "Bakery Cookie",
  star: "Night Star",
  duck: "Pond Duck",
  key: "Castle Key",
};

export const BIOME_FOR_LEVEL: Biome[] = [
  "meadow",
  "orchard",
  "hills",
  "sky",
  "library",
  "village",
  "bakery",
  "night",
  "pond",
  "castle",
];
