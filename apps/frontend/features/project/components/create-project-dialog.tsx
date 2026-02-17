"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/features/organization";
import { getAppOrgProjectPath } from "../constants";
import { createProject } from "../api";
import { useProjectStore } from "../store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateProjectForm } from "./create-project-form";
import type { CreateProjectFormValues } from "./create-project-form";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CreateProjectDialogProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  divClassName?: string;
  isIn?: boolean;
};

export function CreateProjectDialog({
  trigger,
  isIn = false,
  open: controlledOpen,
  onOpenChange,
  className,
  divClassName,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((s) => s.selectedOrgId);
  const orgs = useOrganizationStore((s) => s.orgs);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const selectedOrg = selectedOrgId
    ? orgs.find((o) => o.id === selectedOrgId)
    : null;

  const handleSubmit = async (values: CreateProjectFormValues) => {
    if (!selectedOrgId) throw new Error("No organization selected");
    const project = await createProject({
      organizationId: selectedOrgId,
      name: values.name,
      slug: values.slug,
    });
    await queryClient.invalidateQueries({
      queryKey: ["projects", selectedOrgId],
    });
    setSelectedProjectId(project.id);
    setOpen(false);
    const orgSlug = selectedOrg?.slug ?? "";
    if (orgSlug) {
      router.push(getAppOrgProjectPath(orgSlug, project.slug, "development"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant={isIn ? "secondary" : "outline"} className={cn("w-full justify-start", className)} divClassName={cn("w-full", divClassName)}>
            <PlusIcon className="size-4" /> Create project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={false} showDecorations={true}>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Choose a name and URL-friendly slug for your project.
          </DialogDescription>
        </DialogHeader>
        {selectedOrgId ? (
          <CreateProjectForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            Select an organization first.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
