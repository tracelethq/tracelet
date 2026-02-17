import Link from "next/link";
import { AUTH_ROUTES, AUTH_COPY } from "@/features/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex flex-col bg-background text-foreground">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href={AUTH_ROUTES.home} className="text-sm font-medium text-foreground hover:text-primary">
          Tracelet
        </Link>
        <nav className="flex items-center gap-3 text-xs text-muted-foreground">
          <Link href={AUTH_ROUTES.signIn} className="hover:text-foreground">
            {AUTH_COPY.nav.signIn}
          </Link>
          <Link href={AUTH_ROUTES.signUp} className="hover:text-foreground">
            {AUTH_COPY.nav.signUp}
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
