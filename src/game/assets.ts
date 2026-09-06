import type { Biome, ClueId } from "./types";

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export interface GameAssets {
  player: HTMLImageElement[];
  items: Record<ClueId | "diamond" | "firefly", HTMLImageElement>;
  maps: Record<Biome, HTMLImageElement>;
}

export async function loadAssets(): Promise<GameAssets> {
  const player = await Promise.all([
    loadImg("/sprites/player/idle-1.png"),
    loadImg("/sprites/player/idle-2.png"),
    loadImg("/sprites/player/idle-3.png"),
    loadImg("/sprites/player/idle-4.png"),
  ]);
  const itemIds = [
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
    "diamond",
    "firefly",
  ] as const;
  const itemImgs = await Promise.all(itemIds.map((id) => loadImg(`/sprites/items/${id}.png`)));
  const items = {} as GameAssets["items"];
  itemIds.forEach((id, i) => {
    items[id] = itemImgs[i]!;
  });
  const biomes: Biome[] = [
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
  const mapImgs = await Promise.all(biomes.map((b) => loadImg(`/maps/${b}-far.jpg`)));
  const maps = {} as GameAssets["maps"];
  biomes.forEach((b, i) => {
    maps[b] = mapImgs[i]!;
  });
  return { player, items, maps };
}
