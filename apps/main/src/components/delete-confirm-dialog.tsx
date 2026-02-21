"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type DeleteConfirmDialogProps = {
  /** Dialog title (e.g. "Delete project?") */
  title: string;
  /** Description shown in the dialog */
  description: React.ReactNode;
  /** Exact string the user must type to confirm */
  confirmLabel: string;
  /** Placeholder for the confirmation input (defaults to confirmLabel) */
  placeholder?: string;
  /** Label for the trigger button */
  triggerLabel: string;
  /** Label for the confirm button (defaults to triggerLabel) */
  confirmButtonLabel?: string;
  /** Called when user confirms; should perform the delete */
  onConfirm: () => Promise<void>;
  /** Optional variant for the trigger button */
  triggerVariant?: "destructive" | "outline" | "secondary" | "ghost" | "link" | "default";
  /** Optional class for the trigger button */
  triggerClassName?: string;
  /** Optional content for the trigger (e.g. icon); when set, triggerLabel is used for aria-label */
  triggerContent?: React.ReactNode;
};

export function DeleteConfirmDialog({
  title,
  description,
  confirmLabel,
  placeholder,
  triggerLabel,
  confirmButtonLabel = triggerLabel,
  onConfirm,
  triggerVariant = "destructive",
  triggerClassName,
  triggerContent,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmValue, setConfirmValue] = useState("");

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
      setConfirmValue("");
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Something went wrong.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmed = confirmValue.trim() === confirmLabel;

  return (
    <AlertDialog onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant={triggerVariant}
          type="button"
          className={triggerClassName}
          aria-label={triggerContent ? triggerLabel : undefined}
        >
          {triggerContent ?? triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirmValue}
          onChange={(e) => setConfirmValue(e.target.value)}
          placeholder={placeholder ?? confirmLabel}
          disabled={isDeleting}
          className="mt-2"
          autoComplete="off"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isDeleting || !isConfirmed}
            onClick={handleConfirm}
          >
            {isDeleting ? "Deleting…" : confirmButtonLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
