"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export type UpdateProjectFormValues = { name: string; slug: string };

type UpdateProjectFormProps = {
  defaultValues: UpdateProjectFormValues;
  onSubmit: (values: UpdateProjectFormValues) => Promise<void>;
  submitLabel?: string;
};

export function UpdateProjectForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save changes",
}: UpdateProjectFormProps) {
  const [name, setName] = useState(defaultValues.name);
  const [slug, setSlug] = useState(defaultValues.slug);
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
      await onSubmit({ name: finalName, slug: finalSlug });
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to update project.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="update-project-name">Name</FieldLabel>
          <FieldContent>
            <Input
              id="update-project-name"
              value={name}
              onChange={handleNameChange}
              placeholder="My Project"
              disabled={isSubmitting}
              autoComplete="organization"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="update-project-slug">Slug</FieldLabel>
          <FieldContent>
            <Input
              id="update-project-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-project"
              disabled={isSubmitting}
              autoComplete="off"
            />
            {error && <FieldError>{error}</FieldError>}
          </FieldContent>
        </Field>
        <div className="flex gap-2 justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
