import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GithubIcon, DownloadIcon, PlayIcon, BookOpenIcon } from "lucide-react";
import { LINKS, ROUTES } from "@/config/constants";

const steps = [
  { icon: DownloadIcon, label: "Install" },
  { icon: PlayIcon, label: "Run your app" },
  { icon: BookOpenIcon, label: "Logs & docs appear" },
];

export function FinalCta() {
  return (
    <section className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <div
        className="absolute inset-0 -z-10 bg-linear-to-b from-transparent via-primary/2 to-transparent dark:via-primary/4"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-muted/50 via-muted/30 to-primary/5 px-6 py-14 text-center shadow-xl shadow-primary/10 dark:border-primary/15 dark:from-muted/30 dark:via-muted/20 dark:to-primary/10 sm:px-14 sm:py-16">
        <div
          className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
          aria-hidden
        />
        <div
          className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl dark:bg-primary/10"
          aria-hidden
        />
        <h2 className="relative text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Get started in minutes
        </h2>
        <div className="relative mx-auto mt-8 flex max-w-sm flex-wrap items-center justify-center gap-2 sm:gap-4">
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
        <div className="relative mt-10 flex flex-wrap justify-center gap-4">
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
