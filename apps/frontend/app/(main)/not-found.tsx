
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">
        Project not found
      </h1>
      <p className="text-sm text-muted-foreground">
        The project in the URL doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link
        href="/app/get-stated"
        className="text-sm font-medium text-primary hover:underline"
      >
        Get started
      </Link>
    </div>
  );
}
