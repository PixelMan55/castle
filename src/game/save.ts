import { CLUE_ORDER, type ClueId, type SaveData } from "./types";

const KEY = "castle-quest-save";
const VERSION = 1;

const defaults = (): SaveData => ({
  version: VERSION,
  diamonds: 0,
  maxLevel: 0,
  currentLevel: 0,
  clues: [],
  letters: [],
  settings: { music: 0.55, sfx: 0.85, shake: true },
});

function migrate(raw: SaveData): SaveData {
  const d = defaults();
  return {
    ...d,
    ...raw,
    version: VERSION,
    clues: (raw.clues ?? []).filter((c): c is ClueId => CLUE_ORDER.includes(c)),
    letters: raw.letters ?? [],
    settings: { ...d.settings, ...(raw.settings ?? {}) },
  };
}

export function loadSave(): SaveData {
  try {
    if (typeof localStorage === "undefined") return defaults();
    const txt = localStorage.getItem(KEY);
    if (!txt) return defaults();
    return migrate(JSON.parse(txt) as SaveData);
  } catch {
    return defaults();
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, version: VERSION }));
  } catch {
    /* private mode */
  }
}

export function resetSave(): SaveData {
  const d = defaults();
  writeSave(d);
  return d;
}
