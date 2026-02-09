import Link from "next/link";
import Image from "next/image";
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
    <div className="relative overflow-hidden bg-linear-to-b from-muted/40 via-background to-background pt-14 pb-20 sm:pt-20 sm:pb-24">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/8"
        aria-hidden
      />

      <section className="relative mx-auto max-w-5xl px-5 text-center sm:px-6">
        <div className="mb-8 flex justify-center">
          <AnnouncementBanner />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl md:leading-[1.08] lg:text-7xl">
          Observe and document
          <br />
          <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            your APIs automatically.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Production-ready logs and live API docs for Express —
          from real traffic and real routes. No decorators. No schemas. No duplicate work.
        </p>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-6 rounded-2xl border border-border/80 bg-card/80 px-6 py-3.5 shadow-sm backdrop-blur-sm dark:border-border/60 dark:bg-card/60">
            {techStack.map(({ name, icon: Icon }) => (
              <span
                key={name}
                className="flex items-center gap-2 text-sm font-medium text-foreground/90"
              >
                <Icon className="size-5 text-primary" />
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="min-w-[160px] gap-2 shadow-lg shadow-primary/20" asChild>
            <Link href={ROUTES.docsDevelopers}>
              Get started
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="min-w-[160px]" asChild>
            <a href="#product">See the product</a>
          </Button>
        </div>
      </section>

      <div className="h-8 shrink-0" aria-hidden />
    </div>
  );
}
