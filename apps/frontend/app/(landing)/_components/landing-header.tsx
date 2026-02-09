"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { GlobalSearchTrigger } from "@/components/global-search";
import { Button } from "@/components/ui/button";
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
  { href: ROUTES.docsDevelopers, label: "Get started", primary: true },
];

export function LandingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 shadow-sm shadow-black/5 backdrop-blur-md supports-backdrop-filter:bg-background/70 dark:border-border/60 dark:shadow-black/10">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link
            href={ROUTES.home}
            className="flex shrink-0 items-center font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            <Logo />
          </Link>

          <nav className="flex items-center gap-0.5">
            <ul className="flex items-center gap-0.5">
              {navLinks.map(({ href, label, primary }) => {
                const isActive =
                  pathname === href ||
                  (href === ROUTES.docs &&
                    pathname.startsWith(ROUTES.docs) &&
                    !pathname.startsWith(ROUTES.docsDevelopers)) ||
                  (href === ROUTES.docsDevelopers &&
                    pathname.startsWith(ROUTES.docsDevelopers));
                return (
                  <li key={href} className="hidden sm:block">
                    <Link
                      href={href}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "text-foreground bg-muted/80"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <GlobalSearchTrigger className="hidden sm:flex sm:items-center sm:gap-2 sm:rounded-full sm:border sm:border-border/80 sm:bg-muted/40 sm:px-3 sm:py-2 sm:text-sm sm:text-muted-foreground sm:transition-colors sm:hover:bg-muted/60 sm:hover:text-foreground dark:sm:border-border/60 dark:sm:bg-muted/20" />
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            aria-label="GitHub"
          >
            <GithubIcon className="size-5" />
          </a>
          <div className="rounded-full border-l border-border/60 pl-1.5 sm:pl-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
