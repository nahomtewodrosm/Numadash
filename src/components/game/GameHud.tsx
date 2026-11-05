"use client";

import { Keycap } from "@/components/game/Keycap";
import { padScore } from "@/lib/format";
import type { GameStatus, HudSnapshot } from "@/lib/game/types";

interface GameHudProps {
  hud: HudSnapshot;
  best: number;
  status: GameStatus;
  isFullscreen: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onFullscreen: () => void;
}

const STATUS_COPY: Record<GameStatus, string> = {
  idle: "STANDBY",
  running: "LIVE RUN",
  paused: "PAUSED",
  over: "RUN ENDED",
};

export function GameHud({
  hud,
  best,
  status,
  isFullscreen,
  soundOn,
  onToggleSound,
  onTogglePause,
  onFullscreen,
}: GameHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3.5 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-line/70 bg-surface/82 px-3 py-1.5 font-mono text-[9px] tracking-[0.16em] text-ink-soft backdrop-blur-md">
            {STATUS_COPY[status]}
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-line/70 bg-surface/82 px-3 py-1.5 font-mono text-[9px] tracking-[0.12em] text-muted backdrop-blur-md sm:inline-flex">
            SECTOR 07 <span className="text-accent">/</span> THREE-LANE
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundOn ? "Mute game audio" : "Enable game audio"}
            title={soundOn ? "Mute audio" : "Enable audio"}
            className="rounded-full border border-line/70 bg-surface/82 px-2 py-2 font-mono text-[8px] tracking-[0.08em] text-ink-soft backdrop-blur-md transition-colors hover:border-accent hover:text-accent sm:px-3"
          >
            <span className="sm:hidden">{soundOn ? "SND ON" : "SND OFF"}</span>
            <span className="hidden sm:inline">
              {soundOn ? "SOUND ON" : "SOUND OFF"}
            </span>
          </button>
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={status === "paused" ? "Resume game" : "Pause game"}
            title={status === "paused" ? "Resume" : "Pause"}
            className="rounded-full border border-line/70 bg-surface/82 px-2 py-2 font-mono text-[8px] tracking-[0.08em] text-ink-soft backdrop-blur-md transition-colors hover:border-accent hover:text-accent sm:px-3"
          >
            <span className="sm:hidden">{status === "paused" ? "PLAY" : "PAUSE"}</span>
            <span className="hidden sm:inline">
              {status === "paused" ? "RESUME" : "PAUSE"}
            </span>
          </button>
          <button
            type="button"
            onClick={onFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="grid size-9 place-items-center rounded-full border border-line/70 bg-surface/82 text-ink-soft backdrop-blur-md transition-colors hover:border-accent hover:text-accent sm:h-auto sm:w-auto sm:px-3 sm:py-2"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="size-4"
            >
              {isFullscreen ? (
                <path
                  d="M7 3v4H3m14 0h-4V3M3 13h4v4m10-4h-4v4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M3 7V3h4m6 0h4v4M17 13v4h-4m-6 0H3v-4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            <span className="sr-only">
              {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            </span>
            <span className="ml-1 hidden font-mono text-[8px] tracking-[0.08em] sm:inline">
              {isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted">
            SCORE
          </p>
          <p className="mt-0.5 font-mono text-[clamp(2.1rem,5.6vw,3.6rem)] font-semibold leading-none tracking-[-0.08em] text-ink tabular-nums">
            {padScore(hud.score)}
          </p>
        </div>

        <div className="flex items-end gap-2.5 sm:gap-4">
          <div className="text-right">
            <p className="font-mono text-[8px] tracking-[0.18em] text-muted">
              SPEED
            </p>
            <p className="mt-1 flex items-center justify-end gap-1 font-mono text-xs font-semibold text-ink-soft tabular-nums">
              {String(hud.speed).padStart(3, "0")}
              <span className="text-[8px] text-muted">KM/H</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[8px] tracking-[0.18em] text-muted">
              SHARDS
            </p>
            <p className="mt-1 flex items-center justify-end gap-1 font-mono text-xs font-semibold text-ink-soft tabular-nums">
              {String(hud.shards).padStart(2, "0")}
            </p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="font-mono text-[8px] tracking-[0.18em] text-muted">
              BEST
            </p>
            <p className="mt-1 font-mono text-xs font-semibold text-ink-soft tabular-nums">
              {padScore(best)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="hidden flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex">
          <span className="flex items-center gap-1.5 text-[10px] text-muted">
            <Keycap>A</Keycap>
            <Keycap>D</Keycap>
            <span>strafe</span>
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-muted">
            <Keycap wide>SPACE</Keycap>
            <span>jump</span>
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-muted">
            <Keycap>S</Keycap>
            <span>duck</span>
          </span>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="font-mono text-[8px] tracking-[0.18em] text-muted">
            LANE
          </span>
          <span className="font-mono text-[8px] tracking-[0.1em] text-ink-soft">
            {hud.lane === -1 ? "LEFT" : hud.lane === 1 ? "RIGHT" : "CENTER"}
          </span>
        </div>
      </div>

      <div className="pointer-events-none mt-3 sm:hidden">
        <p className="text-center font-mono text-[8px] leading-5 tracking-[0.1em] text-muted">
          SWIPE ← / → LANES <span className="text-accent">·</span> ↑ JUMP{" "}
          <span className="text-accent">·</span> ↓ DUCK
        </p>
      </div>
    </div>
  );
}
