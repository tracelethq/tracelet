"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import { useProjectsQuery } from "@/features/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsGeneralPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const projectSlug = params.projectSlug as string;
  const { data: projects, isLoading } = useProjectsQuery();
  const project = projects?.find((p) => p.slug === projectSlug);
  const organizationId = project?.id;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setSlug(project.slug);
    }
  }, [project]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) return;
    setError(null);
    setSaving(true);
    const { error: err } = await authClient.organization.update({
      organizationId,
      data: { name: name.trim(), slug: slug.trim() },
    });
    setSaving(false);
    if (err) {
      setError(err.message ?? "Failed to update project");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  if (isLoading || !project) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-6 flex-1 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">General settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update your project name and URL identifier.
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Project details</CardTitle>
            <CardDescription>
              These details are used to identify your project across environments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
              {error && (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Project"
                  required
                  className="max-w-md"
                />
                <p className="text-muted-foreground text-xs">
                  A human-readable name for your project.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Project slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="my-project"
                  required
                  className="max-w-md font-mono"
                />
                <p className="text-muted-foreground text-xs">
                  URL-friendly identifier used in routes. Lowercase letters, numbers, and hyphens only.
                </p>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
