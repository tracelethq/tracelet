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

export type UpdateOrgFormValues = {
  name: string;
  slug: string;
};

type UpdateOrgFormProps = {
  defaultValues: UpdateOrgFormValues;
  onSubmit: (values: UpdateOrgFormValues) => Promise<void>;
  submitLabel?: string;
};

export function UpdateOrgForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save changes",
}: UpdateOrgFormProps) {
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
      setError("Organization name is required.");
      return;
    }
    if (!finalSlug) {
      setError("Organization slug is required (e.g. my-org).");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ name: finalName, slug: finalSlug });
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to update organization.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="update-org-name">Name</FieldLabel>
          <FieldContent>
            <Input
              id="update-org-name"
              value={name}
              onChange={handleNameChange}
              placeholder="Acme Inc"
              disabled={isSubmitting}
              autoComplete="organization"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="update-org-slug">Slug</FieldLabel>
          <FieldContent>
            <Input
              id="update-org-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="acme"
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
