import Link from "next/link";
import { BookOpenIcon, GithubIcon } from "lucide-react";
import { LINKS, ROUTES } from "@/config/constants";

const currentYear = new Date().getFullYear();

export function LandingFooter() {
  return (
    <footer className="relative border-t border-border bg-linear-to-b from-muted/15 to-muted/5 py-10 dark:from-muted/10 dark:to-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,var(--primary)/0.03,transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,var(--primary)/0.06,transparent)]" aria-hidden />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Tracelet. All rights reserved.
        </p>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href={ROUTES.docs}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <BookOpenIcon className="size-4" />
            Docs
          </Link>
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
