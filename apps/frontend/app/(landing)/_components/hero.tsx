import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";
import { ArrowRightIcon, Server, Code2 } from "lucide-react";
import { AnnouncementBanner } from "./announcement-banner";
import { ExpressIcon } from "@/components/icons/express-icon";

const techStack = [
  { name: "Express", icon: ExpressIcon },
  { name: "Node", icon: Server },
  { name: "TypeScript", icon: Code2 },
];

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-stripe-pattern pt-12 pb-[48px] sm:pt-16 sm:pb-16">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-48 left-1/2 h-[480px] w-[640px] -translate-x-1/2 rounded-full bg-primary/6 blur-3xl dark:bg-primary/8"
        aria-hidden
      />

      <section className="relative mx-auto max-w-5xl px-5 text-center sm:px-6">
        {/* Announcement bar (Solace-style slim banner) */}
        <div className="mb-8 flex justify-center">
          <AnnouncementBanner />
        </div>

        {/* Split headline */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl md:leading-[1.1] lg:text-7xl">
          Observe and document
          <br />
          <span className="text-primary">
            your APIs automatically.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Production-ready logs and live API docs for Express —
          from real traffic and real routes. No decorators. No schemas. No duplicate work.
        </p>

        {/* Tech stack bar (single horizontal bar with icons, Solace-style) */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-6 rounded-xl border border-border bg-muted/60 px-6 py-3 dark:bg-muted/40">
            {techStack.map(({ name, icon: Icon }) => (
              <span
                key={name}
                className="flex items-center gap-2 text-sm font-medium text-foreground/90"
              >
                <Icon className="size-5 text-foreground" />
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="min-w-[160px] gap-2" asChild>
            <Link href={ROUTES.docsUsing}>
              Get started
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="min-w-[160px]" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>
      </section>

      {/* Bottom spacing (48px as in Solace) */}
      <div className="h-12 shrink-0" aria-hidden />
    </div>
  );
}
