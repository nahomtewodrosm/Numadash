export default function Loading() {
  return (
    <main
      aria-label="Loading page"
      className="container-page min-h-[70vh] py-12 sm:py-20"
    >
      <div className="h-1 w-full overflow-hidden rounded-full bg-line/50">
        <span className="loading-line block h-full w-1/4 rounded-full bg-accent" />
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <div className="h-3 w-36 animate-pulse rounded bg-line/60" />
          <div className="h-24 max-w-2xl animate-pulse rounded-2xl bg-line/50 sm:h-36" />
          <div className="h-4 max-w-lg animate-pulse rounded bg-line/50" />
          <div className="h-4 max-w-md animate-pulse rounded bg-line/50" />
        </div>
        <div className="hidden aspect-square max-w-[320px] animate-pulse rounded-full border border-line bg-surface lg:block" />
      </div>
    </main>
  );
}
