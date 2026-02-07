import { headingClass, subheadingClass, sectionClass } from "./constants"

export function ProblemSection() {
  return (
    <section id="problem" className={sectionClass}>
      <h2 className={headingClass}>What problem does Tracelet solve?</h2>
      <p className={subheadingClass}>
        APIs don&apos;t fail because of code — they fail because of{" "}
        <strong className="text-foreground">visibility gaps</strong>.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-muted-foreground">
        <li>Logs live in one place</li>
        <li>Docs live in another</li>
        <li>API testing lives somewhere else</li>
        <li>None of them stay in sync</li>
      </ul>
      <blockquote className="mt-8 rounded-r-lg border-l-4 border-primary bg-background/50 py-2 pl-5 pr-4 italic text-muted-foreground dark:bg-background/30">
        Every tool asks you to{" "}
        <strong className="text-foreground">describe</strong> your API again.
        Tracelet <strong className="text-foreground">watches</strong> your API
        instead.
      </blockquote>
    </section>
  )
}
