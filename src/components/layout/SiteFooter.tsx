export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-deep">
      <div className="container-page py-10 text-center">
        <a
          href="#top"
          className="inline-flex items-start font-display text-xl font-bold tracking-[-0.04em] transition-colors hover:text-accent"
        >
          NUMA<span className="text-accent"> RUN</span>
          <span className="ml-1 mt-0.5 font-sans text-[10px] text-muted">™</span>
        </a>
        <p className="mt-2 font-mono text-[9px] tracking-[0.16em] text-muted">
          EXTINCTION IS INEVITABLE.
        </p>
        <div className="mt-7 border-t border-line pt-5 text-[11px] text-muted">
          <p>
            © 2026 NahomTewodros · NUMA RUN™
          </p>
        </div>
      </div>
    </footer>
  );
}
