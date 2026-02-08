"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { GlobalSearchTrigger } from "@/components/global-search";
import { GithubIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Logo = dynamic(
  () => import("@/components/icons/logo").then((mod) => mod.Logo),
  { ssr: false },
);

import { LINKS, ROUTES } from "@/config/constants";

const navLinks = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.docs, label: "Docs" },
];

export function LandingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href={ROUTES.home}
            className="flex shrink-0 items-center font-semibold text-foreground hover:text-foreground/90"
          >
            <Logo />
          </Link>

          <nav className="flex items-center gap-1">
            <ul className="flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === href ||
                        (href === ROUTES.docs &&
                          pathname.startsWith(ROUTES.docs))
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <GlobalSearchTrigger className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:border-border/80 dark:bg-muted/30" />
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-2 text-muted-foreground hover:text-foreground"
            aria-label="GitHub"
          >
            <GithubIcon className="size-5" />
          </a>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
