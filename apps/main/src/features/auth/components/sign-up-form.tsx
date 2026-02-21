"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signUp } from "../lib/auth-client";
import { AUTH_ROUTES, AUTH_COPY } from "../constants";
import { APP_ROUTES } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const nameRaw = formData.get("name");
    const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
    const res = await signUp.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? AUTH_COPY.errors.signUpFailed);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    router.push(APP_ROUTES.projects.route);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{AUTH_COPY.signUp.title}</CardTitle>
        <CardDescription>{AUTH_COPY.signUp.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="text-destructive text-xs/relaxed" role="alert">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">{AUTH_COPY.labels.name}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder={AUTH_COPY.placeholders.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{AUTH_COPY.labels.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={AUTH_COPY.placeholders.email}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{AUTH_COPY.labels.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={AUTH_COPY.placeholders.password}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? AUTH_COPY.signUp.submitting : AUTH_COPY.signUp.submit}
          </Button>
          <p className="text-muted-foreground text-xs/relaxed text-center">
            {AUTH_COPY.signUp.hasAccount}{" "}
            <Link href={AUTH_ROUTES.signIn} className="text-primary hover:underline">
              {AUTH_COPY.signUp.link}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
