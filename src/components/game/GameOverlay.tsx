"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FormEvent } from "react";
import { Keycap } from "@/components/game/Keycap";
import { formatDuration, formatScore, padScore } from "@/lib/format";
import type { GameStatus, HudSnapshot, RunSummary } from "@/lib/game/types";

export type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "success"; rank: number; name: string }
  | { status: "error"; message: string };

interface GameOverlayProps {
  status: GameStatus;
  hud: HudSnapshot;
  best: number;
  summary: RunSummary | null;
  isNewBest: boolean;
  callsign: string;
  onCallsignChange: (value: string) => void;
  saveState: SaveState;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onShowDashboard: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}

export function GameOverlay({
  status,
  hud,
  best,
  summary,
  isNewBest,
  callsign,
  onCallsignChange,
  saveState,
  onStart,
  onResume,
  onRestart,
  onShowDashboard,
  onSave,
}: GameOverlayProps) {
  return (
    <AnimatePresence mode="wait">
      {status === "idle" ? (
        <OverlayFrame key="idle" tone="idle">
          <div className="text-center">
            <div className="mx-auto mb-4 w-fit rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 font-mono text-[9px] tracking-[0.18em] text-accent">
              MESOZOIC SIMULATION READY
            </div>
            <h2 className="display-tight text-4xl sm:text-5xl">
              THE PAST IS
              <br />
              <span className="text-accent">CHASING.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-ink-soft">
              Three lanes. One T-Rex. Duck the pterodactyls, clear the cacti
              and collect every orange shard you can.
            </p>
            <button type="button" onClick={onStart} className="primary-button mt-6">
              Start running
            </button>
            <p className="mt-3 font-mono text-[9px] tracking-[0.15em] text-muted">
              OR PRESS <span className="text-ink-soft">SPACE</span>
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-line/70 pt-5 text-[10px] text-muted">
              <span className="flex items-center gap-1.5">
                <Keycap>A</Keycap>
                <Keycap>D</Keycap>
                strafe
              </span>
              <span className="flex items-center gap-1.5">
                <Keycap wide>SPACE</Keycap>
                jump
              </span>
              <span className="flex items-center gap-1.5">
                <Keycap>S</Keycap>
                duck
              </span>
              <span className="flex items-center gap-1.5">
                <Keycap>P</Keycap>
                pause
              </span>
            </div>
          </div>
        </OverlayFrame>
      ) : null}

      {status === "paused" ? (
        <OverlayFrame key="paused" tone="paused">
          <div className="text-center">
            <p className="eyebrow justify-center text-accent">SIGNAL HELD</p>
            <h2 className="display-tight mt-3 text-4xl sm:text-5xl">
              HOLD THE
              <br />
              <span className="text-accent">LINE.</span>
            </h2>
            <p className="mt-3 text-sm text-ink-soft">
              The asteroid can wait. Your run is still alive.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <button type="button" onClick={onResume} className="primary-button">
                Resume
              </button>
              <button type="button" onClick={onRestart} className="secondary-button">
                Restart
              </button>
            </div>
            <p className="mt-4 font-mono text-[9px] tracking-[0.15em] text-muted">
              P / ESC TO RESUME
            </p>
          </div>
        </OverlayFrame>
      ) : null}

      {status === "over" && summary ? (
        <OverlayFrame key="over" tone="over">
          <div className="w-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-accent">
                  RUN TERMINATED
                </p>
                <h2 className="display-tight mt-2 text-3xl sm:text-4xl">
                  EXTINCTION
                  <br />
                  WINS THIS ROUND.
                </h2>
              </div>
              {isNewBest ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 font-mono text-[8px] font-semibold tracking-[0.1em] text-accent-ink">
                  NEW BEST
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-end justify-between gap-4 border-y border-line/70 py-4">
              <div>
                <p className="font-mono text-[8px] tracking-[0.18em] text-muted">
                  FINAL SCORE
                </p>
                <p className="font-mono text-4xl font-semibold tracking-[-0.07em] text-ink tabular-nums sm:text-5xl">
                  {formatScore(summary.score)}
                </p>
              </div>
              <p className="pb-1 text-right font-mono text-[9px] leading-5 tracking-[0.12em] text-muted">
                BEST
                <br />
                <span className="text-ink-soft">{padScore(best)}</span>
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat label="DISTANCE" value={`${summary.distance} M`} />
              <Stat label="TIME" value={formatDuration(summary.duration)} />
              <Stat
                label="SHARDS"
                value={String(summary.shards).padStart(2, "0")}
              />
            </div>

            <div className="mt-4">
              {saveState.status === "success" ? (
                <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">
                      Run saved to the global board.
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] tracking-[0.1em] text-muted">
                      {saveState.name} · GLOBAL RANK #{saveState.rank}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSave}>
                  <label
                    htmlFor="callsign"
                    className="font-mono text-[9px] tracking-[0.16em] text-muted uppercase"
                  >
                    Claim this run
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="callsign"
                      name="callsign"
                      value={callsign}
                      onChange={(event) =>
                        onCallsignChange(event.target.value.slice(0, 12))
                      }
                      placeholder="YOUR CALLSIGN"
                      autoComplete="nickname"
                      spellCheck={false}
                      maxLength={12}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-raised px-3 font-mono text-xs font-semibold tracking-[0.1em] text-ink uppercase placeholder:text-muted/60 focus:border-accent focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={saveState.status === "saving"}
                      className="primary-button h-11 shrink-0 px-4 disabled:cursor-wait disabled:opacity-70"
                    >
                      {saveState.status === "saving" ? "Saving..." : "Save run"}
                    </button>
                  </div>
                  {saveState.status === "error" ? (
                    <p className="mt-2 text-[10px] leading-4 text-red-500">
                      {saveState.message}
                    </p>
                  ) : null}
                </form>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
              <button type="button" onClick={onRestart} className="primary-button">
                Run again
              </button>
              <button
                type="button"
                onClick={onShowDashboard}
                className="secondary-button"
              >
                Show dashboard
              </button>
            </div>
            <p className="mt-3 font-mono text-[8px] tracking-[0.12em] text-muted">
              CURRENT RUN · {hud.score === summary.score ? "VERIFIED" : "FINAL"}{" "}
              · {formatDuration(summary.duration)} / {summary.distance} M
            </p>
          </div>
        </OverlayFrame>
      ) : null}
    </AnimatePresence>
  );
}

function OverlayFrame({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "idle" | "paused" | "over";
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`absolute inset-0 z-30 flex items-center justify-center overflow-y-auto p-4 sm:p-6 ${
        tone === "idle"
          ? "bg-paper/35 backdrop-blur-[2px]"
          : "bg-paper/65 backdrop-blur-[3px]"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.99 }}
        transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
        className={`glass-panel w-full rounded-3xl p-5 shadow-panel sm:p-6 ${
          tone === "over" ? "max-w-lg" : "max-w-md"
        }`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line/70 bg-surface/60 p-2.5">
      <p className="font-mono text-[8px] tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold text-ink tabular-nums">
        {value}
      </p>
    </div>
  );
}
