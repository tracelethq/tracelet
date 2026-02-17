"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "../lib/auth-client";
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

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await signUp.email({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? AUTH_COPY.errors.signUpFailed);
      return;
    }
    window.location.href = AUTH_ROUTES.home;
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
          <Field>
            <FieldLabel>{AUTH_COPY.labels.name}</FieldLabel>
            <FieldContent>
              <Input
                name="name"
                type="text"
                autoComplete="name"
                placeholder={AUTH_COPY.placeholders.name}
                required
              />
              <FieldError />
            </FieldContent>
          </Field>
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
                autoComplete="new-password"
                placeholder={AUTH_COPY.placeholders.password}
                required
                minLength={8}
              />
              <FieldError />
            </FieldContent>
          </Field>
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
