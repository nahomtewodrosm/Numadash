import { Keycap } from "@/components/game/Keycap";

interface Move {
  number: string;
  title: string;
  description: string;
  keys: string[];
}

const MOVES: Move[] = [
  {
    number: "01",
    title: "Strafe",
    description:
      "Thread between cacti and pterodactyls. Three lanes, instant direction changes, nowhere to hide.",
    keys: ["A", "D"],
  },
  {
    number: "02",
    title: "Jump",
    description:
      "Clear ground cacti at the last second. Timing counts — the run gets faster every second.",
    keys: ["SPACE", "W"],
  },
  {
    number: "03",
    title: "Duck",
    description:
      "Pterodactyls hunt at head height. Drop low, keep your line and let them scream overhead.",
    keys: ["S", "↓"],
  },
];

export function HowToPlay() {
  return (
    <section
      id="how-to"
      className="border-t border-line bg-paper py-20 sm:py-28"
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="eyebrow">Controls / flow state</p>
            <h2 className="display-tight mt-4 text-[clamp(2.8rem,6vw,5.5rem)]">
              THREE MOVES.
              <br />
              <span className="text-accent">ONE SURVIVAL.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted lg:justify-self-end">
            Change lanes to avoid obstacles, jump over cacti and duck under
            flying pterodactyls. Collect the center-height shards as you go.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-12">
          {MOVES.map((move, index) => {
            const featured = index === 0;

            return (
              <article
                key={move.number}
                className={`how-to-card animate-rise-in group relative flex flex-col overflow-hidden rounded-[26px] border border-line bg-surface p-5 transition-colors hover:border-accent/50 sm:p-6 ${
                  featured ? "md:col-span-7 md:row-span-2" : "md:col-span-5"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-7 -right-3 font-mono text-[5rem] font-bold tracking-[-0.08em] text-line/40 transition-colors group-hover:text-accent/15"
                >
                  {move.number}
                </span>

                <div className="relative flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <span className="font-mono text-xs font-semibold">
                      {move.number}
                    </span>
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.16em] text-muted">
                    MOVE / {move.number}
                  </span>
                </div>

                <h3
                  className={`relative mt-7 font-semibold tracking-[-0.04em] ${
                    featured ? "text-3xl sm:text-4xl" : "text-2xl"
                  }`}
                >
                  {move.title}
                </h3>
                <p className="relative mt-2 max-w-md text-xs leading-5 text-muted">
                  {move.description}
                </p>

                <MoveDiagram move={move.title} />

                <div className="relative mt-auto flex flex-wrap gap-1.5 pt-6">
                  {move.keys.map((key) => (
                    <Keycap key={key} wide={key === "SPACE"}>
                      {key}
                    </Keycap>
                  ))}
                </div>
              </article>
            );
          })}

          <article className="flex flex-col rounded-[22px] border border-line bg-surface p-5 md:col-span-4">
            <p className="flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] text-muted">
              SYSTEM
            </p>
            <p className="mt-4 text-sm leading-6 text-ink-soft">
              The run pauses itself when you switch tabs or scroll the game out
              of view.
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-6 text-[10px] text-muted">
              <Keycap>P</Keycap>
              pause
              <Keycap>R</Keycap>
              restart
              <Keycap>ESC</Keycap>
              menu
            </div>
          </article>

          <article className="flex flex-col rounded-[22px] border border-accent/30 bg-accent p-5 text-accent-ink md:col-span-4">
            <p className="flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] text-accent-ink/65">
              SCORE FORMULA
            </p>
            <p className="mt-4 font-mono text-lg font-semibold leading-7 tracking-[-0.03em]">
              DISTANCE × 1.6
              <br />+ SHARDS × 50
            </p>
            <p className="mt-auto pt-5 text-[11px] leading-5 text-accent-ink/70">
              Every saved run is validated, ranked and written to the global
              board.
            </p>
          </article>

          <article className="flex flex-col rounded-[22px] border border-line bg-surface p-5 md:col-span-4">
            <p className="flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] text-muted">
              LIVE PACE
            </p>
            <p className="mt-4 font-mono text-3xl font-semibold tracking-[-0.06em]">
              0 → 50
              <span className="ml-1 font-sans text-[10px] font-medium tracking-normal text-muted">
                km/h
              </span>
            </p>
            <div
              aria-hidden="true"
              className="mt-5 h-1.5 overflow-hidden rounded-full bg-line/70"
            >
              <span className="block h-full w-4/5 rounded-full bg-gradient-to-r from-accent/40 to-accent" />
            </div>
            <p className="mt-auto pt-5 text-[11px] leading-5 text-muted">
              Speed climbs continuously. There is no finish line and no second
              chance.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function MoveDiagram({ move }: { move: string }) {
  if (move === "Strafe") {
    return (
      <div
        className="relative mt-8 grid flex-1 grid-cols-3 gap-2"
        aria-label="Three lanes; move left or right to switch lanes"
      >
        {["LEFT", "MID", "RIGHT"].map((lane, index) => (
          <div
            key={lane}
            className={`relative min-h-24 rounded-xl border ${
              index === 1
                ? "border-accent/40 bg-accent/10"
                : "border-line bg-paper-deep"
            }`}
          >
            <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-[0.14em] text-muted">
              {lane}
            </span>
          </div>
        ))}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-3 text-accent">
          <svg
            aria-hidden="true"
            viewBox="0 0 64 40"
            className="h-10 w-16 drop-shadow-sm"
          >
            <path
              d="M58 20H8m0 0 15-15M8 20l15 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <svg
            aria-hidden="true"
            viewBox="0 0 64 40"
            className="h-10 w-16 drop-shadow-sm"
          >
            <path
              d="M6 20h50m0 0L41 5m15 15L41 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="sr-only">Use A and D or arrow keys.</span>
      </div>
    );
  }

  if (move === "Jump") {
    return (
      <svg
        viewBox="0 0 220 70"
        className="mt-7 h-20 w-full"
        fill="none"
        aria-label="Jump in an arc over a cactus"
      >
        <path
          d="M12 58 Q110 -8 208 58"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
        <path d="M8 58h204" stroke="var(--line-strong)" strokeWidth="1" />
        <path
          d="M105 58v-12h5V34h5v24m-10-8h-4v5m14-5h4v5"
          stroke="var(--ink-soft)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M24 58v-4M110 24v-4M196 58v-4"
          stroke="var(--accent)"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 220 70"
      className="mt-7 h-20 w-full"
      fill="none"
      aria-label="Duck beneath a flying obstacle"
    >
      <path
        d="M8 22h204"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
      <path d="M92 25 110 16l18 9-10-2-8 7-8-7-10 2Z" fill="var(--ink-soft)" />
      <path d="M72 57h18v-8h15v-9h20v12h17v7H72Z" fill="var(--ink-soft)" />
      <path d="M8 62h204" stroke="var(--line-strong)" strokeWidth="1" />
    </svg>
  );
}
