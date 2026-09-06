import { compile, plat, type LevelBlueprint } from "./compile";
import { TILE, type World } from "./types";

const T = TILE;
const GY = 18 * T;

function npc(x: number, kind: string, name: string, lines: string[], y = GY): LevelBlueprint["npcs"][number] {
  return { x, y, kind, name, lines };
}

function crate(x: number, y: number) {
  return { x, y, w: 40, h: 40, kind: "crate" as const, vx: 0, vy: 0 };
}
function stool(x: number, y: number) {
  return { x, y, w: 44, h: 28, kind: "stool" as const, vx: 0, vy: 0 };
}
function statue(x: number, y: number) {
  return { x, y, w: 36, h: 52, kind: "statue" as const, vx: 0, vy: 0 };
}

const blueprints: LevelBlueprint[] = [
  {
    id: 0,
    name: "Sunny Meadow",
    subtitle: "Hop the low stone walls",
    biome: "meadow",
    clue: "flower",
    widthTiles: 260,
    hintCost: 4,
    story: "Pip packs a satchel and steps into the morning grass. A single flower is said to remember the way.",
    npcs: [
      npc(6 * T, "bunny", "Bramble", [
        "Hello Pip! WASD moves you, and W or Space makes you hop.",
        "Low stone walls are just the right height. Take your time.",
        "Shiny diamonds help if you ever need a hint later.",
      ]),
      npc(70 * T, "bird", "Pipit", [
        "I saw a glowing flower past the third wall, up on a sunny ledge.",
        "If you miss a jump, nothing bad happens. The meadow always catches you.",
      ]),
      npc(150 * T, "lamb", "Wool", [
        "Mom used to walk this path. She loved the pink blossoms.",
        "A little letter is hiding on the tallest hill. She would have liked that.",
      ]),
      npc(220 * T, "bunny", "Nettle", [
        "When you find the flower, a soft portal will open near me.",
        "There is no rush. The castle waits kindly.",
      ]),
    ],
    walls: [
      { x: 28 * T, w: 3 * T, h: 2 * T },
      { x: 48 * T, w: 3.5 * T, h: 2.2 * T },
      { x: 78 * T, w: 4 * T, h: 2.4 * T },
      { x: 110 * T, w: 3 * T, h: 2 * T },
      { x: 140 * T, w: 5 * T, h: 2.6 * T },
      { x: 175 * T, w: 3 * T, h: 2 * T },
    ],
    hills: [
      { x: 90 * T, w: 12 * T, h: 2 * T },
      { x: 188 * T, w: 16 * T, h: 3 * T },
    ],
    extraPlatforms: [
      plat(36 * T, GY - 5 * T, 4 * T, 16, "oneway"),
      plat(60 * T, GY - 6 * T, 5 * T, 16, "oneway"),
      plat(100 * T, GY - 7 * T, 6 * T, 16, "oneway"),
      plat(132 * T, GY - 5.5 * T, 4 * T, 16, "oneway"),
      plat(168 * T, GY - 8 * T, 5 * T, 16, "oneway"),
      plat(198 * T, GY - 6 * T, 7 * T, 16, "wood"),
      plat(230 * T, GY - 4 * T, 4 * T, 16, "oneway"),
    ],
    cluePos: { x: 196 * T, y: GY - 6 * T - 36 },
    portalX: 248 * T,
    letter: { x: 190 * T, y: GY - 3 * T - 30 },
    pickups: [],
    pushables: [],
  },
  {
    id: 1,
    name: "Orchard",
    subtitle: "The wooden fence blocks the lane",
    biome: "orchard",
    clue: "apple",
    widthTiles: 280,
    hintCost: 5,
    story: "Rows of apple trees hum with bees. A tall fence cuts the path, but orchards always have a way around.",
    npcs: [
      npc(8 * T, "squirrel", "Pippin", [
        "The fence is too high to hop. Look up — crates and branches make a staircase.",
        "Push the crate if it is in your way. You are stronger than you look.",
      ]),
      npc(90 * T, "bird", "Pipit", [
        "The reddest apple hangs above the old fence. Climb, then step carefully.",
      ]),
      npc(170 * T, "lamb", "Cider", [
        "I hide letters in hollow trunks. Try the high platform past the second grove.",
      ]),
      npc(250 * T, "squirrel", "Hazel", [
        "Once you hold the apple, the orchard gate of light will open.",
      ]),
    ],
    walls: [{ x: 96 * T, w: 2.2 * T, h: 8 * T }],
    extraPlatforms: [
      plat(40 * T, GY - 4 * T, 5 * T, 16, "wood"),
      plat(58 * T, GY - 6 * T, 4 * T, 16, "wood"),
      plat(74 * T, GY - 8 * T, 5 * T, 16, "wood"),
      plat(88 * T, GY - 10 * T, 6 * T, 16, "wood"),
      plat(104 * T, GY - 10 * T, 7 * T, 16, "wood"),
      plat(118 * T, GY - 8 * T, 5 * T, 16, "oneway"),
      plat(140 * T, GY - 5 * T, 6 * T, 16, "wood"),
      plat(168 * T, GY - 7 * T, 5 * T, 16, "oneway"),
      plat(200 * T, GY - 4 * T, 8 * T, 16, "wood"),
      plat(230 * T, GY - 6.5 * T, 5 * T, 16, "oneway"),
    ],
    cluePos: { x: 108 * T, y: GY - 10 * T - 36 },
    portalX: 268 * T,
    letter: { x: 232 * T, y: GY - 6.5 * T - 28 },
    pickups: [],
    pushables: [crate(32 * T, GY - 40), crate(70 * T, GY - 40)],
  },
  {
    id: 2,
    name: "Rolling Hills",
    subtitle: "Cross the stream on stepping stones",
    biome: "hills",
    clue: "horse",
    widthTiles: 300,
    hintCost: 5,
    story: "A silver stream braids the valley. Stones wait like polite turtles. A gentle horse watches from the far bank.",
    npcs: [
      npc(8 * T, "frog", "Pebble", [
        "The water is friendly. If you slip in, you will float to a bank. No one sinks here.",
        "Some stones bob. Wait for the tall moment, then hop.",
      ]),
      npc(130 * T, "bunny", "Thistle", [
        "The horse likes visitors who take the long way. There are diamonds under the west bluff.",
      ]),
      npc(210 * T, "lamb", "Moss", [
        "I keep a letter in the reed cave, high above the second pool.",
      ]),
    ],
    groundHoles: [
      { x: 48 * T, w: 38 * T },
      { x: 150 * T, w: 28 * T },
    ],
    waters: [
      { x: 48 * T, w: 38 * T },
      { x: 150 * T, w: 28 * T },
    ],
    extraPlatforms: [
      plat(52 * T, GY - 10, 3 * T, 18, "stone", { bob: 1, phase: 0 }),
      plat(60 * T, GY - 24, 3 * T, 18, "stone", { bob: 1.2, phase: 1.2 }),
      plat(68 * T, GY - 8, 3 * T, 18, "stone", { bob: 1, phase: 2.1 }),
      plat(76 * T, GY - 28, 3.2 * T, 18, "stone", { bob: 1.4, phase: 0.4 }),
      plat(154 * T, GY - 12, 3 * T, 18, "stone", { bob: 1, phase: 0.7 }),
      plat(162 * T, GY - 30, 3 * T, 18, "stone", { bob: 1.3, phase: 1.8 }),
      plat(170 * T, GY - 14, 3 * T, 18, "stone", { bob: 1, phase: 2.6 }),
      plat(20 * T, GY - 5 * T, 4 * T, 16, "oneway"),
      plat(110 * T, GY - 6 * T, 6 * T, 16, "oneway"),
      plat(190 * T, GY - 7 * T, 5 * T, 16, "oneway"),
      plat(230 * T, GY - 4 * T, 8 * T, 16, "wood"),
      plat(255 * T, GY - 6 * T, 5 * T, 16, "oneway"),
    ],
    cluePos: { x: 236 * T, y: GY - 4 * T - 40 },
    portalX: 288 * T,
    letter: { x: 192 * T, y: GY - 7 * T - 28 },
    pickups: [],
    pushables: [],
  },
  {
    id: 3,
    name: "Sky Meadow",
    subtitle: "The rain cloud hides the sun",
    biome: "sky",
    clue: "rainbow",
    widthTiles: 320,
    hintCost: 6,
    story: "The path lifts into cotton clouds. A gloomy rain puff sits over the rainbow. Nudge it aside with your hops.",
    npcs: [
      npc(8 * T, "bird", "Gale", [
        "Jump onto the rain cloud to push it. Rainbows are shy until the sun returns.",
        "Floating islands drift. Ride them like slow boats.",
      ]),
      npc(120 * T, "bunny", "Cirrus", [
        "If you fall, the soft cloud-sea sets you back on the last grass. Promise.",
      ]),
      npc(240 * T, "lamb", "Nimbus", [
        "A letter is tucked on the highest drifting island. Look up, always look up.",
      ]),
    ],
    extraPlatforms: [
      plat(24 * T, GY - 4 * T, 6 * T, 16, "cloud"),
      plat(48 * T, GY - 7 * T, 5 * T, 16, "cloud"),
      plat(72 * T, GY - 5 * T, 6 * T, 16, "oneway"),
      plat(100 * T, GY - 8 * T, 7 * T, 16, "cloud"),
      plat(140 * T, GY - 4 * T, 10 * T, 18, "solid"),
      plat(170 * T, GY - 7 * T, 5 * T, 16, "cloud"),
      plat(200 * T, GY - 9 * T, 6 * T, 16, "cloud"),
      plat(230 * T, GY - 5 * T, 8 * T, 16, "oneway"),
      plat(270 * T, GY - 7 * T, 6 * T, 16, "cloud"),
      plat(140 * T, GY - 11 * T, 4 * T, 16, "cloud"),
    ],
    cloud: { x: 148 * T, y: GY - 13 * T, w: 7 * T, h: 50 },
    cluePos: { x: 146 * T, y: GY - 4 * T - 40 },
    portalX: 308 * T,
    letter: { x: 202 * T, y: GY - 9 * T - 28 },
    pickups: [],
    pushables: [],
  },
  {
    id: 4,
    name: "Enchanted Library",
    subtitle: "A stool for the high shelf",
    biome: "library",
    clue: "book",
    widthTiles: 300,
    hintCost: 6,
    story: "Dust motes drift like tiny lanterns. The book you need sits on a shelf Pip cannot reach — unless a stool comes along.",
    npcs: [
      npc(8 * T, "owl", "Quill", [
        "Push the little stool beneath the tall shelf. Books like to be reached politely.",
        "Press S to drop through a shelf you have already climbed.",
      ]),
      npc(90 * T, "cat", "Margot", [
        "I nap on the atlas table. The letter is behind the rolling ladder, very high.",
      ]),
      npc(200 * T, "owl", "Folio", [
        "When the book is yours, a doorway of gold light will open by the reading nook.",
      ]),
    ],
    extraPlatforms: [
      plat(30 * T, GY - 4 * T, 8 * T, 18, "wood"),
      plat(50 * T, GY - 7 * T, 7 * T, 18, "wood"),
      plat(70 * T, GY - 10 * T, 6 * T, 18, "wood"),
      plat(110 * T, GY - 5 * T, 5 * T, 18, "oneway"),
      plat(140 * T, GY - 8 * T, 6 * T, 18, "wood"),
      plat(168 * T, GY - 4 * T, 10 * T, 20, "wood"),
      plat(168 * T, GY - 9 * T, 4 * T, 18, "wood"),
      plat(210 * T, GY - 6 * T, 6 * T, 18, "oneway"),
      plat(240 * T, GY - 8 * T, 5 * T, 18, "wood"),
      plat(270 * T, GY - 4 * T, 6 * T, 18, "wood"),
    ],
    cluePos: { x: 171 * T, y: GY - 9 * T - 36 },
    portalX: 288 * T,
    letter: { x: 72 * T, y: GY - 10 * T - 28 },
    pickups: [],
    pushables: [stool(174 * T, GY - 4 * T - 28)],
  },
  {
    id: 5,
    name: "Windy Village",
    subtitle: "Wait for the gusts to rest",
    biome: "village",
    clue: "hat",
    widthTiles: 330,
    hintCost: 7,
    story: "Kites stitch the sky. The hat you need dances on a line. Walk when the wind is kind, pause when it shouts.",
    npcs: [
      npc(8 * T, "cat", "Bram", [
        "Gusts shove you along. If you do not like the direction, wait. The wind always takes a breath.",
        "The hat is on a high clothesline past the bakery chimneys.",
      ]),
      npc(140 * T, "bird", "Kite", [
        "I ride the gusts. You can too — sometimes they help you reach a far roof.",
      ]),
      npc(250 * T, "lamb", "Linen", [
        "A letter is pinned under the weather vane platform. Climb the west roofs.",
      ]),
    ],
    extraPlatforms: [
      plat(28 * T, GY - 4 * T, 5 * T, 16, "wood"),
      plat(50 * T, GY - 6 * T, 4 * T, 16, "wood"),
      plat(80 * T, GY - 5 * T, 6 * T, 16, "oneway"),
      plat(110 * T, GY - 8 * T, 5 * T, 16, "wood"),
      plat(150 * T, GY - 4 * T, 8 * T, 16, "wood"),
      plat(180 * T, GY - 7 * T, 6 * T, 16, "wood"),
      plat(210 * T, GY - 10 * T, 7 * T, 16, "wood"),
      plat(250 * T, GY - 6 * T, 5 * T, 16, "oneway"),
      plat(280 * T, GY - 8 * T, 6 * T, 16, "wood"),
      plat(305 * T, GY - 4 * T, 6 * T, 16, "wood"),
    ],
    winds: [
      { x: 40 * T, w: 40 * T, force: 280, period: 3.2, duty: 0.45, phase: 0 },
      { x: 120 * T, w: 50 * T, force: -260, period: 3.6, duty: 0.4, phase: 1.1 },
      { x: 200 * T, w: 55 * T, force: 300, period: 2.8, duty: 0.42, phase: 0.4 },
    ],
    cluePos: { x: 214 * T, y: GY - 10 * T - 36 },
    portalX: 318 * T,
    letter: { x: 112 * T, y: GY - 8 * T - 28 },
    pickups: [],
    pushables: [],
  },
  {
    id: 6,
    name: "Cozy Bakery",
    subtitle: "Find the ribbon, then the pantry",
    biome: "bakery",
    clue: "cookie",
    widthTiles: 310,
    hintCost: 7,
    story: "Butter and cinnamon hang in the air. The pantry is tied with a missing ribbon. Hunt the ribbon first, then the cookie.",
    npcs: [
      npc(8 * T, "cat", "Miss Crumb", [
        "The pantry door will not open without its ribbon. I last saw the ribbon on a high flour shelf.",
        "Push sacks if you need a step. Flour is forgiving.",
      ]),
      npc(100 * T, "owl", "Yeast", [
        "A good baker never hurries. Check every loft.",
      ]),
      npc(200 * T, "lamb", "Buttercup", [
        "The letter is in a warm nook above the second oven.",
      ]),
    ],
    extraPlatforms: [
      plat(24 * T, GY - 4 * T, 5 * T, 16, "wood"),
      plat(48 * T, GY - 7 * T, 5 * T, 16, "wood"),
      plat(72 * T, GY - 10 * T, 6 * T, 16, "wood"),
      plat(110 * T, GY - 5 * T, 6 * T, 16, "oneway"),
      plat(145 * T, GY - 8 * T, 5 * T, 16, "wood"),
      plat(180 * T, GY - 4 * T, 8 * T, 18, "wood"),
      plat(220 * T, GY - 6 * T, 5 * T, 16, "oneway"),
      plat(250 * T, GY - 9 * T, 6 * T, 16, "wood"),
      plat(280 * T, GY - 5 * T, 6 * T, 16, "wood"),
    ],
    pantry: { x: 188 * T, y: GY - 110, w: 70, h: 110 },
    pickups: [{ x: 74 * T, y: GY - 10 * T - 28, kind: "ribbon", taken: false }],
    cluePos: { x: 198 * T, y: GY - 50 },
    portalX: 298 * T,
    letter: { x: 252 * T, y: GY - 9 * T - 28 },
    pushables: [crate(40 * T, GY - 40), crate(160 * T, GY - 40)],
  },
  {
    id: 7,
    name: "Nighttime Hill",
    subtitle: "A firefly for the dark cave",
    biome: "night",
    clue: "star",
    widthTiles: 340,
    hintCost: 8,
    story: "The moon is a friendly lantern. A cave waits without one. First find a firefly, then walk the dark as if it were a hallway.",
    npcs: [
      npc(8 * T, "owl", "Lumen", [
        "The cave is only dark, never dangerous. A firefly makes it cozy.",
        "I saw a glow in the grass near the first lantern posts.",
      ]),
      npc(90 * T, "frog", "Dew", [
        "Stars like to hide at the far end of tunnels. Keep walking. The walls are kind.",
      ]),
      npc(280 * T, "lamb", "Twilight", [
        "A letter rests on a moonlit ledge above the cave mouth.",
      ]),
    ],
    extraPlatforms: [
      plat(24 * T, GY - 4 * T, 5 * T, 16, "stone"),
      plat(50 * T, GY - 6 * T, 4 * T, 16, "oneway"),
      plat(80 * T, GY - 5 * T, 6 * T, 16, "stone"),
      plat(130 * T, GY - 4 * T, 8 * T, 16, "stone"),
      plat(200 * T, GY - 6 * T, 5 * T, 16, "oneway"),
      plat(240 * T, GY - 8 * T, 6 * T, 16, "stone"),
      plat(300 * T, GY - 5 * T, 6 * T, 16, "oneway"),
      plat(155 * T, GY - 7 * T, 4 * T, 16, "stone"),
    ],
    caves: { x: 150 * T, w: 90 * T },
    pickups: [{ x: 84 * T, y: GY - 5 * T - 28, kind: "firefly", taken: false }],
    cluePos: { x: 220 * T, y: GY - 40 },
    portalX: 328 * T,
    letter: { x: 156 * T, y: GY - 7 * T - 28 },
    pushables: [],
  },
  {
    id: 8,
    name: "Peaceful Pond",
    subtitle: "The mossy bridge is slippery",
    biome: "pond",
    clue: "duck",
    widthTiles: 340,
    hintCost: 8,
    story: "Willows comb the water. A mossy bridge slides like soap. Walk softly, or ride the slip to the other side.",
    npcs: [
      npc(8 * T, "frog", "Lily", [
        "Moss is slippery. You will keep sliding until you find rough wood again.",
        "The duck is on the island garden. She likes visitors who do not splash too loudly.",
      ]),
      npc(120 * T, "bird", "Reed", [
        "If you slide into the pond, you will bob up. The pond is a friend.",
      ]),
      npc(250 * T, "bunny", "Willow", [
        "A letter is in the reed loft, the highest little dock.",
      ]),
    ],
    groundHoles: [{ x: 70 * T, w: 46 * T }],
    waters: [{ x: 70 * T, w: 46 * T }],
    extraPlatforms: [
      plat(70 * T, GY - 8, 46 * T, 16, "moss"),
      plat(24 * T, GY - 5 * T, 5 * T, 16, "wood"),
      plat(50 * T, GY - 7 * T, 4 * T, 16, "oneway"),
      plat(130 * T, GY - 6 * T, 6 * T, 16, "wood"),
      plat(170 * T, GY - 4 * T, 10 * T, 18, "wood"),
      plat(210 * T, GY - 7 * T, 5 * T, 16, "oneway"),
      plat(240 * T, GY - 9 * T, 5 * T, 16, "wood"),
      plat(280 * T, GY - 5 * T, 6 * T, 16, "wood"),
      plat(310 * T, GY - 7 * T, 5 * T, 16, "oneway"),
    ],
    cluePos: { x: 176 * T, y: GY - 4 * T - 40 },
    portalX: 328 * T,
    letter: { x: 242 * T, y: GY - 9 * T - 28 },
    pickups: [],
    pushables: [],
  },
  {
    id: 9,
    name: "Castle Courtyard",
    subtitle: "The giant gates need two statues",
    biome: "castle",
    clue: "key",
    widthTiles: 360,
    hintCost: 8,
    story: "Cream-stone walls hold their breath. Two garden statues belong on two worn pads. Then the gates will sigh open, and the key will shine.",
    npcs: [
      npc(8 * T, "owl", "Herald", [
        "Push each statue onto a stone pad. They are heavy, but they listen.",
        "The key waits in the inner garden once the gates part.",
      ]),
      npc(80 * T, "lamb", "Banner", [
        "You have been so brave and so gentle. Mom would be proud of every hop.",
      ]),
      npc(200 * T, "cat", "Porter", [
        "A last letter sits on the east battlement. Read it before you go in.",
      ]),
      npc(330 * T, "bunny", "Keep", [
        "When the key is in your satchel, the castle will open its arms.",
      ]),
    ],
    extraPlatforms: [
      plat(24 * T, GY - 4 * T, 6 * T, 18, "stone"),
      plat(50 * T, GY - 7 * T, 5 * T, 18, "stone"),
      plat(90 * T, GY - 5 * T, 6 * T, 16, "oneway"),
      plat(130 * T, GY - 8 * T, 5 * T, 18, "stone"),
      plat(260 * T, GY - 4 * T, 8 * T, 18, "stone"),
      plat(290 * T, GY - 7 * T, 6 * T, 18, "stone"),
      plat(320 * T, GY - 10 * T, 5 * T, 18, "stone"),
      plat(340 * T, GY - 5 * T, 6 * T, 16, "oneway"),
    ],
    gates: { x: 168 * T, w: 28, h: 7 * T },
    pads: [
      { x: 145 * T, y: GY - 10, w: 50 },
      { x: 210 * T, y: GY - 10, w: 50 },
    ],
    pushables: [statue(40 * T, GY - 52), statue(110 * T, GY - 52)],
    cluePos: { x: 188 * T, y: GY - 40 },
    portalX: 348 * T,
    letter: { x: 322 * T, y: GY - 10 * T - 28 },
    pickups: [],
  },
];

// bakery/library clue lock: handled in engine via pantry/stool/cloud/gates
export function buildLevel(index: number): World {
  const bp = blueprints[Math.max(0, Math.min(blueprints.length - 1, index))]!;
  const world = compile(bp);
  if (bp.id === 3) world.clue.locked = true;
  if (bp.id === 4) world.clue.locked = true;
  if (bp.id === 6) world.clue.locked = true;
  if (bp.id === 9) world.clue.locked = true;
  return world;
}

export const LEVEL_COUNT = blueprints.length;

export const LEVEL_META = blueprints.map((b) => ({
  name: b.name,
  subtitle: b.subtitle,
  biome: b.biome,
  story: b.story,
  clue: b.clue,
}));
