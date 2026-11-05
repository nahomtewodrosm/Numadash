import { Game } from "@/components/game/Game";

export function GameSection() {
  return (
    <section
      id="game"
      className="relative overflow-hidden border-b border-line bg-paper-deep py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="container-page relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h2 className="display-tight text-[clamp(2.8rem,6vw,5.4rem)]">
              THE RUN
              <br />
              <span className="text-accent">STARTS HERE.</span>
            </h2>
          </div>

        </div>

        <div id="game-console" className="mt-10 scroll-mt-24">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="font-mono text-[9px] tracking-[0.16em] text-muted">
              LIVE WEBGL RUN
            </span>
            <span className="font-mono text-[9px] tracking-[0.12em] text-muted">
              BUILD 01 / ARCADE
            </span>
          </div>

          <Game />

        </div>
      </div>
    </section>
  );
}
