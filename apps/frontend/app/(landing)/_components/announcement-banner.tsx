import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { ArrowRightIcon } from "lucide-react";

export function AnnouncementBanner() {
  return (
    <Link
      href={ROUTES.docsUsing}
      className="mx-auto flex max-w-5xl items-center justify-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/80 dark:border-border/80 dark:bg-muted/30 dark:hover:bg-muted/50 sm:px-5"
    >
      <span className="font-medium">
        Introducing Tracelet: One tool for API logging & documentation
      </span>
      <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
