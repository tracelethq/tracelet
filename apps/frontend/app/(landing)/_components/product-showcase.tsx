"use client";

import Image from "next/image";

export function ProductShowcase() {
  return (
    <section id="product" className="mx-auto max-w-5xl px-4">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-2xl shadow-primary/5 ring-1 ring-border/50 dark:shadow-primary/10">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            /tracelet-docs
          </span>
        </div>
        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/20">
          <Image
            src="/docs-sample.png"
            alt="Tracelet docs UI showing API routes and try-it panel"
            fill
            className="object-contain object-top"
            sizes="(min-width: 1024px) 896px, 100vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}
