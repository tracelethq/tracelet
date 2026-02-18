"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import { useProjectStore } from "@/features/project/store";
import { useProjectsQuery } from "@/features/project/queries";
import { ENV_OPTIONS } from "@/features/project/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Key, Plus, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";

type EnvId = (typeof ENV_OPTIONS)[number]["id"];

/** Metadata we store on each API key to scope it to project + env */
type ApiKeyMetadata = {
  organizationId?: string;
  env?: string;
};

function parseMetadata(metadata: unknown): ApiKeyMetadata {
  if (metadata == null) return {};
  if (typeof metadata === "object" && "organizationId" in metadata && "env" in metadata)
    return metadata as ApiKeyMetadata;
  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata) as ApiKeyMetadata;
      return parsed ?? {};
    } catch {
      return {};
    }
  }
  return {};
}

export default function ApiKeysSettingsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const projectSlug = typeof params.projectSlug === "string" ? params.projectSlug : "";
  const environment = (typeof params.environment === "string" ? params.environment : "development").toLowerCase() as EnvId;
  const envLabel = ENV_OPTIONS.find((e) => e.id === environment)?.label ?? environment;

  const projectsQuery = useProjectsQuery();
  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);

  const project = projectSlug
    ? projects.find((p) => p.slug === projectSlug)
    : selectedProjectId
      ? projects.find((p) => p.id === selectedProjectId)
      : null;

  const [createName, setCreateName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const listKeysQuery = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await authClient.apiKey.list();
      if (res.error) throw new Error(res.error.message ?? "Failed to list API keys");
      return res.data ?? [];
    },
    enabled: !!project,
  });

  const keysForThisEnv = (listKeysQuery.data ?? []).filter((key) => {
    const meta = parseMetadata((key as { metadata?: unknown }).metadata);
    return meta.organizationId === project?.id && meta.env === environment;
  });

  const handleCreateKey = useCallback(async () => {
    if (!project) return;
    setCreateError(null);
    setIsCreating(true);
    try {
      const res = await authClient.apiKey.create({
        name: createName.trim() || `${project.name} (${envLabel})`,
        metadata: {
          organizationId: project.id,
          env: environment,
        },
      });
      if (res.error) throw new Error(res.error.message ?? "Failed to create API key");
      const keyValue = (res.data as { key?: string })?.key;
      if (keyValue) {
        setCreatedKey(keyValue);
        setCreateDialogOpen(false);
        setCreateName("");
        await queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      } else {
        setCreateError("Key was created but not returned. Check your API key list.");
      }
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to create API key.";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  }, [project, createName, envLabel, environment, queryClient]);

  const handleDeleteKey = useCallback(
    async (keyId: string) => {
      const res = await authClient.apiKey.delete({ keyId });
      if (res.error) throw new Error(res.error.message ?? "Failed to delete API key");
      await queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    [queryClient]
  );

  const copyToClipboard = useCallback((text: string) => {
    void navigator.clipboard.writeText(text);
  }, []);

  if (!projectsQuery.isFetched && projects.length === 0) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold">API Keys</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-6">
        Create and manage API keys for <strong>{project.name}</strong> ({envLabel}). Keys are scoped to this project and environment.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="size-4" />
            Keys for this environment
          </CardTitle>
          <CardDescription>
            Use these keys to authenticate requests to this project&apos;s {envLabel} environment. Create a key and copy it once; it won&apos;t be shown again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4 mr-2" />
              Create API key
            </Button>
          </div>

          {listKeysQuery.isLoading && (
            <p className="text-muted-foreground text-sm">Loading keys…</p>
          )}
          {listKeysQuery.isError && (
            <p className="text-destructive text-sm">
              {listKeysQuery.error instanceof Error
                ? listKeysQuery.error.message
                : "Failed to load API keys"}
            </p>
          )}
          {listKeysQuery.isSuccess && keysForThisEnv.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No API keys yet. Create one to get started.
            </p>
          )}
          {listKeysQuery.isSuccess && keysForThisEnv.length > 0 && (
            <ul className="space-y-2">
              {keysForThisEnv.map((key) => {
                const k = key as {
                  id: string;
                  name?: string | null;
                  start?: string | null;
                  prefix?: string | null;
                };
                const displayName = k.name ?? "Unnamed key";
                const hint = k.start ?? k.prefix ?? k.id.slice(0, 8);
                return (
                  <li
                    key={k.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{displayName}</p>
                      <p className="text-muted-foreground text-xs font-mono truncate">
                        {hint}…
                      </p>
                    </div>
                    <DeleteConfirmDialog
                      title="Delete this API key?"
                      description="This key will stop working immediately. Any integrations using it will need to be updated with a new key."
                      confirmLabel="delete"
                      placeholder="type 'delete' to confirm"
                      triggerLabel="Delete"
                      triggerVariant="ghost"
                      triggerClassName="text-destructive hover:text-destructive"
                      onConfirm={() => handleDeleteKey(k.id)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Create key dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent showDecorations={true}>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Give this key a name to identify it later. The key value will only be shown once after creation.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder={`e.g. ${project.name} (${envLabel})`}
            disabled={isCreating}
          />
          {createError && (
            <p className="text-sm text-destructive">{createError}</p>
          )}
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={isCreating}>
              {isCreating ? "Creating…" : "Create key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show key once after creation */}
      <Dialog open={!!createdKey} onOpenChange={(open) => !open && setCreatedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API key created</DialogTitle>
            <DialogDescription>
              Copy this key now. It won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-3">
            <code className="flex-1 truncate text-sm font-mono">{createdKey ?? ""}</code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => createdKey && copyToClipboard(createdKey)}
              aria-label="Copy key"
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
