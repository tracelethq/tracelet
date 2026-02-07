import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GithubIcon } from "lucide-react"
import { LINKS, ROUTES } from "@/config/constants"
import { sectionClass, headingClass, subheadingClass } from "./constants"

export function FinalCta() {
  return (
    <section className={sectionClass}>
      <div className="rounded-2xl border border-border bg-linear-to-b from-muted/50 to-muted/20 p-8 text-center sm:p-12 dark:from-muted/20 dark:to-muted/5">
        <h2 className={headingClass}>
          Stop maintaining three tools for one API.
        </h2>
        <p className={`${subheadingClass} mx-auto mt-4`}>
          Install Tracelet → Run your app → Everything appears.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href={ROUTES.docsUsing}>Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="mr-2 size-4" />
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
