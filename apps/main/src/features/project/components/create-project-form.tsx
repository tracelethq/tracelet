"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function slugFromName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export type CreateProjectFormValues = { name: string; slug: string };

type CreateProjectFormProps = {
  defaultValues?: Partial<CreateProjectFormValues>;
  onSubmit: (values: CreateProjectFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

export function CreateProjectForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Create project",
}: CreateProjectFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setSlug((prev) => (prev === slugFromName(name) ? slugFromName(value) : prev));
  }, [name]);

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
    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ name: finalName, slug: finalSlug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="create-project-name">Name</Label>
        <Input
          id="create-project-name"
          value={name}
          onChange={handleNameChange}
          placeholder="My Project"
          disabled={isSubmitting}
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-project-slug">Slug</Label>
        <Input
          id="create-project-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-project"
          disabled={isSubmitting}
          autoComplete="off"
        />
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
