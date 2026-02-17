"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import { useOrganizationStore } from "../store";
import { getAppOrgProjectsPath } from "@/features/project/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOrgForm } from "./create-org-form";
import type { CreateOrgFormValues } from "./create-org-form";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Decorations from "@/components/ui/decorations";

type CreateOrgDialogProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function CreateOrgDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  className,
}: CreateOrgDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSelectedOrgId = useOrganizationStore((s) => s.setSelectedOrgId);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleSubmit = async (values: CreateOrgFormValues) => {
    const result = await authClient.organization.create({
      name: values.name,
      slug: values.slug,
    });
    if (result.error)
      throw new Error(result.error.message ?? "Failed to create organization");
    const data = result.data;
    await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    setSelectedOrgId(data.id);
    setOpen(false);
    router.push(getAppOrgProjectsPath(data.slug));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="secondary" className={cn("w-full justify-start", className)} divClassName="w-full">
            <PlusIcon className="size-4" /> Create organization
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={false} showDecorations={true}>
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Choose a name and URL-friendly slug for your organization.
          </DialogDescription>
        </DialogHeader>
        <CreateOrgForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
