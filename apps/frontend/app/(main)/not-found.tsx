import Link from "next/link";

import { APP_ROUTES } from "@/lib/constant";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">
        Not found
      </h1>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        The page doesn&apos;t exist or you don&apos;t have access.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={APP_ROUTES.projects.route}
          className="text-sm font-medium text-primary hover:underline"
        >
          Get Projects
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link
          href={APP_ROUTES.base.route}
          className="text-sm font-medium text-primary hover:underline"
        >
          Go to app
        </Link>
      </div>
    </div>
  );
}
