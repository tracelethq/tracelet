import Link from "next/link"
import { BookOpenIcon, Code2Icon } from "lucide-react"
import { ROUTES } from "@/config/constants"

export default function DocsIndexPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Documentation
      </h1>
      <p className="mt-2 text-muted-foreground">
        Choose the guide that fits what you want to do.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Link
          href={ROUTES.docsUsing}
          className="group flex flex-col rounded-lg border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Code2Icon className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              For developers
            </h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Install Tracelet in your app, mount the docs UI, run locally, and
            fix common issues. Use the SDK without touching the monorepo.
          </p>
          <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
            View developer docs →
          </span>
        </Link>

        <Link
          href={ROUTES.docsContributing}
          className="group flex flex-col rounded-lg border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <BookOpenIcon className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              For contributors
            </h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Set up the monorepo, build packages, pack SDKs, understand the
            project layout, and test changes outside the repo.
          </p>
          <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
            View contributor docs →
          </span>
        </Link>
      </div>
    </div>
  )
}
