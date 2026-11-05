import clsx from "clsx";
import type { ReactNode } from "react";

export function Keycap({
  children,
  wide = false,
  className,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <kbd
      className={clsx(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-[5px] border border-line-strong/80 bg-surface px-1.5 font-mono text-[9px] font-semibold tracking-[0.06em] text-ink-soft shadow-[inset_0_-2px_0_var(--line)]",
        wide && "min-w-12",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
