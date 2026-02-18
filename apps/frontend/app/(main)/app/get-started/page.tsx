"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import { getAppProjectPath } from "@/features/project/constants";
import { useProjectStore } from "@/features/project/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function GetStartedPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setName(value);
      setSlug((prev) => (prev === slugFromName(name) ? slugFromName(value) : prev));
    },
    [name]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const finalName = name.trim();
    const finalSlug = (slug.trim() || slugFromName(finalName)).toLowerCase().replace(/\s+/g, "-");
    if (!finalName) {
      setError("Project name is required.");
      return;
    }
    if (!finalSlug) {
      setError("Project slug is required (e.g. my-project).");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await authClient.organization.create({
        name: finalName,
        slug: finalSlug,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to create project");
      }
      const data = result.data;
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedProjectId(data.id);
      router.push(getAppProjectPath(data.slug, "development"));
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to create project.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-semibold">Get started</h1>
      <p className="text-muted-foreground mt-2 mb-6">
        Create a project to get started. Each project has development, staging, and production environments.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>
            Choose a name and URL-friendly slug for your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="org-name">Name</FieldLabel>
                <FieldContent>
                  <Input
                    id="org-name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="My Project"
                    disabled={isSubmitting}
                    autoComplete="organization"
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="org-slug">Slug</FieldLabel>
                <FieldContent>
                  <Input
                    id="org-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-project"
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  {error && <FieldError>{error}</FieldError>}
                </FieldContent>
              </Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create project"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
