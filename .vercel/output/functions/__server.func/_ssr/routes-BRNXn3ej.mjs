import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Pause, c as BookOpen, i as Sparkles, n as Volume2, o as Map, s as Gem, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BRNXn3ej.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function loadImg(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error(`Failed to load ${src}`));
		img.src = src;
	});
}
async function loadAssets() {
	const player = await Promise.all([
		loadImg("/sprites/player/idle-1.png"),
		loadImg("/sprites/player/idle-2.png"),
		loadImg("/sprites/player/idle-3.png"),
		loadImg("/sprites/player/idle-4.png")
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
		"firefly"
	];
	const itemImgs = await Promise.all(itemIds.map((id) => loadImg(`/sprites/items/${id}.png`)));
	const items = {};
	itemIds.forEach((id, i) => {
		items[id] = itemImgs[i];
	});
	const biomes = [
		"meadow",
		"orchard",
		"hills",
		"sky",
		"library",
		"village",
		"bakery",
		"night",
		"pond",
		"castle"
	];
	const mapImgs = await Promise.all(biomes.map((b) => loadImg(`/maps/${b}-far.jpg`)));
	const maps = {};
	biomes.forEach((b, i) => {
		maps[b] = mapImgs[i];
	});
	return {
		player,
		items,
		maps
	};
}
var GAME_CODES = /* @__PURE__ */ new Set([
	"KeyW",
	"KeyA",
	"KeyS",
	"KeyD",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"Space",
	"KeyE",
	"KeyF",
	"Escape",
	"KeyP",
	"KeyH"
]);
var Input = class {
	keys = /* @__PURE__ */ new Set();
	injected = null;
	prevJump = false;
	prevInteract = false;
	prevPause = false;
	touchLeft = false;
	touchRight = false;
	touchJump = false;
	touchInteract = false;
	unsubs = [];
	attach() {
		const onDown = (e) => {
			if (GAME_CODES.has(e.code)) e.preventDefault();
			this.keys.add(e.code);
		};
		const onUp = (e) => {
			this.keys.delete(e.code);
		};
		const clear = () => this.keys.clear();
		window.addEventListener("keydown", onDown);
		window.addEventListener("keyup", onUp);
		window.addEventListener("blur", clear);
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) clear();
		});
		this.unsubs.push(() => {
			window.removeEventListener("keydown", onDown);
			window.removeEventListener("keyup", onUp);
			window.removeEventListener("blur", clear);
		});
	}
	detach() {
		for (const u of this.unsubs) u();
		this.unsubs = [];
	}
	setKeys(codes) {
		this.injected = new Set(codes);
	}
	poll() {
		const src = this.injected ?? this.keys;
		let moveX = 0;
		if (src.has("KeyA") || src.has("ArrowLeft") || this.touchLeft) moveX -= 1;
		if (src.has("KeyD") || src.has("ArrowRight") || this.touchRight) moveX += 1;
		const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : [];
		if (pads) for (const p of pads) {
			if (!p || p.mapping !== "standard") continue;
			const ax = p.axes[0] ?? 0;
			const mag = Math.abs(ax);
			if (mag > .18) {
				const scaled = (mag - .18) / .82 * Math.sign(ax);
				moveX += scaled;
			}
			if (p.buttons[14]?.pressed) moveX -= 1;
			if (p.buttons[15]?.pressed) moveX += 1;
			if (p.buttons[0]?.pressed || p.buttons[12]?.pressed) this.keys.add("__padJump");
			else this.keys.delete("__padJump");
			if (p.buttons[1]?.pressed || p.buttons[2]?.pressed) this.keys.add("__padInteract");
			else this.keys.delete("__padInteract");
			if (p.buttons[9]?.pressed) this.keys.add("__padPause");
			else this.keys.delete("__padPause");
			if (p.buttons[13]?.pressed) this.keys.add("__padDown");
			else this.keys.delete("__padDown");
		}
		moveX = Math.max(-1, Math.min(1, moveX));
		const jumpHeld = src.has("KeyW") || src.has("ArrowUp") || src.has("Space") || src.has("__padJump") || this.touchJump;
		const interactHeld = src.has("KeyE") || src.has("KeyF") || src.has("__padInteract") || this.touchInteract;
		const pauseHeld = src.has("Escape") || src.has("KeyP") || src.has("__padPause");
		const down = src.has("KeyS") || src.has("ArrowDown") || src.has("__padDown");
		const jump = jumpHeld && !this.prevJump;
		const interact = interactHeld && !this.prevInteract;
		const pause = pauseHeld && !this.prevPause;
		this.prevJump = jumpHeld;
		this.prevInteract = interactHeld;
		this.prevPause = pauseHeld;
		return {
			moveX,
			jump,
			jumpHeld,
			down,
			interact,
			pause
		};
	}
};
var SCALES = {
	meadow: [
		0,
		2,
		4,
		7,
		9,
		12,
		14,
		16
	],
	orchard: [
		0,
		3,
		5,
		7,
		10,
		12,
		15,
		17
	],
	hills: [
		0,
		2,
		5,
		7,
		9,
		12,
		14,
		17
	],
	sky: [
		0,
		2,
		4,
		6,
		9,
		11,
		14,
		16
	],
	library: [
		0,
		2,
		3,
		7,
		8,
		12,
		14,
		15
	],
	village: [
		0,
		2,
		4,
		5,
		9,
		11,
		12,
		16
	],
	bakery: [
		0,
		3,
		5,
		7,
		10,
		12,
		14,
		17
	],
	night: [
		0,
		3,
		5,
		7,
		10,
		12,
		15,
		19
	],
	pond: [
		0,
		2,
		4,
		7,
		9,
		11,
		14,
		16
	],
	castle: [
		0,
		2,
		4,
		7,
		9,
		12,
		16,
		19
	]
};
var PATTERNS = {
	meadow: [
		0,
		2,
		4,
		2,
		5,
		4,
		2,
		0,
		3,
		4,
		6,
		4,
		2,
		1,
		0,
		2
	],
	orchard: [
		0,
		1,
		3,
		4,
		3,
		1,
		0,
		2,
		4,
		5,
		4,
		3,
		1,
		2,
		0,
		1
	],
	hills: [
		0,
		4,
		2,
		5,
		4,
		2,
		6,
		4,
		0,
		2,
		4,
		7,
		5,
		4,
		2,
		0
	],
	sky: [
		4,
		6,
		7,
		6,
		4,
		2,
		4,
		5,
		7,
		6,
		4,
		2,
		0,
		2,
		4,
		6
	],
	library: [
		0,
		2,
		3,
		5,
		3,
		2,
		0,
		4,
		5,
		3,
		2,
		5,
		3,
		2,
		1,
		0
	],
	village: [
		0,
		2,
		4,
		5,
		4,
		2,
		3,
		0,
		4,
		5,
		7,
		5,
		4,
		2,
		0,
		2
	],
	bakery: [
		2,
		4,
		5,
		4,
		2,
		0,
		2,
		4,
		5,
		7,
		5,
		4,
		1,
		2,
		4,
		2
	],
	night: [
		0,
		3,
		4,
		3,
		6,
		4,
		3,
		0,
		2,
		4,
		6,
		4,
		3,
		1,
		0,
		3
	],
	pond: [
		4,
		2,
		0,
		2,
		5,
		4,
		2,
		4,
		6,
		4,
		2,
		0,
		2,
		3,
		4,
		2
	],
	castle: [
		0,
		4,
		7,
		4,
		6,
		4,
		2,
		0,
		4,
		5,
		7,
		6,
		4,
		2,
		0,
		4
	]
};
var AudioBus = class {
	ctx = null;
	master = null;
	musicGain = null;
	sfxGain = null;
	musicVol = .55;
	sfxVol = .85;
	muted = false;
	step = 0;
	acc = 0;
	biome = "meadow";
	playing = false;
	unlock() {
		if (!this.ctx) {
			const AC = window.AudioContext || window.webkitAudioContext;
			this.ctx = new AC({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.musicGain = this.ctx.createGain();
			this.sfxGain = this.ctx.createGain();
			this.musicGain.connect(this.master);
			this.sfxGain.connect(this.master);
			this.master.connect(this.ctx.destination);
			this.applyVol();
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
		this.playing = true;
	}
	setMusic(v) {
		this.musicVol = v;
		this.applyVol();
	}
	setSfx(v) {
		this.sfxVol = v;
		this.applyVol();
	}
	setMuted(m) {
		this.muted = m;
		this.applyVol();
	}
	applyVol() {
		const t = this.ctx?.currentTime ?? 0;
		const m = this.muted ? 0 : 1;
		this.master?.gain.setTargetAtTime(m, t, .04);
		this.musicGain?.gain.setTargetAtTime(this.musicVol * this.musicVol, t, .04);
		this.sfxGain?.gain.setTargetAtTime(this.sfxVol * this.sfxVol, t, .04);
	}
	setBiome(b) {
		this.biome = b;
	}
	resume() {
		if (this.ctx?.state === "suspended") this.ctx.resume();
	}
	tick(dt) {
		if (!this.playing || !this.ctx || !this.musicGain) return;
		this.acc += dt;
		const beat = .42;
		if (this.acc < beat) return;
		this.acc -= beat;
		const pat = PATTERNS[this.biome];
		const sc = SCALES[this.biome];
		const idx = pat[this.step % pat.length] ?? 0;
		this.step++;
		const note = sc[idx] ?? 0;
		const bass = this.step % 4 === 1;
		this.pluck(261.63 * Math.pow(2, note / 12), .07, .55, true);
		if (bass) this.pluck(130.81 * Math.pow(2, (sc[0] ?? 0) / 12), .05, .9, true);
	}
	pluck(freq, gain, dur, music) {
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
		g.gain.setValueAtTime(1e-4, ctx.currentTime);
		g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + .02);
		g.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + dur);
		osc.connect(f);
		f.connect(g);
		g.connect(bus);
		osc.start();
		osc.stop(ctx.currentTime + dur + .05);
		osc.onended = () => {
			osc.disconnect();
			f.disconnect();
			g.disconnect();
		};
	}
	sfx(kind) {
		const jitter = 1 + (Math.random() * 2 - 1) * .08;
		switch (kind) {
			case "jump":
				this.pluck(520 * jitter, .08, .12, false);
				break;
			case "land":
				this.pluck(180 * jitter, .07, .1, false);
				break;
			case "gem":
				this.pluck(880 * jitter, .09, .18, false);
				this.pluck(1320 * jitter, .05, .22, false);
				break;
			case "clue":
				this.pluck(523, .1, .3, false);
				this.pluck(659, .09, .35, false);
				this.pluck(784, .08, .45, false);
				break;
			case "hint":
				this.pluck(700, .07, .2, false);
				this.pluck(940, .05, .28, false);
				break;
			case "talk":
				this.pluck(340 * jitter, .05, .08, false);
				break;
			case "portal":
				this.pluck(392, .08, .4, false);
				this.pluck(523, .07, .5, false);
				this.pluck(659, .06, .6, false);
				break;
			case "push":
				this.pluck(140 * jitter, .06, .08, false);
				break;
			case "wind":
				this.pluck(220 * jitter, .03, .3, false);
				break;
			case "letter":
				this.pluck(620, .08, .25, false);
				this.pluck(780, .06, .32, false);
		}
	}
};
var CLUE_ORDER = [
	"flower",
	"apple",
	"horse",
	"rainbow",
	"book",
	"hat",
	"cookie",
	"star",
	"duck",
	"key"
];
var CLUE_LABEL = {
	flower: "Meadow Flower",
	apple: "Orchard Apple",
	horse: "Hill Horse",
	rainbow: "Sky Rainbow",
	book: "Library Book",
	hat: "Village Hat",
	cookie: "Bakery Cookie",
	star: "Night Star",
	duck: "Pond Duck",
	key: "Castle Key"
};
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 >>> 0;
		let t = a;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function plat(x, y, w, h, kind = "solid", extra = {}) {
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
		...extra
	};
}
var GROUND_Y = 864;
var HEIGHT = 1152;
function compile(bp) {
	const rng = mulberry32(bp.id * 9973 + 17);
	const width = bp.widthTiles * 48;
	const platforms = [];
	const holes = bp.groundHoles ?? [];
	let cursor = 0;
	const groundSegs = [];
	for (const hole of [...holes].sort((a, b) => a.x - b.x)) {
		if (hole.x > cursor) groundSegs.push({
			x: cursor,
			w: hole.x - cursor
		});
		cursor = hole.x + hole.w;
	}
	if (cursor < width) groundSegs.push({
		x: cursor,
		w: width - cursor
	});
	for (const g of groundSegs) platforms.push(plat(g.x, GROUND_Y, g.w, HEIGHT - GROUND_Y + 200, groundKind(bp.biome)));
	for (const h of bp.hills ?? []) platforms.push(plat(h.x, GROUND_Y - h.h, h.w, h.h, "stone"));
	for (const w of bp.walls ?? []) platforms.push(plat(w.x, GROUND_Y - w.h, w.w, w.h, "stone"));
	for (const water of bp.waters ?? []) {
		platforms.push(plat(water.x, GROUND_Y + 18, water.w, 90, "water"));
		platforms.push(plat(water.x, GROUND_Y + 86, water.w, 160, "solid"));
	}
	platforms.push(...bp.extraPlatforms);
	const clusterCount = Math.floor(bp.widthTiles / 22);
	for (let i = 2; i < clusterCount - 1; i++) {
		const cx = i * 22 * 48 + rng() * 8 * 48;
		if (bp.waters?.some((w) => cx > w.x - 80 && cx < w.x + w.w + 80)) continue;
		const layers = 2 + Math.floor(rng() * 3);
		for (let L = 0; L < layers; L++) {
			const pw = (3 + Math.floor(rng() * 5)) * 48;
			const px = cx + (rng() - .5) * 10 * 48;
			const py = GROUND_Y - (3 + L * 3) * 48 - Math.floor(rng() * 2) * 48;
			platforms.push(plat(px, py, pw, 18, rng() > .35 ? "oneway" : "wood"));
		}
	}
	if (bp.id >= 3) {
		const movers = 3 + bp.id;
		for (let i = 0; i < movers; i++) {
			const x = 1920 + rng() * (width - 3840);
			const y = GROUND_Y - (5 + Math.floor(rng() * 8)) * 48;
			const range = (3 + rng() * 5) * 48;
			platforms.push(plat(x, y, 168, 16, bp.biome === "sky" ? "cloud" : "oneway", {
				vx: 40 + rng() * 30,
				range,
				originX: x,
				phase: rng() * Math.PI * 2
			}));
		}
	}
	const diamonds = [];
	for (let i = 0; i < 10; i++) diamonds.push({
		x: 336 + i * 2.2 * 48,
		y: GROUND_Y - 32,
		taken: false,
		bob: i
	});
	const want = 52 + bp.id * 8;
	const tops = platforms.filter((p) => p.kind !== "water" && p.w >= 48 && p.y < GROUND_Y + 4);
	for (let i = 0; i < want; i++) {
		const p = tops[Math.floor(rng() * tops.length)];
		if (!p) continue;
		const x = p.x + 24 + rng() * Math.max(8, p.w - 48);
		const y = p.y - 28 - rng() * 18;
		if (x < 80 || x > width - 80) continue;
		diamonds.push({
			x,
			y,
			taken: false,
			bob: rng() * Math.PI * 2
		});
	}
	const decorations = [];
	const decoKinds = decoFor(bp.biome);
	for (let x = 40; x < width; x += 70 + rng() * 90) decorations.push({
		x,
		y: GROUND_Y,
		kind: decoKinds[Math.floor(rng() * decoKinds.length)] ?? "tuft",
		s: .8 + rng() * .5
	});
	return {
		width,
		height: HEIGHT,
		groundY: GROUND_Y,
		spawnX: 144,
		spawnY: GROUND_Y - 80,
		platforms,
		diamonds,
		clue: {
			id: bp.clue,
			x: bp.cluePos.x,
			y: bp.cluePos.y,
			taken: false,
			locked: false
		},
		npcs: bp.npcs,
		pickups: [...bp.pickups, {
			x: bp.letter.x,
			y: bp.letter.y,
			kind: "letter",
			taken: false
		}],
		pushables: bp.pushables,
		portalX: bp.portalX,
		portalY: GROUND_Y - 96,
		portalOpen: false,
		winds: bp.winds ?? [],
		cloud: bp.cloud ?? null,
		cave: bp.caves ?? null,
		gates: bp.gates ? {
			...bp.gates,
			open: 0
		} : null,
		pantry: bp.pantry ? {
			...bp.pantry,
			open: false
		} : null,
		pads: (bp.pads ?? []).map((p) => ({
			...p,
			filled: false
		})),
		decorations,
		biome: bp.biome,
		name: bp.name,
		subtitle: bp.subtitle,
		hintCost: bp.hintCost
	};
}
function groundKind(b) {
	if (b === "library" || b === "bakery") return "wood";
	if (b === "castle") return "stone";
	if (b === "pond") return "moss";
	if (b === "night") return "stone";
	return "solid";
}
function decoFor(b) {
	switch (b) {
		case "meadow": return [
			"tuft",
			"flower",
			"rock"
		];
		case "orchard": return [
			"tree",
			"tuft",
			"crate"
		];
		case "hills": return [
			"tuft",
			"rock",
			"reed"
		];
		case "sky": return ["tuft", "cloud"];
		case "library": return ["bookstack", "lamp"];
		case "village": return [
			"post",
			"tuft",
			"crate"
		];
		case "bakery": return [
			"sack",
			"crate",
			"lamp"
		];
		case "night": return [
			"rock",
			"lamp",
			"tuft"
		];
		case "pond": return [
			"reed",
			"rock",
			"tuft"
		];
		case "castle": return [
			"banner",
			"rock",
			"lamp"
		];
	}
}
var T = 48;
var GY = 18 * T;
function npc(x, kind, name, lines, y = GY) {
	return {
		x,
		y,
		kind,
		name,
		lines
	};
}
function crate(x, y) {
	return {
		x,
		y,
		w: 40,
		h: 40,
		kind: "crate",
		vx: 0,
		vy: 0
	};
}
function stool(x, y) {
	return {
		x,
		y,
		w: 44,
		h: 28,
		kind: "stool",
		vx: 0,
		vy: 0
	};
}
function statue(x, y) {
	return {
		x,
		y,
		w: 36,
		h: 52,
		kind: "statue",
		vx: 0,
		vy: 0
	};
}
var blueprints = [
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
				"Shiny diamonds help if you ever need a hint later."
			]),
			npc(70 * T, "bird", "Pipit", ["I saw a glowing flower past the third wall, up on a sunny ledge.", "If you miss a jump, nothing bad happens. The meadow always catches you."]),
			npc(150 * T, "lamb", "Wool", ["Mom used to walk this path. She loved the pink blossoms.", "A little letter is hiding on the tallest hill. She would have liked that."]),
			npc(220 * T, "bunny", "Nettle", ["When you find the flower, a soft portal will open near me.", "There is no rush. The castle waits kindly."])
		],
		walls: [
			{
				x: 28 * T,
				w: 3 * T,
				h: 2 * T
			},
			{
				x: 48 * T,
				w: 3.5 * T,
				h: 2.2 * T
			},
			{
				x: 78 * T,
				w: 4 * T,
				h: 2.4 * T
			},
			{
				x: 110 * T,
				w: 3 * T,
				h: 2 * T
			},
			{
				x: 140 * T,
				w: 5 * T,
				h: 2.6 * T
			},
			{
				x: 175 * T,
				w: 3 * T,
				h: 2 * T
			}
		],
		hills: [{
			x: 90 * T,
			w: 12 * T,
			h: 2 * T
		}, {
			x: 188 * T,
			w: 16 * T,
			h: 3 * T
		}],
		extraPlatforms: [
			plat(36 * T, GY - 5 * T, 4 * T, 16, "oneway"),
			plat(60 * T, GY - 6 * T, 5 * T, 16, "oneway"),
			plat(100 * T, GY - 7 * T, 6 * T, 16, "oneway"),
			plat(132 * T, GY - 5.5 * T, 4 * T, 16, "oneway"),
			plat(168 * T, GY - 8 * T, 5 * T, 16, "oneway"),
			plat(198 * T, GY - 6 * T, 7 * T, 16, "wood"),
			plat(230 * T, GY - 4 * T, 4 * T, 16, "oneway")
		],
		cluePos: {
			x: 196 * T,
			y: GY - 6 * T - 36
		},
		portalX: 248 * T,
		letter: {
			x: 190 * T,
			y: GY - 3 * T - 30
		},
		pickups: [],
		pushables: []
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
			npc(8 * T, "squirrel", "Pippin", ["The fence is too high to hop. Look up — crates and branches make a staircase.", "Push the crate if it is in your way. You are stronger than you look."]),
			npc(90 * T, "bird", "Pipit", ["The reddest apple hangs above the old fence. Climb, then step carefully."]),
			npc(170 * T, "lamb", "Cider", ["I hide letters in hollow trunks. Try the high platform past the second grove."]),
			npc(250 * T, "squirrel", "Hazel", ["Once you hold the apple, the orchard gate of light will open."])
		],
		walls: [{
			x: 96 * T,
			w: 2.2 * T,
			h: 8 * T
		}],
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
			plat(230 * T, GY - 6.5 * T, 5 * T, 16, "oneway")
		],
		cluePos: {
			x: 108 * T,
			y: GY - 10 * T - 36
		},
		portalX: 268 * T,
		letter: {
			x: 232 * T,
			y: GY - 6.5 * T - 28
		},
		pickups: [],
		pushables: [crate(32 * T, GY - 40), crate(70 * T, GY - 40)]
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
			npc(8 * T, "frog", "Pebble", ["The water is friendly. If you slip in, you will float to a bank. No one sinks here.", "Some stones bob. Wait for the tall moment, then hop."]),
			npc(130 * T, "bunny", "Thistle", ["The horse likes visitors who take the long way. There are diamonds under the west bluff."]),
			npc(210 * T, "lamb", "Moss", ["I keep a letter in the reed cave, high above the second pool."])
		],
		groundHoles: [{
			x: 48 * T,
			w: 38 * T
		}, {
			x: 150 * T,
			w: 28 * T
		}],
		waters: [{
			x: 48 * T,
			w: 38 * T
		}, {
			x: 150 * T,
			w: 28 * T
		}],
		extraPlatforms: [
			plat(52 * T, GY - 10, 3 * T, 18, "stone", {
				bob: 1,
				phase: 0
			}),
			plat(60 * T, GY - 24, 3 * T, 18, "stone", {
				bob: 1.2,
				phase: 1.2
			}),
			plat(68 * T, GY - 8, 3 * T, 18, "stone", {
				bob: 1,
				phase: 2.1
			}),
			plat(76 * T, GY - 28, 3.2 * T, 18, "stone", {
				bob: 1.4,
				phase: .4
			}),
			plat(154 * T, GY - 12, 3 * T, 18, "stone", {
				bob: 1,
				phase: .7
			}),
			plat(162 * T, GY - 30, 3 * T, 18, "stone", {
				bob: 1.3,
				phase: 1.8
			}),
			plat(170 * T, GY - 14, 3 * T, 18, "stone", {
				bob: 1,
				phase: 2.6
			}),
			plat(20 * T, GY - 5 * T, 4 * T, 16, "oneway"),
			plat(110 * T, GY - 6 * T, 6 * T, 16, "oneway"),
			plat(190 * T, GY - 7 * T, 5 * T, 16, "oneway"),
			plat(230 * T, GY - 4 * T, 8 * T, 16, "wood"),
			plat(255 * T, GY - 6 * T, 5 * T, 16, "oneway")
		],
		cluePos: {
			x: 236 * T,
			y: GY - 4 * T - 40
		},
		portalX: 288 * T,
		letter: {
			x: 192 * T,
			y: GY - 7 * T - 28
		},
		pickups: [],
		pushables: []
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
			npc(8 * T, "bird", "Gale", ["Jump onto the rain cloud to push it. Rainbows are shy until the sun returns.", "Floating islands drift. Ride them like slow boats."]),
			npc(120 * T, "bunny", "Cirrus", ["If you fall, the soft cloud-sea sets you back on the last grass. Promise."]),
			npc(240 * T, "lamb", "Nimbus", ["A letter is tucked on the highest drifting island. Look up, always look up."])
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
			plat(140 * T, GY - 11 * T, 4 * T, 16, "cloud")
		],
		cloud: {
			x: 148 * T,
			y: GY - 13 * T,
			w: 7 * T,
			h: 50
		},
		cluePos: {
			x: 146 * T,
			y: GY - 4 * T - 40
		},
		portalX: 308 * T,
		letter: {
			x: 202 * T,
			y: GY - 9 * T - 28
		},
		pickups: [],
		pushables: []
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
			npc(8 * T, "owl", "Quill", ["Push the little stool beneath the tall shelf. Books like to be reached politely.", "Press S to drop through a shelf you have already climbed."]),
			npc(90 * T, "cat", "Margot", ["I nap on the atlas table. The letter is behind the rolling ladder, very high."]),
			npc(200 * T, "owl", "Folio", ["When the book is yours, a doorway of gold light will open by the reading nook."])
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
			plat(270 * T, GY - 4 * T, 6 * T, 18, "wood")
		],
		cluePos: {
			x: 171 * T,
			y: GY - 9 * T - 36
		},
		portalX: 288 * T,
		letter: {
			x: 72 * T,
			y: GY - 10 * T - 28
		},
		pickups: [],
		pushables: [stool(174 * T, GY - 4 * T - 28)]
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
			npc(8 * T, "cat", "Bram", ["Gusts shove you along. If you do not like the direction, wait. The wind always takes a breath.", "The hat is on a high clothesline past the bakery chimneys."]),
			npc(140 * T, "bird", "Kite", ["I ride the gusts. You can too — sometimes they help you reach a far roof."]),
			npc(250 * T, "lamb", "Linen", ["A letter is pinned under the weather vane platform. Climb the west roofs."])
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
			plat(305 * T, GY - 4 * T, 6 * T, 16, "wood")
		],
		winds: [
			{
				x: 40 * T,
				w: 40 * T,
				force: 280,
				period: 3.2,
				duty: .45,
				phase: 0
			},
			{
				x: 120 * T,
				w: 50 * T,
				force: -260,
				period: 3.6,
				duty: .4,
				phase: 1.1
			},
			{
				x: 200 * T,
				w: 55 * T,
				force: 300,
				period: 2.8,
				duty: .42,
				phase: .4
			}
		],
		cluePos: {
			x: 214 * T,
			y: GY - 10 * T - 36
		},
		portalX: 318 * T,
		letter: {
			x: 112 * T,
			y: GY - 8 * T - 28
		},
		pickups: [],
		pushables: []
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
			npc(8 * T, "cat", "Miss Crumb", ["The pantry door will not open without its ribbon. I last saw the ribbon on a high flour shelf.", "Push sacks if you need a step. Flour is forgiving."]),
			npc(100 * T, "owl", "Yeast", ["A good baker never hurries. Check every loft."]),
			npc(200 * T, "lamb", "Buttercup", ["The letter is in a warm nook above the second oven."])
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
			plat(280 * T, GY - 5 * T, 6 * T, 16, "wood")
		],
		pantry: {
			x: 188 * T,
			y: GY - 110,
			w: 70,
			h: 110
		},
		pickups: [{
			x: 74 * T,
			y: GY - 10 * T - 28,
			kind: "ribbon",
			taken: false
		}],
		cluePos: {
			x: 198 * T,
			y: GY - 50
		},
		portalX: 298 * T,
		letter: {
			x: 252 * T,
			y: GY - 9 * T - 28
		},
		pushables: [crate(40 * T, GY - 40), crate(160 * T, GY - 40)]
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
			npc(8 * T, "owl", "Lumen", ["The cave is only dark, never dangerous. A firefly makes it cozy.", "I saw a glow in the grass near the first lantern posts."]),
			npc(90 * T, "frog", "Dew", ["Stars like to hide at the far end of tunnels. Keep walking. The walls are kind."]),
			npc(280 * T, "lamb", "Twilight", ["A letter rests on a moonlit ledge above the cave mouth."])
		],
		extraPlatforms: [
			plat(24 * T, GY - 4 * T, 5 * T, 16, "stone"),
			plat(50 * T, GY - 6 * T, 4 * T, 16, "oneway"),
			plat(80 * T, GY - 5 * T, 6 * T, 16, "stone"),
			plat(130 * T, GY - 4 * T, 8 * T, 16, "stone"),
			plat(200 * T, GY - 6 * T, 5 * T, 16, "oneway"),
			plat(240 * T, GY - 8 * T, 6 * T, 16, "stone"),
			plat(300 * T, GY - 5 * T, 6 * T, 16, "oneway"),
			plat(155 * T, GY - 7 * T, 4 * T, 16, "stone")
		],
		caves: {
			x: 150 * T,
			w: 90 * T
		},
		pickups: [{
			x: 84 * T,
			y: GY - 5 * T - 28,
			kind: "firefly",
			taken: false
		}],
		cluePos: {
			x: 220 * T,
			y: GY - 40
		},
		portalX: 328 * T,
		letter: {
			x: 156 * T,
			y: GY - 7 * T - 28
		},
		pushables: []
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
			npc(8 * T, "frog", "Lily", ["Moss is slippery. You will keep sliding until you find rough wood again.", "The duck is on the island garden. She likes visitors who do not splash too loudly."]),
			npc(120 * T, "bird", "Reed", ["If you slide into the pond, you will bob up. The pond is a friend."]),
			npc(250 * T, "bunny", "Willow", ["A letter is in the reed loft, the highest little dock."])
		],
		groundHoles: [{
			x: 70 * T,
			w: 46 * T
		}],
		waters: [{
			x: 70 * T,
			w: 46 * T
		}],
		extraPlatforms: [
			plat(70 * T, GY - 8, 46 * T, 16, "moss"),
			plat(24 * T, GY - 5 * T, 5 * T, 16, "wood"),
			plat(50 * T, GY - 7 * T, 4 * T, 16, "oneway"),
			plat(130 * T, GY - 6 * T, 6 * T, 16, "wood"),
			plat(170 * T, GY - 4 * T, 10 * T, 18, "wood"),
			plat(210 * T, GY - 7 * T, 5 * T, 16, "oneway"),
			plat(240 * T, GY - 9 * T, 5 * T, 16, "wood"),
			plat(280 * T, GY - 5 * T, 6 * T, 16, "wood"),
			plat(310 * T, GY - 7 * T, 5 * T, 16, "oneway")
		],
		cluePos: {
			x: 176 * T,
			y: GY - 4 * T - 40
		},
		portalX: 328 * T,
		letter: {
			x: 242 * T,
			y: GY - 9 * T - 28
		},
		pickups: [],
		pushables: []
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
			npc(8 * T, "owl", "Herald", ["Push each statue onto a stone pad. They are heavy, but they listen.", "The key waits in the inner garden once the gates part."]),
			npc(80 * T, "lamb", "Banner", ["You have been so brave and so gentle. Mom would be proud of every hop."]),
			npc(200 * T, "cat", "Porter", ["A last letter sits on the east battlement. Read it before you go in."]),
			npc(330 * T, "bunny", "Keep", ["When the key is in your satchel, the castle will open its arms."])
		],
		extraPlatforms: [
			plat(24 * T, GY - 4 * T, 6 * T, 18, "stone"),
			plat(50 * T, GY - 7 * T, 5 * T, 18, "stone"),
			plat(90 * T, GY - 5 * T, 6 * T, 16, "oneway"),
			plat(130 * T, GY - 8 * T, 5 * T, 18, "stone"),
			plat(260 * T, GY - 4 * T, 8 * T, 18, "stone"),
			plat(290 * T, GY - 7 * T, 6 * T, 18, "stone"),
			plat(320 * T, GY - 10 * T, 5 * T, 18, "stone"),
			plat(340 * T, GY - 5 * T, 6 * T, 16, "oneway")
		],
		gates: {
			x: 168 * T,
			w: 28,
			h: 7 * T
		},
		pads: [{
			x: 145 * T,
			y: GY - 10,
			w: 50
		}, {
			x: 210 * T,
			y: GY - 10,
			w: 50
		}],
		pushables: [statue(40 * T, GY - 52), statue(110 * T, GY - 52)],
		cluePos: {
			x: 188 * T,
			y: GY - 40
		},
		portalX: 348 * T,
		letter: {
			x: 322 * T,
			y: GY - 10 * T - 28
		},
		pickups: []
	}
];
function buildLevel(index) {
	const bp = blueprints[Math.max(0, Math.min(blueprints.length - 1, index))];
	const world = compile(bp);
	if (bp.id === 3) world.clue.locked = true;
	if (bp.id === 4) world.clue.locked = true;
	if (bp.id === 6) world.clue.locked = true;
	if (bp.id === 9) world.clue.locked = true;
	return world;
}
var LEVEL_COUNT = blueprints.length;
var LEVEL_META = blueprints.map((b) => ({
	name: b.name,
	subtitle: b.subtitle,
	biome: b.biome,
	story: b.story,
	clue: b.clue
}));
var PW = 26;
var PH = 40;
var SPEED = 228;
var ACC = 2700;
var AIR = 1550;
var FRIC = 2400;
var ICEF = 320;
var JUMPV = -910;
var GUP = 1620;
var GDOWN = 2580;
var GAPEX = 880;
var TERM = 1e3;
var COYOTE = .11;
var BUFFER = .13;
function aabb(a, b) {
	return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function roundRect(ctx, x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.arcTo(x + w, y, x + w, y + h, rr);
	ctx.arcTo(x + w, y + h, x, y + h, rr);
	ctx.arcTo(x, y + h, x, y, rr);
	ctx.arcTo(x, y, x + w, y, rr);
	ctx.closePath();
}
var Game = class {
	canvas;
	ctx;
	assets;
	hooks;
	input = new Input();
	audio = new AudioBus();
	world;
	player;
	level = 0;
	diamonds = 0;
	letters = 0;
	clues = [];
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
	particles = [];
	pops = [];
	nearNpc = null;
	raf = 0;
	lastTs = 0;
	shakeOn = true;
	reduced = false;
	dpr = 1;
	vw = 960;
	vh = 540;
	hudAcc = 0;
	constructor(canvas, assets, hooks) {
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
	onVis = () => {
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
	startLevel(index, diamonds, clues, letters) {
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
			inWater: false
		};
		this.camX = this.player.x - this.vw * .4;
		this.camY = this.player.y - this.vh * .55;
		this.paused = false;
		this.running = true;
		this.lastTs = 0;
		this.emitHud();
		cancelAnimationFrame(this.raf);
		this.raf = requestAnimationFrame(this.loop);
	}
	installProbe() {
		window.__controlsTest = {
			getYaw: () => this.player.facing >= 0 ? 0 : Math.PI,
			getSpeed: () => Math.abs(this.player?.vx ?? 0),
			getX: () => this.player?.x ?? 0,
			setKeys: (codes) => {
				this.input.setKeys(codes);
			}
		};
	}
	loop = (ts) => {
		if (!this.running) return;
		if (!this.lastTs) this.lastTs = ts;
		let dt = (ts - this.lastTs) / 1e3;
		this.lastTs = ts;
		if (dt > .1) dt = .1;
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
	fixed(dt) {
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
		if (act.down && p.grounded) p.drop = .22;
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
		} else p.vx *= 1 - .55 * dt;
		const cap = onIce ? SPEED * 1.15 : SPEED;
		if (p.vx > cap) p.vx = cap;
		if (p.vx < -cap) p.vx = -cap;
		for (const z of w.winds) {
			z.phase += dt;
			if (z.phase % z.period / z.period < z.duty && p.x + p.w > z.x && p.x < z.x + z.w) {
				p.vx += z.force * dt;
				if (Math.random() < .02) this.audio.sfx("wind");
			}
		}
		const canJump = p.grounded || p.coyote > 0 || p.inWater;
		if (p.buffer > 0 && canJump) {
			p.vy = p.inWater ? JUMPV * .55 : JUMPV;
			p.grounded = false;
			p.coyote = 0;
			p.buffer = 0;
			p.squash = 1.22;
			this.audio.sfx("jump");
			this.burst(p.x + p.w / 2, p.y + p.h, 6, "#e7dcc8");
		}
		if (!act.jumpHeld && p.vy < -80) p.vy *= .52;
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
				p.squash = .78;
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
		const tx = p.x + p.w / 2 - this.vw * .5 + look;
		const ty = p.y + p.h / 2 - this.vh * .58;
		const k = 1 - Math.exp(-4.2 * dt);
		this.camX += (tx - this.camX) * k;
		this.camY += (ty - this.camY) * k;
		this.camX = Math.max(0, Math.min(w.width - this.vw, this.camX));
		this.camY = Math.max(0, Math.min(Math.max(0, w.height - this.vh), this.camY));
		this.trauma = Math.max(0, this.trauma - dt * 1.8);
		this.hudAcc += dt;
		if (this.hudAcc > .12) {
			this.hudAcc = 0;
			this.emitHud();
		}
	}
	standingOn(p, kind) {
		const probe = {
			x: p.x + 4,
			y: p.y + p.h,
			w: p.w - 8,
			h: 6
		};
		return this.world.platforms.some((pl) => pl.kind === kind && aabb(probe, pl));
	}
	solids() {
		const list = this.world.platforms.filter((p) => p.kind !== "water");
		const g = this.world.gates;
		if (g && g.open < .85) list.push({
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
			sink: 0
		});
		const pan = this.world.pantry;
		if (pan && !pan.open) list.push({
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
			sink: 0
		});
		return list;
	}
	moveAxis(p, dx, dy) {
		p.x += dx;
		p.y += dy;
		p.inWater = false;
		for (const pl of this.world.platforms) if (pl.kind === "water" && aabb(p, pl)) p.inWater = true;
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
	stepMovers(dt) {
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
		if (c && aabb(this.player, {
			x: c.x,
			y: c.y,
			w: c.w,
			h: c.h + 8
		})) {
			if (this.player.vy > 0) {
				this.player.vy = JUMPV * .35;
				this.player.grounded = true;
			}
			c.x += this.player.facing * 70 * dt;
		}
	}
	stepPushables(dt, moveX) {
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
				if (p.x < b.x) b.x += Math.max(0, moveX) * 90 * dt;
				else b.x += Math.min(0, moveX) * 90 * dt;
			}
			b.x = Math.max(8, Math.min(this.world.width - b.w - 8, b.x));
		}
	}
	stepPuzzles() {
		const w = this.world;
		if (this.level === 3 && w.cloud && w.clue.locked) {
			if (!(Math.abs(w.cloud.x + w.cloud.w / 2 - w.clue.x) < 140)) {
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
				pad.filled = w.pushables.some((s) => s.kind === "statue" && s.x + s.w / 2 > pad.x && s.x + s.w / 2 < pad.x + pad.w && Math.abs(s.y + s.h - w.groundY) < 20);
				if (pad.filled) n++;
			}
			if (n >= w.pads.length) {
				w.gates.open = Math.min(1, w.gates.open + .02);
				if (w.gates.open > .85) w.clue.locked = false;
			}
		}
	}
	collect(interact) {
		const p = this.player;
		p.x - 6, p.y - 8, p.w + 12, p.h + 12;
		for (const d of this.world.diamonds) {
			if (d.taken) continue;
			if (Math.hypot(d.x - (p.x + p.w / 2), d.y - (p.y + p.h / 2)) < 30) {
				d.taken = true;
				this.diamonds += 1;
				this.audio.sfx("gem");
				this.burst(d.x, d.y, 10, "#6aaec8");
				this.pops.push({
					x: d.x,
					y: d.y,
					t: 0,
					text: "+1"
				});
				this.trauma = Math.min(1, this.trauma + .08);
			}
		}
		const c = this.world.clue;
		if (!c.taken && !c.locked && Math.hypot(c.x - (p.x + p.w / 2), c.y - (p.y + 12)) < 38) {
			c.taken = true;
			this.world.portalOpen = true;
			if (!this.clues.includes(c.id)) this.clues.push(c.id);
			this.audio.sfx("clue");
			this.burst(c.x, c.y, 22, "#c45c6a");
			this.trauma = Math.min(1, this.trauma + .28);
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
		for (const n of this.world.npcs) if (Math.abs(n.x - (p.x + p.w / 2)) < 50 && Math.abs(n.y - (p.y + p.h)) < 80) {
			this.nearNpc = n.name;
			if (interact) {
				this.audio.sfx("talk");
				this.hooks.onDialogue(n.name, n.lines);
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
	stepHint(dt) {
		if (this.hintOn) {
			this.hintT -= dt;
			if (this.hintT <= 0) this.hintOn = false;
		}
	}
	burst(x, y, n, color) {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = 40 + Math.random() * 90;
			this.particles.push({
				x,
				y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s - 30,
				life: .45 + Math.random() * .3,
				max: .7,
				r: 2 + Math.random() * 3,
				color
			});
		}
	}
	stepParticles(dt) {
		for (const q of this.particles) {
			q.life -= dt;
			q.x += q.vx * dt;
			q.y += q.vy * dt;
			q.vy += 180 * dt;
		}
		this.particles = this.particles.filter((q) => q.life > 0);
		for (const pop of this.pops) pop.t += dt;
		this.pops = this.pops.filter((q) => q.t < .7);
	}
	emitHud() {
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
			paused: this.paused
		});
	}
	draw() {
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
			const par = camX * .22;
			const bw = Math.max(vw, bg.width / bg.height * vh * 1.05);
			const bh = vh * 1.05;
			ctx.drawImage(bg, -(par % bw), vh - bh + 10 - camY * .04, bw, bh);
			ctx.drawImage(bg, -(par % bw) + bw - 1, vh - bh + 10 - camY * .04, bw, bh);
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
	drawSky(ctx, vw, vh) {
		const g = ctx.createLinearGradient(0, 0, 0, vh);
		const pal = {
			meadow: ["#9fd4ee", "#d9f0c7"],
			orchard: ["#f2d7a6", "#c5dd9a"],
			hills: ["#8ec8e6", "#cfe8b8"],
			sky: ["#b9d8f5", "#f3e9ff"],
			library: ["#3d2c24", "#c9a078"],
			village: ["#87c5e6", "#f0e0c0"],
			bakery: ["#e8c8a0", "#f6e6cc"],
			night: ["#1a2038", "#3a4568"],
			pond: ["#c5e4e2", "#d7e8c8"],
			castle: ["#a8d2ea", "#efe4c8"]
		};
		const [a, b] = pal[this.world.biome] ?? pal.meadow;
		g.addColorStop(0, a);
		g.addColorStop(1, b);
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, vw, vh);
	}
	drawDecor(ctx) {
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
	platColor(kind) {
		switch (kind) {
			case "wood": return ["#c9a36a", "#8a6238"];
			case "stone": return ["#c5b8a8", "#7d7166"];
			case "cloud": return ["#f7f4ee", "#d5d0c6"];
			case "moss": return ["#7da86a", "#4c8a62"];
			case "ice": return ["#d5eef2", "#7eafb8"];
			case "oneway": return ["#d7c39a", "#9a7a4a"];
			default: return ["#6faf72", "#3f7a48"];
		}
	}
	drawPlatforms(ctx) {
		for (const pl of this.world.platforms) {
			if (pl.kind === "water") {
				ctx.fillStyle = "rgba(90, 170, 190, 0.45)";
				ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
				ctx.strokeStyle = "rgba(255,255,255,0.45)";
				ctx.lineWidth = 2;
				ctx.beginPath();
				for (let x = pl.x; x < pl.x + pl.w; x += 16) {
					const y = pl.y + Math.sin(this.time * 2 + x * .05) * 3;
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
			roundRect(ctx, pl.x, pl.y, pl.w, Math.min(16, pl.h * .45), 8);
			ctx.fill();
			ctx.strokeStyle = "#3a2a28";
			ctx.lineWidth = 1.8;
			roundRect(ctx, pl.x, pl.y, pl.w, pl.h, 8);
			ctx.stroke();
		}
	}
	drawCloud(ctx) {
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
			ctx.fillRect(x, c.y + c.h, 3, 10 + i % 3 * 6);
		}
	}
	drawGates(ctx) {
		const g = this.world.gates;
		if (!g) return;
		const h = g.h * (1 - g.open * .85);
		ctx.fillStyle = "#c5b8a8";
		ctx.fillRect(g.x, this.world.groundY - h, g.w, h);
		ctx.strokeStyle = "#3a2a28";
		ctx.strokeRect(g.x, this.world.groundY - h, g.w, h);
	}
	drawPantry(ctx) {
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
	drawPads(ctx) {
		for (const pad of this.world.pads) {
			ctx.fillStyle = pad.filled ? "#4c8a62" : "#c5b8a8";
			roundRect(ctx, pad.x, pad.y, pad.w, 12, 4);
			ctx.fill();
			ctx.strokeStyle = "#3a2a28";
			ctx.stroke();
		}
	}
	drawPushables(ctx) {
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
	drawPickups(ctx) {
		const bob = (t) => Math.sin(this.time * 3 + t) * 5;
		for (const d of this.world.diamonds) {
			if (d.taken) continue;
			const img = this.assets.items.diamond;
			const y = d.y + bob(d.bob);
			ctx.drawImage(img, d.x - 16, y - 16, 32, 32);
		}
		const c = this.world.clue;
		if (!c.taken) {
			const img = this.assets.items[c.id];
			const glow = .45 + Math.sin(this.time * 3) * .2;
			ctx.save();
			ctx.globalAlpha = c.locked ? .4 : 1;
			ctx.shadowColor = `rgba(196,92,106,${glow})`;
			ctx.shadowBlur = 18;
			ctx.drawImage(img, c.x - 22, c.y + bob(1) - 22, 44, 44);
			ctx.restore();
		}
		for (const pk of this.world.pickups) {
			if (pk.taken) continue;
			if (pk.kind === "firefly") ctx.drawImage(this.assets.items.firefly, pk.x - 16, pk.y + bob(2) - 16, 32, 32);
			else if (pk.kind === "ribbon") {
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
	drawNpcs(ctx) {
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
	stampNpc(ctx, kind) {
		ctx.lineWidth = 1.7;
		ctx.strokeStyle = "#2f241f";
		ctx.fillStyle = kind === "frog" ? "#4c8a62" : kind === "cat" ? "#d08a4a" : kind === "owl" ? "#c4a574" : kind === "bird" ? "#6aaec8" : kind === "lamb" ? "#f4eee3" : "#f7f0e6";
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
			ctx.ellipse(-6, -18, 3, 9, -.2, 0, Math.PI * 2);
			ctx.ellipse(6, -18, 3, 9, .2, 0, Math.PI * 2);
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
	drawPortal(ctx) {
		if (!this.world.portalOpen) return;
		const x = this.world.portalX;
		const y = this.world.groundY;
		const h = 92;
		const g = ctx.createLinearGradient(x, y - h, x, y);
		g.addColorStop(0, "rgba(196,92,106,0.0)");
		g.addColorStop(.4, "rgba(196,92,106,0.55)");
		g.addColorStop(1, "rgba(244,238,227,0.85)");
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.ellipse(x, y - 8, 22 + Math.sin(this.time * 2) * 3, h / 2, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "#c45c6a";
		ctx.stroke();
	}
	drawHint(ctx) {
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
	drawPlayer(ctx) {
		const p = this.player;
		const frames = this.assets.player;
		const img = frames[Math.abs(p.vx) > 18 && p.grounded ? Math.floor(p.anim) % frames.length : Math.floor(this.time * 2) % frames.length] ?? frames[0];
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
	drawParticles(ctx) {
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
			ctx.globalAlpha = 1 - pop.t / .7;
			ctx.fillStyle = "#2f241f";
			ctx.fillText(pop.text, pop.x, pop.y - pop.t * 40);
		}
		ctx.globalAlpha = 1;
	}
	drawCaveDark(ctx, camX, camY) {
		const cave = this.world.cave;
		if (!cave) return;
		const p = this.player;
		if (!(p.x > cave.x && p.x < cave.x + cave.w) && p.x < cave.x - 80) return;
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
	drawWind(ctx, camX) {
		for (const z of this.world.winds) {
			if (z.phase % z.period / z.period > z.duty) continue;
			ctx.strokeStyle = "rgba(255,255,255,0.35)";
			ctx.lineWidth = 2;
			for (let i = 0; i < 6; i++) {
				const x = z.x - camX + (this.time * 80 * Math.sign(z.force) + i * 40) % z.w;
				const y = 80 + i * 40;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x + 28 * Math.sign(z.force), y + 4);
				ctx.stroke();
			}
		}
	}
};
var KEY = "castle-quest-save";
var VERSION = 1;
var defaults = () => ({
	version: VERSION,
	diamonds: 0,
	maxLevel: 0,
	currentLevel: 0,
	clues: [],
	letters: [],
	settings: {
		music: .55,
		sfx: .85,
		shake: true
	}
});
function migrate(raw) {
	const d = defaults();
	return {
		...d,
		...raw,
		version: VERSION,
		clues: (raw.clues ?? []).filter((c) => CLUE_ORDER.includes(c)),
		letters: raw.letters ?? [],
		settings: {
			...d.settings,
			...raw.settings ?? {}
		}
	};
}
function loadSave() {
	try {
		if (typeof localStorage === "undefined") return defaults();
		const txt = localStorage.getItem(KEY);
		if (!txt) return defaults();
		return migrate(JSON.parse(txt));
	} catch {
		return defaults();
	}
}
function writeSave(data) {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			...data,
			version: VERSION
		}));
	} catch {}
}
function resetSave() {
	const d = defaults();
	writeSave(d);
	return d;
}
function GameApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const gameRef = (0, import_react.useRef)(null);
	const assetsRef = (0, import_react.useRef)(null);
	const [screen, setScreen] = (0, import_react.useState)("title");
	const [ready, setReady] = (0, import_react.useState)(false);
	const [hud, setHud] = (0, import_react.useState)(null);
	const [dialogue, setDialogue] = (0, import_react.useState)(null);
	const [toast, setToast] = (0, import_react.useState)(null);
	const [journal, setJournal] = (0, import_react.useState)(false);
	const [settings, setSettings] = (0, import_react.useState)(false);
	const [save, setSave] = (0, import_react.useState)(() => typeof window === "undefined" ? loadSave() : loadSave());
	const [storyIndex, setStoryIndex] = (0, import_react.useState)(0);
	const toastTimer = (0, import_react.useRef)(0);
	const persist = (0, import_react.useCallback)((patch) => {
		setSave((s) => {
			const next = {
				...s,
				...patch,
				settings: {
					...s.settings,
					...patch.settings ?? {}
				}
			};
			writeSave(next);
			return next;
		});
	}, []);
	(0, import_react.useEffect)(() => {
		let live = true;
		loadAssets().then((a) => {
			if (!live) return;
			assetsRef.current = a;
			setReady(true);
		}).catch(() => {
			if (live) setReady(true);
		});
		return () => {
			live = false;
		};
	}, []);
	const showToast = (0, import_react.useCallback)((msg) => {
		setToast(msg);
		window.clearTimeout(toastTimer.current);
		toastTimer.current = window.setTimeout(() => setToast(null), 2400);
	}, []);
	const attachGame = (0, import_react.useCallback)((level, nextSave = save) => {
		const canvas = canvasRef.current;
		const assets = assetsRef.current;
		if (!canvas || !assets) return;
		gameRef.current?.unmount();
		const g = new Game(canvas, assets, {
			onHud: setHud,
			onDialogue: (name, lines) => setDialogue({
				name,
				lines,
				i: 0
			}),
			onToast: showToast,
			onClue: (id, lv) => {
				const clues = nextSave.clues.includes(id) ? nextSave.clues : [...nextSave.clues, id];
				persist({
					clues,
					diamonds: g.diamonds,
					currentLevel: lv,
					maxLevel: Math.max(nextSave.maxLevel, lv)
				});
				showToast(`${CLUE_LABEL[id]} found. A portal opens.`);
			},
			onPortal: (lv) => {
				const nxt = Math.min(LEVEL_COUNT - 1, lv + 1);
				persist({
					currentLevel: nxt,
					maxLevel: Math.max(nextSave.maxLevel, nxt),
					diamonds: g.diamonds,
					letters: Array.from({ length: g.letters }, (_, i) => i)
				});
				setStoryIndex(nxt);
				setScreen("story");
				g.paused = true;
			},
			onWin: () => {
				persist({
					maxLevel: LEVEL_COUNT - 1,
					diamonds: g.diamonds,
					clues: [...CLUE_ORDER]
				});
				setScreen("ending");
				g.paused = true;
			}
		});
		g.audio.unlock();
		g.audio.setMusic(nextSave.settings.music);
		g.audio.setSfx(nextSave.settings.sfx);
		g.shakeOn = nextSave.settings.shake;
		g.mount();
		g.startLevel(level, nextSave.diamonds, nextSave.clues, nextSave.letters.length);
		gameRef.current = g;
	}, [
		persist,
		save,
		showToast
	]);
	const begin = (level) => {
		setStoryIndex(level);
		setScreen("story");
	};
	const enterPlay = () => {
		setScreen("play");
		requestAnimationFrame(() => attachGame(storyIndex));
	};
	(0, import_react.useEffect)(() => {
		const onVis = () => gameRef.current?.audio.resume();
		document.addEventListener("visibilitychange", onVis);
		return () => {
			document.removeEventListener("visibilitychange", onVis);
			gameRef.current?.unmount();
		};
	}, []);
	const g = gameRef.current;
	const muted = save.settings.music <= .02 && save.settings.sfx <= .02;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-ink text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none",
				style: { touchAction: "none" }
			}),
			screen === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-[0.2em] text-muted uppercase",
					children: "A storybook adventure"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl",
					children: "The Castle Quest"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-md text-base leading-relaxed text-ink-soft",
					children: "Guide Pip through ten gentle lands. Find each hidden clue. Nothing can hurt you. The castle waits."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "For young explorers, and for Mom."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex w-full max-w-sm flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
							onClick: () => ready && begin(0),
							children: ready ? "Begin the journey" : "Warming the storybook"
						}),
						save.maxLevel > 0 && ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
							onClick: () => begin(save.currentLevel),
							children: "Continue"
						}),
						save.maxLevel > 0 && ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
							onClick: () => persist(resetSave()),
							children: "New story"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-xs text-muted",
					children: "Move with WASD or arrows. Jump with W or Space. Talk with E."
				})
			] }),
			screen === "story" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-semibold tracking-[0.18em] text-muted uppercase",
					children: [
						"Chapter ",
						storyIndex + 1,
						" of ",
						LEVEL_COUNT
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-3xl text-ink",
					children: LEVEL_META[storyIndex]?.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-rose",
					children: LEVEL_META[storyIndex]?.subtitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 max-w-md text-base leading-relaxed text-ink-soft",
					children: LEVEL_META[storyIndex]?.story
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
						onClick: enterPlay,
						children: "Enter"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						onClick: () => setScreen("title"),
						children: "Back"
					})]
				})
			] }),
			screen === "ending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-[0.18em] text-muted uppercase",
					children: "The castle opens"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-3xl text-ink",
					children: "Home, at last"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 max-w-md text-base leading-relaxed text-ink-soft",
					children: "Ten clues rest in Pip’s satchel. The gates sigh apart. Inside there is warm light, a long table, and a place set for you. Thank you for walking the long way."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 max-w-md text-sm text-muted",
					children: [
						"Diamonds gathered: ",
						save.diamonds,
						". Letters found: ",
						save.letters.length,
						" of 10."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
						onClick: () => {
							setScreen("title");
						},
						children: "Return to the meadow"
					})
				})
			] }),
			screen === "play" && hud && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 pt-[max(12px,env(safe-area-inset-top))] sm:p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-auto flex items-center gap-2 rounded-2xl border border-line bg-surface/90 px-3 py-2 shadow-sm backdrop-blur-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, {
								className: "size-4 text-sky",
								strokeWidth: 2.2
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg tabular-nums text-ink",
								children: hud.diamonds
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none hidden min-w-0 flex-1 flex-col items-center sm:flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-line bg-surface/90 px-4 py-1.5 text-center shadow-sm backdrop-blur-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-base leading-tight text-ink",
									children: hud.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[0.7rem] text-muted",
									children: hud.subtitle
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-auto flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: "Hint",
									onClick: () => g?.useHint(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: "Journal",
									onClick: () => setJournal(true),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: "Pause",
									onClick: () => {
										if (g) {
											g.paused = true;
											setSettings(true);
										}
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute left-3 top-16 z-10 sm:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-line bg-surface/90 px-3 py-1 shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-sm text-ink",
							children: hud.name
						})
					})
				}),
				toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-28 left-1/2 z-20 w-[min(92%,24rem)] -translate-x-1/2 rounded-xl border border-line bg-surface px-4 py-3 text-center text-sm text-ink shadow-md sm:bottom-8",
					children: toast
				}),
				dialogue && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-x-0 bottom-0 z-30 p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "mx-auto block w-full max-w-xl rounded-2xl border border-line bg-surface px-5 py-4 text-left shadow-lg",
						onClick: () => {
							setDialogue((d) => {
								if (!d) return null;
								if (d.i + 1 >= d.lines.length) return null;
								return {
									...d,
									i: d.i + 1
								};
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold tracking-wide text-muted uppercase",
								children: dialogue.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-lg leading-snug text-ink",
								children: dialogue.lines[dialogue.i]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-muted",
								children: "Tap to continue"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchPad, {
					onLeft: (v) => {
						if (g) g.input.touchLeft = v;
					},
					onRight: (v) => {
						if (g) g.input.touchRight = v;
					},
					onJump: (v) => {
						if (g) g.input.touchJump = v;
					},
					onInteract: () => {
						if (g) {
							g.input.touchInteract = true;
							window.setTimeout(() => {
								if (gameRef.current) gameRef.current.input.touchInteract = false;
							}, 80);
						}
					},
					showTalk: Boolean(hud && g?.nearNpc)
				})
			] }),
			(journal || settings) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-40 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-xl sm:p-6",
					children: journal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-xl",
								children: "Clue journal"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 grid grid-cols-1 gap-2",
							children: CLUE_ORDER.map((id, i) => {
								const have = save.clues.includes(id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm text-ink",
										children: [
											i + 1,
											". ",
											have ? CLUE_LABEL[id] : "Still hidden"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: have ? "Found" : LEVEL_META[i]?.name
									})]
								}, id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-xs text-muted",
							children: [
								"Letters from home: ",
								save.letters.length,
								" / 10"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
								onClick: () => setJournal(false),
								children: "Close"
							})
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl text-ink",
							children: "Paused"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-5 block text-sm text-ink-soft",
							children: ["Music", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 1,
								step: .01,
								value: save.settings.music,
								className: "mt-1 w-full accent-meadow",
								onChange: (e) => {
									const music = Number(e.target.value);
									g?.audio.setMusic(music);
									persist({ settings: {
										...save.settings,
										music
									} });
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-4 block text-sm text-ink-soft",
							children: ["Sounds", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 1,
								step: .01,
								value: save.settings.sfx,
								className: "mt-1 w-full accent-meadow",
								onChange: (e) => {
									const sfx = Number(e.target.value);
									g?.audio.setSfx(sfx);
									persist({ settings: {
										...save.settings,
										sfx
									} });
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
								onClick: () => {
									if (g) g.paused = false;
									setSettings(false);
								},
								children: "Resume"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
								onClick: () => {
									setSettings(false);
									setScreen("title");
									g?.unmount();
								},
								children: "Title"
							})]
						})
					] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "absolute bottom-[max(12px,env(safe-area-inset-bottom))] right-3 z-20 hidden size-11 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-sm sm:flex",
				"aria-label": muted ? "Unmute" : "Mute",
				onClick: () => {
					const music = muted ? .55 : 0;
					const sfx = muted ? .85 : 0;
					g?.audio.setMusic(music);
					g?.audio.setSfx(sfx);
					persist({ settings: {
						...save.settings,
						music,
						sfx
					} });
				},
				children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
			})
		]
	});
}
function Panel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center bg-paper/85 p-5 backdrop-blur-[3px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-full max-w-lg rounded-3xl border border-line bg-surface px-6 py-8 shadow-lg sm:px-10 sm:py-10",
			children
		})
	});
}
function Primary({ children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "h-12 w-full rounded-xl bg-rose px-5 font-semibold text-paper transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-rose-deep active:scale-[0.98]",
		children
	});
}
function Secondary({ children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "h-12 w-full rounded-lg border border-line bg-surface-2 px-5 font-semibold text-ink transition-transform duration-150 hover:bg-paper-deep active:scale-[0.98]",
		children
	});
}
function Ghost({ children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "h-11 w-full rounded-lg px-5 text-sm font-semibold text-ink-soft",
		children
	});
}
function IconBtn({ children, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "flex size-11 items-center justify-center rounded-xl border border-line bg-surface/90 text-ink shadow-sm",
		children
	});
}
function TouchPad({ onLeft, onRight, onJump, onInteract, showTalk }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldBtn, {
				label: "Left",
				onHold: onLeft,
				children: "A"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldBtn, {
				label: "Right",
				onHold: onRight,
				children: "D"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [showTalk && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "h-14 min-w-14 rounded-full border border-line bg-surface px-4 font-semibold text-ink shadow-md",
				onPointerDown: onInteract,
				children: "Talk"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldBtn, {
				label: "Jump",
				onHold: onJump,
				wide: true,
				children: "Jump"
			})]
		})]
	});
}
function HoldBtn({ children, onHold, label, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		className: `h-14 rounded-2xl border border-line bg-surface/95 font-semibold text-ink shadow-md ${wide ? "min-w-24 px-5" : "min-w-14"}`,
		onPointerDown: (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			onHold(true);
		},
		onPointerUp: () => onHold(false),
		onPointerCancel: () => onHold(false),
		children
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
