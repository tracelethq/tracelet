"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { GlobalSearchTrigger } from "@/components/global-search";
import { GithubIcon, MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Logo = dynamic(
  () => import("@/components/icons/logo").then((mod) => mod.Logo),
  { ssr: false },
);

import { LINKS, ROUTES } from "@/config/constants";
import Decorations from "@/components/ui/decorations";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocsNav } from "../docs/_components/docs-nav";

const navLinks = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.docs, label: "Docs" },
  { href: ROUTES.docsDevelopers, label: "Get started", primary: true },
];

export function LandingHeader({
  mdxDocs,
}: {
  mdxDocs: { slug: string[]; href: string; title: string }[];
}) {
  const pathname = usePathname();

  const renderNavLinks = () => {
    return navLinks.map(({ href, label, primary }) => {
      const isActive =
        pathname === href ||
        (href === ROUTES.docs &&
          pathname.startsWith(ROUTES.docs) &&
          !pathname.startsWith(ROUTES.docsDevelopers)) ||
        (href === ROUTES.docsDevelopers &&
          pathname.startsWith(ROUTES.docsDevelopers));
      return (
        <li key={href}>
          <Link
            href={href}
            className={cn(
              "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            {label}
          </Link>
        </li>
      );
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 shadow-sm shadow-black/5 backdrop-blur-md supports-backdrop-filter:bg-background/70 dark:border-border/60 dark:shadow-black/10 h-(--landing-nav-height) border">
      <Decorations />
      <div className="mx-auto flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <MobileNavLinks mdxDocs={mdxDocs} renderNavLinks={renderNavLinks} />
        <div className="flex items-center gap-6 md:gap-8">
          <Link
            href={ROUTES.home}
            className="flex shrink-0 items-center font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            <Logo />
          </Link>

          <nav className="flex items-center gap-0.5">
            <ul className="hidden md:flex items-center gap-0.5">
              {renderNavLinks()}
            </ul>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <GlobalSearchTrigger className="flex sm:items-center sm:gap-2 sm:border sm:border-border/80 sm:bg-muted/40 sm:px-3 sm:py-2 text-sm text-muted-foreground sm:transition-colors sm:hover:bg-muted/60 sm:hover:text-foreground dark:sm:border-border/60 dark:sm:bg-muted/20" />
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            aria-label="GitHub"
          >
            <GithubIcon className="size-5" />
          </a>
          <div className="rounded-full border-l border-border/60 pl-1.5 md:pl-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

const MobileNavLinks = ({
  mdxDocs,
  renderNavLinks,
}: {
  mdxDocs: { slug: string[]; href: string; title: string }[];
  renderNavLinks: () => React.ReactNode;
}) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden">
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false}>
        <SheetHeader className="h-(--landing-nav-height)">
          <Logo />
          <SheetTitle className="sr-only">Docs</SheetTitle>
          <SheetDescription className="sr-only">
            Explore our documentation to learn how to use our SDKs and APIs.
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-auto relative h-[calc(100svh-var(--landing-nav-height)-0.4rem)] p-8 pt-2">
          <div className="mb-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Menu
            </p>
            <ul className="flex flex-col gap-2 md:hidden md:items-center md:gap-0.5">
              {renderNavLinks()}
            </ul>
          </div>
          <DocsNav mdxDocs={mdxDocs} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
