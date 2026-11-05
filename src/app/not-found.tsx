import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-20">
      <div className="w-full max-w-lg rounded-[28px] border border-line bg-surface p-8 text-center shadow-panel">
        <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-accent">
          404 / EXTINCT ROUTE
        </p>
        <h1 className="display-tight mt-3 text-5xl">
          THIS PATH
          <br />
          NEVER EXISTED.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted">
          Some timelines end in a meteor. This one ends in a missing page. Get
          back to the run.
        </p>
        <Link href="/" className="primary-button mt-6">
          Return to the start line
        </Link>
      </div>
    </div>
  );
}
