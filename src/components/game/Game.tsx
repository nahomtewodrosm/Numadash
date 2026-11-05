"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type TouchEvent,
} from "react";
import { GameHud } from "@/components/game/GameHud";
import { GameOverlay, type SaveState } from "@/components/game/GameOverlay";
import { useBestScore } from "@/hooks/useBestScore";
import { useSoundSetting } from "@/hooks/useSoundSetting";
import { gameAudio } from "@/lib/game/audio";
import {
  createInitialHud,
  RunnerEngine,
} from "@/lib/game/engine";
import type {
  GameEvent,
  GameStatus,
  HudSnapshot,
  RunSummary,
} from "@/lib/game/types";
import type { SaveScoreResponse } from "@/types/score";
import { showToast } from "@/lib/ui-feedback";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
  loading: () => <CanvasLoading />,
});

const CALLSIGN_KEY = "numa-run:callsign";
const CALLSIGN_EVENT = "numa:callsign-changed";

function readStoredCallsign(): string {
  if (typeof window === "undefined") return "RUNNER";
  return window.localStorage.getItem(CALLSIGN_KEY) ?? "RUNNER";
}

function subscribeCallsign(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CALLSIGN_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CALLSIGN_EVENT, callback);
  };
}

const INTERACTIVE_TAGS = new Set([
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
  "A",
]);
const SCROLL_KEYS = new Set([
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

function playEventSound(event: GameEvent): void {
  switch (event) {
    case "start":
      gameAudio.start();
      break;
    case "jump":
      gameAudio.jump();
      break;
    case "lane":
      gameAudio.lane();
      break;
    case "shard":
      gameAudio.shard();
      break;
    case "crash":
      gameAudio.crash();
      break;
    default:
      break;
  }
}

export function Game() {
  const shellRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const inView = useRef(false);
  const invalidateCanvas = useRef<() => void>(() => {});
  const startedOnce = useRef(false);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";
  const { best, commitBest } = useBestScore();
  const { soundOn, toggleSound } = useSoundSetting();

  const [status, setStatus] = useState<GameStatus>("idle");
  const [hud, setHud] = useState<HudSnapshot>(createInitialHud);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [callsignDraft, setCallsignDraft] = useState<string | null>(null);
  const storedCallsign = useSyncExternalStore(
    subscribeCallsign,
    readStoredCallsign,
    () => "RUNNER",
  );
  const callsign = callsignDraft ?? storedCallsign;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const registerCanvasInvalidate = useCallback((invalidate: () => void) => {
    invalidateCanvas.current = invalidate;
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (document.fullscreenElement || !shellRef.current) return;
    try {
      await shellRef.current.requestFullscreen();
    } catch {
      // Fullscreen is optional; the game remains playable when unavailable.
    }
  }, []);

  const engine = useMemo(
    () =>
      new RunnerEngine({
        onHud: setHud,
        onGameOver: (run) => {
          const freshBest = commitBest(run.score);
          setIsNewBest(freshBest);
          setSummary(run);
          setSaveState({ status: "idle" });
          setStatus("over");
        },
        onEvent: playEventSound,
      }),
    [commitBest],
  );

  const startGame = useCallback(() => {
    gameAudio.unlock();
    inView.current = true;
    if (!startedOnce.current) {
      startedOnce.current = true;
      void enterFullscreen();
    }
    setSummary(null);
    setIsNewBest(false);
    setSaveState({ status: "idle" });
    engine.start();
    setStatus("running");
    invalidateCanvas.current();
  }, [engine, enterFullscreen]);

  const resumeGame = useCallback(() => {
    if (engine.resume()) {
      setStatus("running");
      invalidateCanvas.current();
    }
  }, [engine]);

  const togglePause = useCallback(() => {
    if (engine.pause()) {
      setStatus("paused");
      invalidateCanvas.current();
      return;
    }
    if (engine.resume()) {
      setStatus("running");
      invalidateCanvas.current();
    }
  }, [engine]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await enterFullscreen();
      }
    } catch {
      // Fullscreen can be blocked by browser policy; the game still works.
    }
  }, [enterFullscreen]);

  const showDashboard = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        showToast("Could not exit fullscreen. Use your device's fullscreen control.", "error");
        return;
      }
    }

    window.requestAnimationFrame(() => {
      document.getElementById("leaderboard")?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select")) {
      touchStart.current = null;
      return;
    }
    const touch = event.changedTouches[0];
    if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start || engine.status !== "running") return;

      const touch = event.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 36) return;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        engine.moveLane(deltaX < 0 ? -1 : 1);
      }
    },
    [engine],
  );

  const saveRun = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!summary) return;

      const name = callsign.trim().toUpperCase();
      if (name.length < 2) {
        setSaveState({
          status: "error",
          message: "Choose a callsign with at least 2 characters.",
        });
        return;
      }

      setSaveState({ status: "saving" });

      try {
        const response = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            score: summary.score,
            distance: summary.distance,
            shards: summary.shards,
            duration: summary.duration,
          }),
        });

        const data = (await response.json().catch(() => ({}))) as
          | SaveScoreResponse
          | {
              error?: string;
              fieldErrors?: Record<string, string[] | undefined>;
            };

        if (!response.ok) {
          const fieldError =
            "fieldErrors" in data ? data.fieldErrors?.name?.[0] : undefined;
          throw new Error(
            fieldError ||
              ("error" in data && data.error) ||
              "The run could not be saved.",
          );
        }

        const result = data as SaveScoreResponse;
        window.localStorage.setItem(CALLSIGN_KEY, result.entry.name);
        setCallsignDraft(result.entry.name);
        window.dispatchEvent(new Event(CALLSIGN_EVENT));
        setSaveState({
          status: "success",
          rank: result.rank,
          name: result.entry.name,
        });
        showToast(`Run saved for ${result.entry.name}.`, "success");
        window.dispatchEvent(new Event("numa:score-submitted"));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "The run could not be saved. Try again.";
        setSaveState({
          status: "error",
          message,
        });
        showToast(message, "error");
      }
    },
    [callsign, summary],
  );

  const updateCallsign = useCallback((value: string) => {
    const name = value.slice(0, 12);
    setCallsignDraft(name);
    window.localStorage.setItem(CALLSIGN_KEY, name);
    window.dispatchEvent(new Event(CALLSIGN_EVENT));
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && engine.status === "running") {
        engine.pause();
        setStatus("paused");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [engine]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = document.fullscreenElement === shellRef.current;
      setIsFullscreen(fullscreen);
      if (!fullscreen && engine.status === "running") {
        engine.pause();
        setStatus("paused");
        invalidateCanvas.current();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [engine]);

  useEffect(() => {
    if (status !== "running") return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const preventScroll = (event: Event) => event.preventDefault();

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [status]);

  useEffect(() => {
    const node = shellRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible =
          document.fullscreenElement === node ||
          (entry.isIntersecting && entry.intersectionRatio >= 0.2);
        inView.current = visible;

        if (!visible && engine.status === "running") {
          engine.pause();
          setStatus("paused");
        }
      },
      { threshold: [0.2, 0.5, 0.75] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [engine]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTextInput =
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT");

      if (isTextInput) return;

      const isInteractive = target && INTERACTIVE_TAGS.has(target.tagName);
      if (
        engine.status === "running" &&
        inView.current &&
        SCROLL_KEYS.has(event.code) &&
        !(event.code === "Space" && isInteractive)
      ) {
        event.preventDefault();
      }

      if (isInteractive) return;
      if (!inView.current) return;

      let handled = true;

      switch (event.code) {
        case "Space":
        case "ArrowUp":
        case "KeyW":
          if (engine.status === "idle" || engine.status === "over") {
            startGame();
          } else if (engine.status === "paused") {
            resumeGame();
          } else {
            engine.jump();
          }
          break;
        case "ArrowDown":
        case "KeyS":
          engine.setDucking(true);
          break;
        case "ArrowLeft":
        case "KeyA":
          if (!event.repeat) engine.moveLane(-1);
          break;
        case "ArrowRight":
        case "KeyD":
          if (!event.repeat) engine.moveLane(1);
          break;
        case "KeyP":
          togglePause();
          break;
        case "Escape":
          if (document.fullscreenElement) {
            void document.exitFullscreen();
          } else {
            togglePause();
          }
          break;
        case "KeyR":
          startGame();
          break;
        default:
          handled = false;
      }

      if (handled) event.preventDefault();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown" || event.code === "KeyS") {
        engine.setDucking(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [engine, resumeGame, startGame, togglePause]);

  return (
    <div className="relative">
      <div
        ref={shellRef}
        role="application"
        aria-label="NUMA RUN 3D. Use A and D or left and right arrows to change lanes, Space or W to jump, S or down arrow to duck, P to pause, and R to restart."
        tabIndex={0}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={clsx(
          "relative isolate overflow-hidden border border-line bg-[#080807] shadow-panel outline-none",
          isFullscreen
            ? "h-screen w-screen rounded-none border-0"
            : "h-[540px] rounded-[28px] sm:h-[590px] lg:h-[630px]",
          status === "running"
            ? "cursor-none touch-none [&_*]:cursor-none"
            : "",
        )}
      >
        <div className="absolute inset-0">
          <GameCanvas
            engine={engine}
            theme={theme}
            onInvalidateReady={registerCanvasInvalidate}
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black/30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.025] [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,#fff_3px)]"
        />

        <div className="pointer-events-none absolute inset-0 z-40">
          <span className="absolute top-0 left-0 size-12 rounded-tl-[28px] border-t-2 border-l-2 border-accent/60" />
          <span className="absolute top-0 right-0 size-12 rounded-tr-[28px] border-t-2 border-r-2 border-accent/40" />
          <span className="absolute bottom-0 left-0 size-12 rounded-bl-[28px] border-b-2 border-l-2 border-accent/30" />
          <span className="absolute right-0 bottom-0 size-12 rounded-br-[28px] border-r-2 border-b-2 border-accent/50" />
        </div>

        <GameHud
          hud={hud}
          best={best}
          status={status}
          isFullscreen={isFullscreen}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onTogglePause={togglePause}
          onFullscreen={toggleFullscreen}
          onMobileJump={() => {
            if (engine.status === "running") {
              engine.jump();
            } else if (engine.status === "idle" || engine.status === "over") {
              startGame();
            }
          }}
          onMobileDuckStart={() => engine.setDucking(true)}
          onMobileDuckEnd={() => engine.setDucking(false)}
        />

        <GameOverlay
          status={status}
          hud={hud}
          best={best}
          summary={summary}
          isNewBest={isNewBest}
          callsign={callsign}
          onCallsignChange={updateCallsign}
          saveState={saveState}
          onStart={startGame}
          onResume={resumeGame}
          onRestart={startGame}
          onShowDashboard={showDashboard}
          onSave={saveRun}
        />
      </div>

    </div>
  );
}

function CanvasLoading() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#080807]">
      <div className="text-center">
        <p className="font-mono text-[9px] tracking-[0.18em] text-[#f7f1e7]/60">
          INITIALIZING WEBGL WORLD
        </p>
      </div>
    </div>
  );
}
