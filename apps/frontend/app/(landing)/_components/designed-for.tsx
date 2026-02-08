import { ZapIcon } from "lucide-react"
import { sectionClassAlt, headingClass } from "./constants"

const items = [
  "No changes to route signatures",
  "No Express type hacks",
  "No additional build step",
  "Works with monorepos",
  "Safe for local & internal environments",
]

export function DesignedFor() {
  return (
    <section id="designed-for" className={sectionClassAlt}>
      <h2 className={headingClass}>Designed for developers</h2>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <ZapIcon className="size-4 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-muted-foreground">
        Tracelet is{" "}
        <strong className="text-foreground">
          opt-in, runtime-aware, and non-intrusive
        </strong>
        .
      </p>
    </section>
  )
}
