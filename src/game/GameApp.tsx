import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BookOpen, Gem, Map as MapIcon, Pause, Sparkles, Volume2, VolumeX } from "lucide-react";
import { loadAssets, type GameAssets } from "./assets";
import { Game, type HudSnap } from "./engine";
import { LEVEL_COUNT, LEVEL_META } from "./levels";
import { loadSave, resetSave, writeSave } from "./save";
import { CLUE_LABEL, CLUE_ORDER } from "./types";

type Screen = "title" | "story" | "play" | "ending";

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const assetsRef = useRef<GameAssets | null>(null);
  const [screen, setScreen] = useState<Screen>("title");
  const [ready, setReady] = useState(false);
  const [hud, setHud] = useState<HudSnap | null>(null);
  const [dialogue, setDialogue] = useState<{ name: string; lines: string[]; i: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [journal, setJournal] = useState(false);
  const [settings, setSettings] = useState(false);
  const [save, setSave] = useState(() => (typeof window === "undefined" ? loadSave() : loadSave()));
  const [storyIndex, setStoryIndex] = useState(0);
  const toastTimer = useRef<number>(0);

  const persist = useCallback((patch: Partial<typeof save>) => {
    setSave((s) => {
      const next = { ...s, ...patch, settings: { ...s.settings, ...(patch.settings ?? {}) } };
      writeSave(next);
      return next;
    });
  }, []);

  useEffect(() => {
    let live = true;
    loadAssets()
      .then((a) => {
        if (!live) return;
        assetsRef.current = a;
        setReady(true);
      })
      .catch(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const attachGame = useCallback(
    (level: number, nextSave = save) => {
      const canvas = canvasRef.current;
      const assets = assetsRef.current;
      if (!canvas || !assets) return;
      gameRef.current?.unmount();
      const g = new Game(canvas, assets, {
        onHud: setHud,
        onDialogue: (name, lines) => setDialogue({ name, lines, i: 0 }),
        onToast: showToast,
        onClue: (id, lv) => {
          const clues = nextSave.clues.includes(id) ? nextSave.clues : [...nextSave.clues, id];
          persist({ clues, diamonds: g.diamonds, currentLevel: lv, maxLevel: Math.max(nextSave.maxLevel, lv) });
          showToast(`${CLUE_LABEL[id]} found. A portal opens.`);
        },
        onPortal: (lv) => {
          const nxt = Math.min(LEVEL_COUNT - 1, lv + 1);
          persist({
            currentLevel: nxt,
            maxLevel: Math.max(nextSave.maxLevel, nxt),
            diamonds: g.diamonds,
            letters: Array.from({ length: g.letters }, (_, i) => i),
          });
          setStoryIndex(nxt);
          setScreen("story");
          g.paused = true;
        },
        onWin: () => {
          persist({ maxLevel: LEVEL_COUNT - 1, diamonds: g.diamonds, clues: [...CLUE_ORDER] });
          setScreen("ending");
          g.paused = true;
        },
      });
      g.audio.unlock();
      g.audio.setMusic(nextSave.settings.music);
      g.audio.setSfx(nextSave.settings.sfx);
      g.shakeOn = nextSave.settings.shake;
      g.mount();
      g.startLevel(level, nextSave.diamonds, nextSave.clues, nextSave.letters.length);
      gameRef.current = g;
    },
    [persist, save, showToast],
  );

  const begin = (level: number) => {
    setStoryIndex(level);
    setScreen("story");
  };

  const enterPlay = () => {
    setScreen("play");
    requestAnimationFrame(() => attachGame(storyIndex));
  };

  useEffect(() => {
    const onVis = () => gameRef.current?.audio.resume();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      gameRef.current?.unmount();
    };
  }, []);

  const g = gameRef.current;
  const muted = save.settings.music <= 0.02 && save.settings.sfx <= 0.02;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-ink text-ink">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" style={{ touchAction: "none" }} />

      {screen === "title" && (
        <Panel>
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">A storybook adventure</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">The Castle Quest</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            Guide Pip through ten gentle lands. Find each hidden clue. Nothing can hurt you. The castle waits.
          </p>
          <p className="mt-2 text-sm text-muted">For young explorers, and for Mom.</p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <Primary onClick={() => ready && begin(0)}>{ready ? "Begin the journey" : "Warming the storybook"}</Primary>
            {save.maxLevel > 0 && ready && (
              <Secondary onClick={() => begin(save.currentLevel)}>Continue</Secondary>
            )}
            {save.maxLevel > 0 && ready && (
              <Ghost onClick={() => persist(resetSave())}>New story</Ghost>
            )}
          </div>
          <p className="mt-8 text-xs text-muted">Move with WASD or arrows. Jump with W or Space. Talk with E.</p>
        </Panel>
      )}

      {screen === "story" && (
        <Panel>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            Chapter {storyIndex + 1} of {LEVEL_COUNT}
          </p>
          <h2 className="mt-3 font-display text-3xl text-ink">{LEVEL_META[storyIndex]?.name}</h2>
          <p className="mt-1 text-sm text-rose">{LEVEL_META[storyIndex]?.subtitle}</p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">{LEVEL_META[storyIndex]?.story}</p>
          <div className="mt-8 flex gap-3">
            <Primary onClick={enterPlay}>Enter</Primary>
            <Ghost onClick={() => setScreen("title")}>Back</Ghost>
          </div>
        </Panel>
      )}

      {screen === "ending" && (
        <Panel>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">The castle opens</p>
          <h2 className="mt-3 font-display text-3xl text-ink">Home, at last</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
            Ten clues rest in Pip’s satchel. The gates sigh apart. Inside there is warm light, a long table, and a
            place set for you. Thank you for walking the long way.
          </p>
          <p className="mt-3 max-w-md text-sm text-muted">
            Diamonds gathered: {save.diamonds}. Letters found: {save.letters.length} of 10.
          </p>
          <div className="mt-8">
            <Primary
              onClick={() => {
                setScreen("title");
              }}
            >
              Return to the meadow
            </Primary>
          </div>
        </Panel>
      )}

      {screen === "play" && hud && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 pt-[max(12px,env(safe-area-inset-top))] sm:p-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-line bg-surface/90 px-3 py-2 shadow-sm backdrop-blur-sm">
              <Gem className="size-4 text-sky" strokeWidth={2.2} />
              <span className="font-display text-lg tabular-nums text-ink">{hud.diamonds}</span>
            </div>
            <div className="pointer-events-none hidden min-w-0 flex-1 flex-col items-center sm:flex">
              <div className="rounded-2xl border border-line bg-surface/90 px-4 py-1.5 text-center shadow-sm backdrop-blur-sm">
                <p className="font-display text-base leading-tight text-ink">{hud.name}</p>
                <p className="text-[0.7rem] text-muted">{hud.subtitle}</p>
              </div>
            </div>
            <div className="pointer-events-auto flex gap-2">
              <IconBtn label="Hint" onClick={() => g?.useHint()}>
                <Sparkles className="size-4" />
              </IconBtn>
              <IconBtn label="Journal" onClick={() => setJournal(true)}>
                <BookOpen className="size-4" />
              </IconBtn>
              <IconBtn label="Pause" onClick={() => { if (g) { g.paused = true; setSettings(true); } }}>
                <Pause className="size-4" />
              </IconBtn>
            </div>
          </div>

          <div className="pointer-events-none absolute left-3 top-16 z-10 sm:hidden">
            <div className="rounded-xl border border-line bg-surface/90 px-3 py-1 shadow-sm">
              <p className="font-display text-sm text-ink">{hud.name}</p>
            </div>
          </div>

          {toast && (
            <div className="absolute bottom-28 left-1/2 z-20 w-[min(92%,24rem)] -translate-x-1/2 rounded-xl border border-line bg-surface px-4 py-3 text-center text-sm text-ink shadow-md sm:bottom-8">
              {toast}
            </div>
          )}

          {dialogue && (
            <div className="absolute inset-x-0 bottom-0 z-30 p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:p-6">
              <button
                type="button"
                className="mx-auto block w-full max-w-xl rounded-2xl border border-line bg-surface px-5 py-4 text-left shadow-lg"
                onClick={() => {
                  setDialogue((d) => {
                    if (!d) return null;
                    if (d.i + 1 >= d.lines.length) return null;
                    return { ...d, i: d.i + 1 };
                  });
                }}
              >
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">{dialogue.name}</p>
                <p className="mt-2 font-display text-lg leading-snug text-ink">{dialogue.lines[dialogue.i]}</p>
                <p className="mt-3 text-xs text-muted">Tap to continue</p>
              </button>
            </div>
          )}

          <TouchPad
            onLeft={(v) => {
              if (g) g.input.touchLeft = v;
            }}
            onRight={(v) => {
              if (g) g.input.touchRight = v;
            }}
            onJump={(v) => {
              if (g) g.input.touchJump = v;
            }}
            onInteract={() => {
              if (g) {
                g.input.touchInteract = true;
                window.setTimeout(() => {
                  if (gameRef.current) gameRef.current.input.touchInteract = false;
                }, 80);
              }
            }}
            showTalk={Boolean(hud && g?.nearNpc)}
          />
        </>
      )}

      {(journal || settings) && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-xl sm:p-6">
            {journal ? (
              <>
                <div className="flex items-center gap-2 text-ink">
                  <MapIcon className="size-4" />
                  <h3 className="font-display text-xl">Clue journal</h3>
                </div>
                <ul className="mt-4 grid grid-cols-1 gap-2">
                  {CLUE_ORDER.map((id, i) => {
                    const have = save.clues.includes(id);
                    return (
                      <li
                        key={id}
                        className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3 py-2"
                      >
                        <span className="text-sm text-ink">
                          {i + 1}. {have ? CLUE_LABEL[id] : "Still hidden"}
                        </span>
                        <span className="text-xs text-muted">{have ? "Found" : LEVEL_META[i]?.name}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 text-xs text-muted">Letters from home: {save.letters.length} / 10</p>
                <div className="mt-5">
                  <Secondary onClick={() => setJournal(false)}>Close</Secondary>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-display text-xl text-ink">Paused</h3>
                <label className="mt-5 block text-sm text-ink-soft">
                  Music
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={save.settings.music}
                    className="mt-1 w-full accent-meadow"
                    onChange={(e) => {
                      const music = Number(e.target.value);
                      g?.audio.setMusic(music);
                      persist({ settings: { ...save.settings, music } });
                    }}
                  />
                </label>
                <label className="mt-4 block text-sm text-ink-soft">
                  Sounds
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={save.settings.sfx}
                    className="mt-1 w-full accent-meadow"
                    onChange={(e) => {
                      const sfx = Number(e.target.value);
                      g?.audio.setSfx(sfx);
                      persist({ settings: { ...save.settings, sfx } });
                    }}
                  />
                </label>
                <div className="mt-6 flex flex-col gap-2">
                  <Primary
                    onClick={() => {
                      if (g) g.paused = false;
                      setSettings(false);
                    }}
                  >
                    Resume
                  </Primary>
                  <Secondary
                    onClick={() => {
                      setSettings(false);
                      setScreen("title");
                      g?.unmount();
                    }}
                  >
                    Title
                  </Secondary>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className="absolute bottom-[max(12px,env(safe-area-inset-bottom))] right-3 z-20 hidden size-11 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-sm sm:flex"
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={() => {
          const music = muted ? 0.55 : 0;
          const sfx = muted ? 0.85 : 0;
          g?.audio.setMusic(music);
          g?.audio.setSfx(sfx);
          persist({ settings: { ...save.settings, music, sfx } });
        }}
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-paper/85 p-5 backdrop-blur-[3px]">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-surface px-6 py-8 shadow-lg sm:px-10 sm:py-10">
        {children}
      </div>
    </div>
  );
}

function Primary({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 w-full rounded-xl bg-rose px-5 font-semibold text-paper transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-rose-deep active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function Secondary({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 w-full rounded-lg border border-line bg-surface-2 px-5 font-semibold text-ink transition-transform duration-150 hover:bg-paper-deep active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function Ghost({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-11 w-full rounded-lg px-5 text-sm font-semibold text-ink-soft">
      {children}
    </button>
  );
}

function IconBtn({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface/90 text-ink shadow-sm"
    >
      {children}
    </button>
  );
}

function TouchPad({
  onLeft,
  onRight,
  onJump,
  onInteract,
  showTalk,
}: {
  onLeft: (v: boolean) => void;
  onRight: (v: boolean) => void;
  onJump: (v: boolean) => void;
  onInteract: () => void;
  showTalk: boolean;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:hidden">
      <div className="flex gap-2">
        <HoldBtn label="Left" onHold={onLeft}>
          A
        </HoldBtn>
        <HoldBtn label="Right" onHold={onRight}>
          D
        </HoldBtn>
      </div>
      <div className="flex gap-2">
        {showTalk && (
          <button
            type="button"
            className="h-14 min-w-14 rounded-full border border-line bg-surface px-4 font-semibold text-ink shadow-md"
            onPointerDown={onInteract}
          >
            Talk
          </button>
        )}
        <HoldBtn label="Jump" onHold={onJump} wide>
          Jump
        </HoldBtn>
      </div>
    </div>
  );
}

function HoldBtn({
  children,
  onHold,
  label,
  wide,
}: {
  children: ReactNode;
  onHold: (v: boolean) => void;
  label: string;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`h-14 rounded-2xl border border-line bg-surface/95 font-semibold text-ink shadow-md ${wide ? "min-w-24 px-5" : "min-w-14"}`}
      onPointerDown={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
    >
      {children}
    </button>
  );
}