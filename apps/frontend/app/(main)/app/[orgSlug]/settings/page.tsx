"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import { useOrganizationStore, useOrganizationsQuery } from "@/features/organization";
import { UpdateOrgForm } from "@/features/organization/components/update-org-form";
import {
  getAppOrgProjectsPath,
  getOrgPathName,
} from "@/features/project/constants";
import { useProjectStore } from "@/features/project/store";
import { APP_ROUTES } from "@/lib/constant";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Org settings: /app/[orgSlug]/settings.
 * Update organization name and slug.
 */
export default function OrgSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orgSlug = typeof params.orgSlug === "string" ? params.orgSlug : "";

  const orgQuery = useOrganizationsQuery();
  const orgsFromStore = useOrganizationStore((s) => s.orgs);
  const orgs = orgQuery.data ?? orgsFromStore;
  const selectedOrgId = useOrganizationStore((s) => s.selectedOrgId);
  const setSelectedOrgId = useOrganizationStore((s) => s.setSelectedOrgId);
  const setOrgs = useOrganizationStore((s) => s.setOrgs);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  const setProjects = useProjectStore((s) => s.setProjects);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const org = orgSlug ? orgs.find((o) => o.slug === orgSlug) : selectedOrgId ? orgs.find((o) => o.id === selectedOrgId) : null;

  const handleSubmit = async (values: { name: string; slug: string }) => {
    if (!org) return;
    const result = await authClient.organization.update({
      data: { name: values.name, slug: values.slug },
      organizationId: org.id,
    });
    if (result.error) throw new Error(result.error.message ?? "Failed to update organization");
    await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    await queryClient.refetchQueries({ queryKey: ["organizations"] });
    setSelectedOrgId(org.id);
    if (result.data.slug !== orgSlug) {
      router.push(getOrgPathName(result.data.slug, "/settings"));
    }
  };

  const handleDelete = async () => {
    if (!org) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const result = await authClient.organization.delete({
        organizationId: org.id,
      });
      if (result.error) throw new Error(result.error.message ?? "Failed to delete organization");
      const remaining = orgs.filter((o) => o.id !== org.id);
      setOrgs(remaining);
      setSelectedOrgId(remaining[0]?.id ?? "");
      if (selectedOrgId === org.id) {
        setSelectedProjectId("");
        setProjects([]);
      }
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.refetchQueries({ queryKey: ["organizations"] });
      router.push(
        remaining.length > 0
          ? getAppOrgProjectsPath(remaining[0].slug)
          : APP_ROUTES.getStarted
      );
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to delete organization.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!orgQuery.isFetched && orgs.length === 0) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Organization not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-6">
        Update your organization details.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>
            Change the display name and URL slug. Updating the slug will change the organization URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateOrgForm
            defaultValues={{ name: org.name, slug: org.slug }}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <Card className="mt-6 border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete this organization and all its data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog
            onOpenChange={(open) => {
              if (!open) {
                setDeleteError(null);
                setDeleteConfirmName("");
              }
            }}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" type="button">
                Delete organization
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{org.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the organization and all its projects and data. This action cannot be undone. Type the organization name below to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={org.name}
                disabled={isDeleting}
                className="mt-2"
                autoComplete="off"
              />
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={isDeleting || deleteConfirmName.trim() !== org.name}
                  onClick={handleDelete}
                >
                  {isDeleting ? "Deleting…" : "Delete organization"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
