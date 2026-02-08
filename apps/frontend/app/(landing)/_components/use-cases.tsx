import { sectionClass, headingClass } from "./constants"

const useCases = [
  "Local development visibility",
  "Internal service documentation",
  "Debugging request/response issues",
  "Frontend ↔ backend collaboration",
  "Onboarding new engineers",
  "Microservice observability",
]

export function UseCases() {
  return (
    <section id="use-cases" className={sectionClass}>
      <h2 className={headingClass}>Typical use cases</h2>
      <ul className="mt-6 flex flex-wrap gap-2 text-muted-foreground">
        {useCases.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm transition-colors hover:border-primary/20 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/40"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
