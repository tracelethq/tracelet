import Link from "next/link";
import { Button } from "@/components/ui/button";
import Decorations from "@/components/ui/decorations";
import { GithubIcon, DownloadIcon, PlayIcon, BookOpenIcon } from "lucide-react";
import { LINKS, ROUTES } from "@/config/constants";

const steps = [
  { icon: DownloadIcon, label: "Install" },
  { icon: PlayIcon, label: "Run your app" },
  { icon: BookOpenIcon, label: "Logs & docs appear" },
];

export function FinalCta() {
  return (
    <section id="final-cta" className="section">
      <div className="section-content relative flex flex-col items-center border p-8 text-center sm:p-10 section-primary-gradient">
        <Decorations />
        <h2 className="heading-content">
          Get started in minutes
        </h2>
        <div className="mt-8 flex max-w-sm flex-wrap items-center justify-center gap-2 sm:gap-4">
          {steps.map(({ icon: Icon, label }, i) => (
            <span
              key={label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="size-4" />
              </span>
              <span>{label}</span>
              {i < steps.length - 1 && (
                <span
                  className="hidden text-muted-foreground/50 sm:inline"
                  aria-hidden
                >
                  →
                </span>
              )}
            </span>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="shadow-lg shadow-primary/20" asChild>
            <Link href={ROUTES.docsDevelopers}>Get started</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border hover:bg-muted/50"
            asChild
          >
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="mr-2 size-4" />
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
