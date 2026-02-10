import * as React from "react";
import { LockKeyholeIcon, Loader2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldGroup, Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tracelet-docs-token";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export interface LoginFormProps {
  authUrl: string;
  onSuccess: (token: string) => void;
  /** When true, render only the card (no full-screen wrapper). Use inside a dialog. */
  embedded?: boolean;
}

export function LoginForm({ authUrl, onSuccess, embedded }: LoginFormProps) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        const res = await fetch(authUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.token != null || data.authenticated === true)) {
          if (data.token) {
            setStoredToken(data.token);
            onSuccess(data.token);
          } else {
            onSuccess("");
          }
          return;
        }
        setError(data.error ?? "Invalid credentials");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
    },
    [authUrl, username, password, onSuccess],
  );

  const formContent = (
    <Card
      className={cn(
        embedded ? "border-0 shadow-none" : "w-full max-w-sm",
        "overflow-hidden",
      )}
    >
      <CardHeader
        className={cn(
          "space-y-3 pb-6",
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LockKeyholeIcon className="size-5" aria-hidden />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight">
            Sign in to Tracelet Docs
          </CardTitle>
          <CardDescription className="text-xs/relaxed">
            Use your credentials to access the API documentation.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className={cn("pt-0")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup className="gap-4">
            <Field>
              <Label
                htmlFor="login-username"
                className="text-xs font-medium text-muted-foreground"
              >
                Username
              </Label>
              <Input
                id="login-username"
                type="text"
                autoComplete="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="h-9"
              />
            </Field>
            <Field>
              <Label
                htmlFor="login-password"
                className="text-xs font-medium text-muted-foreground"
              >
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="h-9"
              />
            </Field>
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="mt-1 h-9 w-full gap-2 font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );

  if (embedded) return formContent;
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {formContent}
    </div>
  );
}
