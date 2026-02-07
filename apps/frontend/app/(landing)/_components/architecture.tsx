import { BugIcon } from "lucide-react"
import { sectionClass, headingClass } from "./constants"

const items = [
  "Express-native",
  "TypeScript-first",
  "No vendor lock-in",
  "Metadata is exportable",
  "UI runs on the same port as your API",
]

export function Architecture() {
  return (
    <section id="architecture" className={sectionClass}>
      <h2 className={headingClass}>Architecture-friendly by design</h2>
      <ul className="mt-6 flex flex-wrap gap-2 text-muted-foreground">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm transition-colors hover:border-primary/20 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/40"
          >
            <BugIcon className="size-3.5 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
