import { sectionClass, subheadingClass } from "./constants"

export function Philosophy() {
  return (
    <section id="philosophy" className={sectionClass}>
      <blockquote className="rounded-r-lg border-l-4 border-primary bg-muted/30 py-3 pl-5 pr-4 text-lg italic text-muted-foreground dark:bg-muted/10">
        Don&apos;t document APIs.{" "}
        <strong className="text-foreground">Observe them.</strong>
      </blockquote>
      <p className={subheadingClass}>
        Tracelet turns your API into its own documentation, logging system, and
        test console.
      </p>
    </section>
  )
}
