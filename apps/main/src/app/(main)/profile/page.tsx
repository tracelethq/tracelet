"use client";

import { useSession } from "@/features/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { data, isPending } = useSession();
  const user = data?.user;

  if (isPending || !user) {
    return (
      <div className="p-4">
        <div className="h-32 w-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Name:</span> {user.name ?? "—"}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Email:</span> {user.email ?? "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
