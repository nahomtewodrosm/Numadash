const HERO_STATS = [
  { value: "03", label: "LANES", detail: "Strafe or perish" },
  { value: "∞", label: "RUNS", detail: "No finish line" },
  { value: "60", label: "FPS TARGET", detail: "Real-time WebGL" },
];

const BRIEF = [
  { label: "COURSE", value: "Endless" },
  { label: "TOP SPEED", value: "137 km/h" },
  { label: "BOARD", value: "Database" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 line-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_78%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-52 right-[4%] size-[720px] rounded-full bg-accent/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-28 -left-44 size-[440px] rounded-full border border-accent/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 -left-32 size-[320px] rounded-full border border-line/50"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 left-[14%] hidden font-mono text-[12rem] font-bold tracking-[-0.12em] text-line/25 lg:block"
      >
        3D
      </span>

      <div className="container-page relative pt-16 pb-14 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
          <div className="relative z-10 animate-rise-in">
            <div className="eyebrow">
              Browser-native / 3D / Endless
            </div>

            <h1 className="display-tight mt-7 text-[clamp(4rem,10vw,9.4rem)]">
              OUTRUN
              <br />
              <span className="text-accent">EXTINCTION.</span>
            </h1>

            <p className="mt-7 max-w-xl text-[15px] leading-7 text-muted sm:text-base sm:leading-8">
              A three-lane, real-time 3D endless runner. Jump cacti, duck
              pterodactyls and chase the global board. No downloads, no
              account — just WebGL and a keyboard.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-muted">
              <span>Keyboard first</span>
              <span>Real-time 3D</span>
              <span>Persistent leaderboard</span>
            </div>
          </div>

          <aside className="relative z-10 hidden animate-rise-in lg:block [animation-delay:120ms]">
            <div className="ml-auto w-full max-w-[320px]">
              <div className="relative aspect-square rounded-full border border-line">
                <div className="absolute inset-6 rounded-full border border-line/70" />
                <div className="absolute inset-12 rounded-full border border-accent/30" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <p className="font-mono text-[9px] tracking-[0.22em] text-muted">
                      LANES
                    </p>
                    <p className="font-mono text-7xl font-semibold leading-none tracking-[-0.08em]">
                      03
                    </p>
                    <p className="mt-2 font-mono text-[9px] tracking-[0.16em] text-accent">
                      ONE SURVIVOR
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 divide-y divide-line border-y border-line">
                {BRIEF.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="font-mono text-[9px] tracking-[0.16em] text-muted">
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold text-ink-soft">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-5 flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] text-muted">
                <span className="h-px w-6 bg-accent" />
                THE COURSE STARTS BELOW
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-6 border-t border-line pt-6 sm:flex-row sm:items-end">
          <dl className="grid grid-cols-3 gap-8 sm:gap-14">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-mono text-[8px] tracking-[0.16em] text-muted">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 text-2xl font-semibold tracking-[-0.05em]">
                  {stat.value}
                </dd>
                <dd className="mt-0.5 text-[9px] text-muted">{stat.detail}</dd>
              </div>
            ))}
          </dl>

          <a
            href="#how-to"
            className="inline-flex w-fit text-xs font-semibold text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            Read the controls
          </a>
        </div>
      </div>
    </section>
  );
}
