const STACK = [
  {
    name: "Next.js 16",
    detail: "App Router · Route Handlers · Server-first UI",
  },
  {
    name: "React Three Fiber",
    detail: "Three.js scene graph · 60 fps game loop",
  },
  {
    name: "Database",
    detail: "Cached connection · ranked score schema",
  },
  {
    name: "Zod",
    detail: "Runtime validation · typed API boundaries",
  },
  {
    name: "Jest + RTL",
    detail: "Engine unit tests · component rendering",
  },
  {
    name: "Tailwind CSS v4",
    detail: "Token-driven light / dark themes",
  },
];

const FLOW = [
  {
    label: "CLIENT",
    title: "React 19",
    detail: "3D canvas + HUD state",
  },
  {
    label: "EDGE / SERVER",
    title: "Route Handler",
    detail: "Zod + rate limiting",
  },
  {
    label: "DATA",
    title: "Database",
    detail: "Ranked score collection",
  },
];

export function StackSection() {
  return (
    <section
      id="stack"
      className="relative overflow-hidden border-t border-line bg-paper-deep py-20 text-ink sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-30 top-20 size-[420px] rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="container-page relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">
              Under the hood / engineering
            </p>
            <h2 className="display-tight mt-4 text-[clamp(2.8rem,6vw,5.6rem)]">
              FULL-STACK.
              <br />
              <span className="text-accent">NOT A PROTOTYPE.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted lg:justify-self-end">
            The game is rendered client-side, but the product is not a toy: a
            typed API, validated persistence, cached database connections and a
            test suite that exercises the actual game rules.
          </p>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
          {FLOW.map((item, index) => {
            return (
              <div key={item.label} className="contents">
                <div className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] tracking-[0.18em] text-muted">
                      {item.label}
                    </span>
                    <span className="font-mono text-[9px] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-5 text-lg font-semibold tracking-[-0.03em]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">{item.detail}</p>
                </div>
                {index < FLOW.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="mx-auto hidden h-px w-8 bg-gradient-to-r from-accent/70 to-accent/10 md:block"
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map((item, index) => {
              return (
                <div
                  key={item.name}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4"
                >
                  <span className="pt-0.5 font-mono text-[9px] text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="mt-1 text-[10px] leading-4 text-muted">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-3 border-t border-line pt-6 text-[10px] text-muted sm:grid-cols-3">
          <p className="flex items-center gap-2 font-mono tracking-[0.1em]">
            100% TYPE-SAFE GAME ENGINE
          </p>
          <p className="flex items-center gap-2 font-mono tracking-[0.1em]">
            ZERO SPRITE ASSETS
          </p>
          <p className="flex items-center gap-2 font-mono tracking-[0.1em]">
            REAL RECORDS ONLY
          </p>
        </div>
      </div>
    </section>
  );
}
