"use client";

import { useEffect, useRef, useState } from "react";
import type { ToastKind } from "@/lib/ui-feedback";

interface ToastMessage {
  message: string;
  kind: ToastKind;
}

export function AppFeedback() {
  const [activeLoads, setActiveLoads] = useState(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeout = useRef<number | null>(null);

  useEffect(() => {
    const startLoading = () => setActiveLoads((count) => count + 1);
    const endLoading = () => setActiveLoads((count) => Math.max(0, count - 1));
    const showMessage = (event: Event) => {
      const { detail } = event as CustomEvent<ToastMessage>;
      if (!detail?.message) return;

      setToast(detail);
      if (timeout.current !== null) window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(() => setToast(null), 4_000);
    };

    window.addEventListener("numa:loading-start", startLoading);
    window.addEventListener("numa:loading-end", endLoading);
    window.addEventListener("numa:toast", showMessage);

    return () => {
      window.removeEventListener("numa:loading-start", startLoading);
      window.removeEventListener("numa:loading-end", endLoading);
      window.removeEventListener("numa:toast", showMessage);
      if (timeout.current !== null) window.clearTimeout(timeout.current);
    };
  }, []);

  return (
    <>
      {activeLoads > 0 ? (
        <div
          role="progressbar"
          aria-label="Loading"
          className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-accent/15"
        >
          <span className="loading-line block h-full w-1/4 bg-accent" />
        </div>
      ) : null}
      {toast ? (
        <div
          role={toast.kind === "error" ? "alert" : "status"}
          aria-live={toast.kind === "error" ? "assertive" : "polite"}
          className={`fixed right-4 bottom-4 z-[100] flex max-w-sm items-center gap-3 rounded-2xl border bg-surface-raised px-4 py-3 text-sm text-ink shadow-panel ${
            toast.kind === "error"
              ? "border-red-500/40"
              : toast.kind === "success"
                ? "border-success/40"
                : "border-line"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
            className="ml-auto shrink-0 text-muted transition-colors hover:text-ink"
          >
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
