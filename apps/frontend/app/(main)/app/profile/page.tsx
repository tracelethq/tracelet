"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useSession } from "@/features/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constant";

export default function ProfilePage() {
  const router = useRouter();
  const { data, isPending, error } = useSession();
  const user = data?.user;

  if (!isPending && error) {
    router.replace("/sign-in");
    return null;
  }

  if (isPending || !user) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="size-20 animate-pulse rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const name = user.name ?? "User";
  const email = user.email ?? "";
  const image = user.image ?? null;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Your account details
          </p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="relative flex size-20 shrink-0 overflow-hidden rounded-full bg-muted">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-2xl font-medium text-muted-foreground">
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <CardTitle className="text-base">{name}</CardTitle>
                {email && (
                  <CardDescription className="text-sm">{email}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Name
              </label>
              <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                {name}
              </p>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                {email || "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={"/app"}>Back to Orgs</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
