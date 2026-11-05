"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useBestScore } from "@/hooks/useBestScore";
import {
  formatBoardDate,
  formatDistance,
  formatScore,
  initialsFor,
} from "@/lib/format";
import { setGlobalLoading, showToast } from "@/lib/ui-feedback";
import type { ScoresResponse } from "@/types/score";

interface BoardState {
  scores: ScoresResponse["scores"];
  source: ScoresResponse["source"];
  configured: boolean;
  degraded: boolean;
  notice?: string;
}

const INITIAL_STATE: BoardState = {
  scores: [],
  source: "none",
  configured: false,
  degraded: false,
  notice: "Connecting to the score service.",
};

export function Leaderboard() {
  const [board, setBoard] = useState<BoardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);
  const { best } = useBestScore();

  const fetchScores = useCallback(async (signal?: AbortSignal) => {
    setGlobalLoading(true);
    try {
      const response = await fetch("/api/scores", {
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error("The score service did not respond.");
      }

      const data = (await response.json()) as ScoresResponse;
      setBoard({
        scores: data.scores,
        source: data.source,
        configured: data.configured,
        degraded: Boolean(data.degraded),
        notice: data.notice,
      });
      if (data.source === "database") setRetryToken(0);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      showToast(
        "The score service is offline. Global records are unavailable.",
        "error",
      );
      setBoard((previous) => ({
        scores: [],
        source: "none",
        configured: previous.configured,
        degraded: true,
        notice: "The score service is offline. Global records are unavailable.",
      }));
    } finally {
      setGlobalLoading(false);
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    void fetchScores();
  }, [fetchScores]);

  useEffect(() => {
    const controller = new AbortController();
    // The initial network fetch is the external-system sync. State updates
    // only happen after the request settles, never during this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchScores(controller.signal);

    return () => controller.abort();
  }, [fetchScores]);

  useEffect(() => {
    const refreshScores = () => refresh();

    window.addEventListener("numa:score-submitted", refreshScores);
    window.addEventListener("focus", refreshScores);

    return () => {
      window.removeEventListener("numa:score-submitted", refreshScores);
      window.removeEventListener("focus", refreshScores);
    };
  }, [refresh]);

  // Retry briefly so a cold database connection can settle without a manual click.
  useEffect(() => {
    if (
      loading ||
      !board.configured ||
      board.source === "database" ||
      retryToken >= 2
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRetryToken((value) => value + 1);
      setLoading(true);
      void fetchScores();
    }, 2_500);

    return () => window.clearTimeout(timer);
  }, [board.configured, board.source, loading, retryToken, fetchScores]);

  const topScore = board.scores[0]?.score ?? 0;

  return (
    <section
      id="leaderboard"
      className="relative overflow-hidden border-t border-line bg-paper-deep py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 size-[480px] rounded-full bg-accent/10 blur-[120px]"
      />
      <div className="container-page relative">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">
              Global records / top 8
            </p>
            <h2 className="display-tight mt-4 text-[clamp(2.8rem,6vw,5.6rem)]">
              HALL OF
              <br />
              <span className="text-accent">EXTINCTION.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted">
            Every saved run is validated, ranked and written to the database. Only
            records returned by the database appear here.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex flex-col gap-5">
            <div className="relative overflow-hidden rounded-[24px] border border-accent/30 bg-accent p-6 text-accent-ink shadow-[0_20px_60px_-28px_rgba(239,107,27,0.6)]">
              <div className="relative">
                <p className="font-mono text-[9px] tracking-[0.18em] text-accent-ink/60">
                  YOUR PERSONAL BEST
                </p>
                <p className="mt-4 font-mono text-[clamp(2.6rem,5vw,4rem)] font-semibold leading-none tracking-[-0.08em] tabular-nums">
                  {best > 0 ? formatScore(best) : "000000"}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-accent-ink/15 pt-4">
                  <p className="text-xs font-medium">
                    {best > 0
                      ? "Stored on this device"
                      : "Play a run to claim it"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-xs font-semibold">
                      {loading
                        ? "Connecting to board"
                        : board.source === "database"
                          ? "Database connected"
                          : board.degraded
                            ? "Database offline"
                            : "No records available"}
                    </p>
                    <p className="mt-0.5 font-mono text-[8px] tracking-[0.12em] text-muted">
                      {loading
                        ? "SYNCING RUNS"
                        : board.source === "database"
                          ? "LIVE PERSISTENCE"
                          : "GLOBAL RECORDS"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={loading}
                  aria-label="Refresh leaderboard"
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {loading ? "LOADING" : "REFRESH"}
                </button>
              </div>
              {board.notice ? (
                <p className="mt-4 rounded-xl bg-accent-soft px-3 py-2 text-[10px] leading-4 text-accent">
                  {board.notice}
                </p>
              ) : (
                <p className="mt-4 text-[11px] leading-5 text-muted">
                  Validated with Zod, rate-limited and sorted by score. Ties go
                  to the earliest run.
                </p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-panel">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
              <div>
                <p className="font-mono text-[9px] tracking-[0.18em] text-muted">
                  GLOBAL LEADERBOARD
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {loading
                    ? "Loading runs"
                    : board.source === "database"
                      ? "Verified runs"
                      : "Real records only"}
                </p>
              </div>
              <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[8px] tracking-[0.12em] text-muted">
                TOP {board.scores.length}
              </span>
            </div>

            <div className="grid grid-cols-[34px_1fr_78px] gap-3 border-b border-line/70 px-4 py-2.5 font-mono text-[8px] tracking-[0.15em] text-muted sm:grid-cols-[44px_1fr_105px_86px] sm:px-5">
              <span>RANK</span>
              <span>RUNNER</span>
              <span className="text-right">SCORE</span>
              <span className="hidden text-right sm:block">DISTANCE</span>
            </div>

            <div className="divide-y divide-line/70">
              {loading
                ? Array.from({ length: 8 }, (_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[34px_1fr_78px] gap-3 px-4 py-3 sm:grid-cols-[44px_1fr_105px_86px] sm:px-5"
                    >
                      <span className="h-3 w-5 animate-pulse self-center rounded bg-line/60" />
                      <span className="h-3 w-28 animate-pulse self-center rounded bg-line/60" />
                      <span className="ml-auto h-3 w-14 animate-pulse self-center rounded bg-line/60" />
                      <span className="ml-auto hidden h-3 w-12 animate-pulse self-center rounded bg-line/60 sm:block" />
                    </div>
                  ))
                : board.scores.length > 0
                  ? board.scores.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="group grid grid-cols-[34px_1fr_78px] items-center gap-3 px-4 py-3 transition-colors hover:bg-paper/60 sm:grid-cols-[44px_1fr_105px_86px] sm:px-5"
                    >
                      <span
                        className={`font-mono text-[11px] font-semibold tabular-nums ${
                          index < 3 ? "text-accent" : "text-muted"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold tracking-[0.02em]">
                            <span className="mr-2 font-mono text-[9px] text-muted">
                              {initialsFor(entry.name)}
                            </span>
                            {entry.name}
                          </p>
                          <p className="mt-0.5 font-mono text-[8px] tracking-[0.08em] text-muted sm:hidden">
                            {formatDistance(entry.distance)} ·{" "}
                            {formatBoardDate(entry.createdAt)}
                          </p>
                          <p className="mt-0.5 hidden font-mono text-[8px] tracking-[0.1em] text-muted sm:block">
                            {formatBoardDate(entry.createdAt)} ·{" "}
                            {entry.shards} SHARDS
                          </p>
                        </div>
                      </div>
                      <p className="text-right font-mono text-xs font-semibold tabular-nums">
                        {formatScore(entry.score)}
                      </p>
                      <p className="hidden text-right font-mono text-[10px] text-muted tabular-nums sm:block">
                        {formatDistance(entry.distance)}
                      </p>
                    </div>
                  ))
                  : (
                    <p className="px-5 py-10 text-center text-sm text-muted">
                      No verified runs yet.
                    </p>
                  )}
            </div>

            <div className="flex flex-col gap-2 border-t border-line px-4 py-3.5 text-[9px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="font-mono tracking-[0.1em]">
                {topScore > 0 ? `TOP SCORE ${formatScore(topScore)}` : "NO SCORES YET"}
              </span>
              <span className="font-mono tracking-[0.1em]">
                {board.source === "database"
                  ? "SOURCE / DATABASE"
                  : board.degraded
                    ? "SOURCE / UNAVAILABLE"
                    : "SOURCE / UNAVAILABLE"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
