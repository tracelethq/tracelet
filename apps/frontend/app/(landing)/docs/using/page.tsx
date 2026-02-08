import Link from "next/link"
import { BoxIcon } from "lucide-react"
import { ExpressIcon } from "@/components/icons/express-icon"
import { ROUTES } from "@/config/constants"

export default function UsingDocsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        For developers
      </h1>
      <p className="mt-2 text-muted-foreground">
        Choose the SDK you want to set up. Each option has its own install steps and code examples.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Link
          href={ROUTES.docsUsingExpress}
          className="group flex flex-col rounded-lg border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <ExpressIcon className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Express
            </h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Logging, API docs UI, and live testing. Use Tracelet with Express and serve the built-in docs at <code className="rounded bg-muted px-1">/tracelet-docs</code>.
          </p>
          <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
            View Express setup →
          </span>
        </Link>

        <Link
          href={ROUTES.docsUsingCore}
          className="group flex flex-col rounded-lg border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <BoxIcon className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Core only
            </h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Core SDK only—logging and metadata. Integrate with any framework; no Express or docs UI.
          </p>
          <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
            View Core setup →
          </span>
        </Link>
      </div>
    </div>
  )
}
