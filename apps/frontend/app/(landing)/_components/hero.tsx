import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";
import { ArrowRightIcon } from "lucide-react";
import { AnnouncementBanner } from "./announcement-banner";
import { HeroGraphic } from "./hero-graphic";
import Decorations from "@/components/ui/decorations";

export function Hero() {
  return (
    <div className="relative bg-background border">
      <Decorations />

      <section className="relative grid grid-cols-1 items-center lg:grid-cols-2">
        {/* Left: headline + CTAs */}
        <div className="text-center lg:text-left px-8 py-16 relative border-r h-full">
          <Decorations topLeft={false} bottomLeft={false} />
          <div className="mb-6 flex justify-center lg:justify-start">
            <AnnouncementBanner />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.08]">
            Observe and document
            <br />
            <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              your APIs.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed lg:mx-0">
            Ship production-ready request logs and live API docs from one place.
            No multiple schemas, no extra work.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Button
              size="lg"
              className="min-w-[160px] gap-2 shadow-lg shadow-primary/20"
              asChild
            >
              <Link href={ROUTES.docsDevelopers}>
                Get started
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[160px]"
              asChild
            >
              <a href="#product">See the product</a>
            </Button>
          </div>
        </div>

        {/* Right: abstract graphic */}
        <div className="flex justify-center h-full py-16 flex-1 relative">
          <Decorations bottomRight={false} topRight={false} />
          <HeroGraphic />
        </div>
      </section>
    </div>
  );
}
