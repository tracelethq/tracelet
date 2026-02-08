import {
  BookOpenIcon,
  FileCodeIcon,
} from "lucide-react"
import { sectionClass, headingClass, subheadingClass } from "./constants"

export function WhatIsTracelet() {
  return (
    <section id="what-is-tracelet" className={sectionClass}>
      <h2 className={headingClass}>What is Tracelet?</h2>
      <p className={subheadingClass}>
        Tracelet is a{" "}
        <strong className="text-foreground">
          runtime API observability layer
        </strong>{" "}
        for Express apps. It provides:
      </p>
      <ul className="mt-6 space-y-3 text-muted-foreground">
        <li className="flex items-center gap-2">
          <BookOpenIcon className="size-5 shrink-0 text-primary" />
          <span>
            <strong className="text-foreground">API Documentation</strong>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <FileCodeIcon className="size-5 shrink-0 text-primary" />
          <span>
            <strong className="text-foreground">
              Structured Request & Response Logs
            </strong>
          </span>
        </li>
      </ul>
      <p className="mt-6 text-muted-foreground">
        All from the same source of truth:{" "}
        <strong className="text-foreground">
          your running Express application.
        </strong>
      </p>
    </section>
  )
}
