"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_LINKS = [
  { href: "#game", label: "Play" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "#how-to", label: "How to play" },
  { href: "#stack", label: "The stack" },
  { href: "#projects", label: "Projects" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/85 backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link
          href="#top"
          className="group flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="font-display text-[17px] font-bold tracking-[-0.04em]">
            NUMA<span className="text-accent"> RUN</span>
          </span>
          <span className="hidden rounded-full border border-line px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] text-muted sm:inline-block">
            V1.0
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full border border-line text-ink md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="font-mono text-[9px] tracking-[0.1em]">
              {open ? "CLOSE" : "MENU"}
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-paper px-5 py-4 md:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-line/70 py-3.5 text-sm font-medium last:border-0"
              >
                {link.label}
                <span className="font-mono text-[9px] tracking-[0.14em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
