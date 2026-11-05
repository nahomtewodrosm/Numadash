"use client";

import { useCallback, useSyncExternalStore } from "react";

const BEST_KEY = "numa-run:best";
const BEST_EVENT = "numa:new-best";

function readStoredBest(): number {
  if (typeof window === "undefined") return 0;
  const value = Number(window.localStorage.getItem(BEST_KEY));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(BEST_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(BEST_EVENT, callback);
  };
}

export function useBestScore() {
  const best = useSyncExternalStore(subscribe, readStoredBest, () => 0);

  const commitBest = useCallback((score: number): boolean => {
    if (typeof window === "undefined") return false;

    const stored = readStoredBest();
    const isNewBest = score > stored;

    if (isNewBest) {
      window.localStorage.setItem(BEST_KEY, String(Math.floor(score)));
      window.dispatchEvent(new Event(BEST_EVENT));
    }

    return isNewBest;
  }, []);

  return { best, commitBest };
}
