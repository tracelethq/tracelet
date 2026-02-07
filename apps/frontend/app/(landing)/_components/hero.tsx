import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";
import { sectionClass, subheadingClass } from "./constants";
import { ArrowRightIcon } from "lucide-react";

export function Hero() {
  return (
    <div className="relative overflow-hidden pt-24 pb-20 sm:pt-28 sm:pb-24">
      {/* Soft gradient orbs (modern background) */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <section className={`${sectionClass}`}>
        <div className="relative">
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary dark:border-primary/30 dark:bg-primary/10">
            One tool for API logging, documentation & testing
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl md:leading-tight">
            Observe, document, and test your APIs{" "}
            <span className="text-primary">automatically.</span>
          </h1>
          <p className={`${subheadingClass} mt-6 max-w-xl`}>
            Tracelet plugs into your Express app and builds{" "}
            <strong className="text-foreground">
              logs, live API docs, and a testing UI
            </strong>{" "}
            from real traffic and real routes. No decorators. No schemas. No
            duplicate work.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href={ROUTES.docsUsing}>
                Get started
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
