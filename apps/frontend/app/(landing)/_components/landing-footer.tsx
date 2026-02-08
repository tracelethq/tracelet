import Link from "next/link";
import { LINKS, ROUTES } from "@/config/constants";

const currentYear = new Date().getFullYear();

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/10 py-8 dark:bg-muted/5">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Tracelet. All rights reserved.
        </p>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link
            href={ROUTES.docs}
            className="transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
