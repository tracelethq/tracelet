import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { ArrowRightIcon } from "lucide-react";

export function AnnouncementBanner() {
  return (
    <Link
      href={ROUTES.docsDevelopers}
      className="group mx-auto flex max-w-5xl items-center justify-center gap-2 rounded-full border border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-transparent px-4 py-2.5 text-sm text-foreground shadow-sm transition-all duration-300 hover:border-primary/30 hover:from-primary/15 hover:via-primary/10 hover:to-primary/5 hover:shadow-primary/10 dark:border-primary/25 dark:from-primary/15 dark:via-primary/10 dark:to-transparent dark:hover:border-primary/40 dark:hover:from-primary/20 dark:hover:via-primary/15 sm:px-5"
    >
      <span className="font-medium">
        Introducing Tracelet: One tool for API logging & documentation
      </span>
      <ArrowRightIcon className="size-4 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-0.5" />
    </Link>
  );
}
