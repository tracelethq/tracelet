import Decorations from "@/components/ui/decorations";

export function Philosophy() {
  return (
    <section id="philosophy" className="section">
      <div className="section-content relative flex flex-col items-center border p-8 text-center sm:p-10">
        <Decorations />
        <p className="text-xs font-medium uppercase tracking-widest text-primary/80 dark:text-primary/90">
          The larger picture
        </p>
        <h2 className="heading-content mt-2">
          Don&apos;t document APIs. <span className="text-primary">Observe them.</span>
        </h2>
        <blockquote className="mt-6 max-w-3xl rounded-lg border border-border border-l-4 border-l-primary bg-muted/50 py-4 px-5 text-2xl font-medium leading-relaxed text-foreground dark:bg-muted/20 sm:text-3xl">
          &ldquo;In a world of scarcity, we treasure tools. In a world of abundance, we treasure{" "}
          <span className="text-primary">taste</span>.&rdquo;
        </blockquote>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Tracelet turns your API into its own documentation and logging system.
        </p>
      </div>
    </section>
  );
}
