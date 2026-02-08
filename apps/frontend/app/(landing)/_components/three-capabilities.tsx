import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BookOpenIcon,
  FileCodeIcon,
} from "lucide-react"
import { sectionClass, headingClass } from "./constants"

const cards = [
  {
    icon: FileCodeIcon,
    title: "Logging",
    description: "Automatic & structured",
    body: "Tracelet captures incoming requests, response status & timing, payload shapes (safe & configurable), and errors with route context. No manual log wiring. No copy-paste middlewares.",
  },
  {
    icon: BookOpenIcon,
    title: "Documentation",
    description: "Always in sync",
    body: "From real routes, real traffic, and real request/response shapes. Docs update as your API evolves, not when you remember to update them.",
  },
]

export function ThreeCapabilities() {
  return (
    <section id="capabilities" className={sectionClass}>
      <h2 className={headingClass}>Two core capabilities</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {cards.map(({ icon: Icon, title, description, body }) => (
          <Card
            key={title}
            className="transition-all duration-200 hover:border-primary/30 hover:shadow-md dark:hover:shadow-primary/5"
          >
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <CardTitle className="mt-3 text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {body}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
