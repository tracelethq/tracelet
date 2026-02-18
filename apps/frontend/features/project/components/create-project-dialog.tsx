"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import { getAppProjectPath } from "../constants";
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
import { FolderPlusIcon } from "lucide-react";
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
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleSubmit = async (values: CreateProjectFormValues) => {
    const result = await authClient.organization.create({
      name: values.name,
      slug: values.slug,
    });
    if (result.error)
      throw new Error(result.error.message ?? "Failed to create project");
    const data = result.data;
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    setSelectedProjectId(data.id);
    setOpen(false);
    router.push(getAppProjectPath(data.slug, "development"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant={isIn ? "secondary" : "outline"}
            className={cn("justify-start", {"w-full bg-muted hover:bg-accent": isIn}, className)}
            divClassName={cn({"w-full": isIn}, divClassName)}
          >
            <FolderPlusIcon className="size-4" /> Create project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={false} showDecorations={true}>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Choose a name and URL-friendly slug. Your project will have development, staging, and production environments.
          </DialogDescription>
        </DialogHeader>
        <CreateProjectForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
