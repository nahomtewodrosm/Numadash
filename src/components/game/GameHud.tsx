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
  onMobileJump: () => void;
  onMobileDuckStart: () => void;
  onMobileDuckEnd: () => void;
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
  onMobileJump,
  onMobileDuckStart,
  onMobileDuckEnd,
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
            className="rounded-full border border-line/70 bg-surface/82 px-2.5 py-2 font-mono text-[8px] tracking-[0.08em] text-ink-soft backdrop-blur-md transition-colors hover:border-accent hover:text-accent sm:px-3"
          >
            {soundOn ? "SOUND ON" : "SOUND OFF"}
          </button>
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={status === "paused" ? "Resume game" : "Pause game"}
            title={status === "paused" ? "Resume" : "Pause"}
            className="rounded-full border border-line/70 bg-surface/82 px-2.5 py-2 font-mono text-[8px] tracking-[0.08em] text-ink-soft backdrop-blur-md transition-colors hover:border-accent hover:text-accent sm:px-3"
          >
            {status === "paused" ? "RESUME" : "PAUSE"}
          </button>
          <button
            type="button"
            onClick={onFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="rounded-full border border-line/70 bg-surface/82 px-2.5 py-2 font-mono text-[8px] tracking-[0.08em] text-ink-soft backdrop-blur-md transition-colors hover:border-accent hover:text-accent sm:px-3"
          >
            {isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
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

      <div className="pointer-events-auto mt-3 grid grid-cols-2 gap-2 sm:hidden">
        <button
          type="button"
          aria-label="Duck"
          onPointerDown={onMobileDuckStart}
          onPointerUp={onMobileDuckEnd}
          onPointerLeave={onMobileDuckEnd}
          onPointerCancel={onMobileDuckEnd}
          className="h-11 rounded-xl border border-line/70 bg-surface/80 font-mono text-[10px] tracking-[0.1em] text-ink-soft backdrop-blur-md active:bg-accent active:text-accent-ink"
        >
          DUCK
        </button>
        <button
          type="button"
          aria-label="Jump"
          onClick={onMobileJump}
          className="h-11 rounded-xl bg-accent font-mono text-[10px] font-semibold tracking-[0.1em] text-accent-ink shadow-lg active:brightness-90"
        >
          JUMP
        </button>
        <p className="col-span-2 text-center font-mono text-[8px] tracking-[0.12em] text-muted">
          SWIPE LEFT / RIGHT TO CHANGE LANES
        </p>
      </div>
    </div>
  );
}
