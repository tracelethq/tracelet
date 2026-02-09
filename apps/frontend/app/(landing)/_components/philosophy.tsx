import { sectionClass } from "./constants";

export function Philosophy() {
  return (
    <section id="philosophy" className={sectionClass}>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-muted/30 via-muted/20 to-primary/5 px-6 py-8 dark:from-muted/20 dark:via-muted/10 dark:to-primary/10 sm:px-10 sm:py-10">
        <div className="absolute right-0 top-0 h-24 w-32 bg-primary/5 blur-2xl dark:bg-primary/10" aria-hidden />
        <p className="relative text-xs font-medium uppercase tracking-widest text-primary/80 dark:text-primary/90">
          The larger picture
        </p>
        <blockquote className="relative mt-4 border-l-4 border-primary/50 pl-5 text-2xl font-medium leading-relaxed text-foreground sm:text-3xl md:max-w-3xl">
          &ldquo;In a world of scarcity, we treasure tools. In a world of abundance, we treasure{" "}
          <span className="text-primary">taste</span>.&rdquo;
        </blockquote>
        <p className="relative mt-6 text-muted-foreground">
          Don&apos;t document APIs. <strong className="text-foreground">Observe them.</strong>{" "}
          Tracelet turns your API into its own documentation and logging system.
        </p>
      </div>
    </section>
  );
}
