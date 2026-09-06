export type Actions = {
  moveX: number;
  jump: boolean;
  jumpHeld: boolean;
  down: boolean;
  interact: boolean;
  pause: boolean;
};

const GAME_CODES = new Set([
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
  "KeyH",
]);

export class Input {
  keys = new Set<string>();
  injected: Set<string> | null = null;
  prevJump = false;
  prevInteract = false;
  prevPause = false;
  touchLeft = false;
  touchRight = false;
  touchJump = false;
  touchInteract = false;
  private unsubs: Array<() => void> = [];

  attach() {
    const onDown = (e: KeyboardEvent) => {
      if (GAME_CODES.has(e.code)) e.preventDefault();
      this.keys.add(e.code);
    };
    const onUp = (e: KeyboardEvent) => {
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

  setKeys(codes: string[]) {
    this.injected = new Set(codes);
  }

  poll(): Actions {
    const src = this.injected ?? this.keys;
    let moveX = 0;
    if (src.has("KeyA") || src.has("ArrowLeft") || this.touchLeft) moveX -= 1;
    if (src.has("KeyD") || src.has("ArrowRight") || this.touchRight) moveX += 1;

    const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : [];
    if (pads) {
      for (const p of pads) {
        if (!p || p.mapping !== "standard") continue;
        const ax = p.axes[0] ?? 0;
        const mag = Math.abs(ax);
        if (mag > 0.18) {
          const scaled = ((mag - 0.18) / 0.82) * Math.sign(ax);
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
    }

    moveX = Math.max(-1, Math.min(1, moveX));
    const jumpHeld =
      src.has("KeyW") ||
      src.has("ArrowUp") ||
      src.has("Space") ||
      src.has("__padJump") ||
      this.touchJump;
    const interactHeld = src.has("KeyE") || src.has("KeyF") || src.has("__padInteract") || this.touchInteract;
    const pauseHeld = src.has("Escape") || src.has("KeyP") || src.has("__padPause");
    const down = src.has("KeyS") || src.has("ArrowDown") || src.has("__padDown");

    const jump = jumpHeld && !this.prevJump;
    const interact = interactHeld && !this.prevInteract;
    const pause = pauseHeld && !this.prevPause;
    this.prevJump = jumpHeld;
    this.prevInteract = interactHeld;
    this.prevPause = pauseHeld;

    return { moveX, jump, jumpHeld, down, interact, pause };
  }
}
