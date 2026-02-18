"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signIn } from "../lib/auth-client";
import { AUTH_ROUTES, AUTH_COPY } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { APP_ROUTES } from "@/lib/constant";

export function SignInForm() {
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

    const res = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? AUTH_COPY.errors.signInFailed);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    router.push(APP_ROUTES.projects.route);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{AUTH_COPY.signIn.title}</CardTitle>
        <CardDescription>{AUTH_COPY.signIn.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="text-destructive text-xs/relaxed" role="alert">
              {error}
            </p>
          )}
          <Field>
            <FieldLabel>{AUTH_COPY.labels.email}</FieldLabel>
            <FieldContent>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                placeholder={AUTH_COPY.placeholders.email}
                required
              />
              <FieldError />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>{AUTH_COPY.labels.password}</FieldLabel>
            <FieldContent>
              <Input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={AUTH_COPY.placeholders.password}
                required
              />
              <FieldError />
            </FieldContent>
          </Field>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? AUTH_COPY.signIn.submitting : AUTH_COPY.signIn.submit}
          </Button>
          <p className="text-muted-foreground text-xs/relaxed text-center">
            {AUTH_COPY.signIn.noAccount}{" "}
            <Link href={AUTH_ROUTES.signUp} className="text-primary hover:underline">
              {AUTH_COPY.signIn.link}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
