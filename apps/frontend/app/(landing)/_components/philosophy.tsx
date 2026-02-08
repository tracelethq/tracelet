import { sectionClass } from "./constants";

export function Philosophy() {
  return (
    <section id="philosophy" className={sectionClass}>
      <p className="text-xs font-medium uppercase tracking-widest text-primary/80 dark:text-primary/90">
        The larger picture
      </p>
      <blockquote className="mt-4 text-2xl font-medium leading-relaxed text-foreground sm:text-3xl md:max-w-3xl">
        &ldquo;In a world of scarcity, we treasure tools. In a world of abundance, we treasure{" "}
        <span className="text-primary">taste</span>.&rdquo;
      </blockquote>
      <p className="mt-6 text-muted-foreground">
        Don&apos;t document APIs. <strong className="text-foreground">Observe them.</strong>{" "}
        Tracelet turns your API into its own documentation, logging system, and test console.
      </p>
    </section>
  );
}
