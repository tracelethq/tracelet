import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import { LINKS, ROUTES } from "@/config/constants";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <div className="rounded-2xl border border-border bg-muted/20 px-6 py-12 text-center dark:bg-muted/10 sm:px-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Get started in minutes
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Install Tracelet → Run your app → Logs, docs, and testing appear.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href={ROUTES.docsUsing}>Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
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
