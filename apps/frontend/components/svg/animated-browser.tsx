"use client";

/**
 * Minimal "Try it out" illustration: Send button → response.
 * Uses theme colors via Tailwind. Clean, no canvas.
 */
export function AnimatedBrowser() {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-6 px-6 py-8" aria-hidden>
      <div className="flex w-full max-w-[260px] items-center gap-5">
        {/* Send button */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/20 transition-shadow duration-300 animate-pulse">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 translate-x-0.5">
              <path d="M2 12l20-9-9 20-2-9-9-2z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-muted-foreground">Send</span>
        </div>

        {/* Flow line + arrow */}
        <div className="flex flex-1 items-center gap-0.5">
          <div className="h-px flex-1 bg-linear-to-r from-primary/30 via-primary/50 to-transparent" />
          <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-primary/60" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        {/* Response card */}
        <div className="min-w-0 flex-1 rounded-lg border border-border/70 bg-card/90 px-3 py-2.5 shadow-sm dark:border-white/10 dark:bg-card/80">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">200</span>
            <span className="text-[10px] font-medium text-muted-foreground">OK</span>
          </div>
          <pre className="mt-2 overflow-x-auto text-[10px] leading-relaxed text-muted-foreground font-[inherit]">
            {`{ "id": "42", "name": "Jane" }`}
          </pre>
        </div>
      </div>
    </div>
  );
}
