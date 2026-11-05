const WORDS = [
  "OUTRUN EXTINCTION",
  "THREE LANES",
  "ZERO SECOND CHANCES",
  "BUILT WITH NEXT.JS",
  "DATABASE BACKED",
  "NO SPRITE ASSETS",
  "REAL-TIME WEBGL",
];

export function Ticker() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-b border-[#080807]/20 bg-accent py-3 text-[#080807]"
    >
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {WORDS.map((word) => (
              <span
                key={`${copy}-${word}`}
                className="pr-10 font-mono text-[10px] font-semibold tracking-[0.18em] whitespace-nowrap"
              >
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
