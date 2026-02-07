import Link from "next/link"
import { LINKS, ROUTES, LANDING } from "@/config/constants"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/20 py-12 dark:bg-muted/5">
      <div className={`${LANDING.sectionClass} flex flex-col items-center gap-4 sm:flex-row sm:justify-between`}>
        <p className="text-sm text-muted-foreground">
          Tracelet — Logging · API Docs · Live Testing.
        </p>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href={ROUTES.docs} className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
