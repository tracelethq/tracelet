"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { authClient } from "@/features/auth/lib/auth-client";
import { useProjectsQuery } from "@/features/project";
import { ENV_OPTIONS } from "@/features/project/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Key, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ApiKeyMeta = {
  id: string;
  name?: string | null;
  start?: string | null;
  prefix?: string | null;
  createdAt?: string | Date;
  enabled?: boolean;
  rateLimitEnabled?: boolean;
  rateLimitTimeWindow?: number | null;
  rateLimitMax?: number | null;
  permissions?: string | null;
  metadata?: { organizationId?: string; env?: string } | null;
};

const RATE_WINDOW_OPTIONS = [
  { value: 60, label: "1 minute" },
  { value: 60 * 60, label: "1 hour" },
  { value: 60 * 60 * 24, label: "1 day" },
];

function formatRateLimit(
  enabled: boolean | undefined,
  windowSec: number | null | undefined,
  max: number | null | undefined
): string {
  if (!enabled || windowSec == null || max == null) return "Off";
  const w =
    windowSec >= 86400
      ? `${windowSec / 86400}d`
      : windowSec >= 3600
        ? `${windowSec / 3600}h`
        : `${windowSec}s`;
  return `${max} / ${w}`;
}

function formatDate(v: string | Date | undefined): string {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v) : v;
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function SettingsApiKeysPage() {
  const params = useParams();
  const projectSlug = params.projectSlug as string;
  const envFromUrl = (params.environment as string) ?? "development";
  const currentEnvId = ENV_OPTIONS.some((e) => e.id === envFromUrl)
    ? envFromUrl
    : ENV_OPTIONS[0].id;
  const currentEnvOption =
    ENV_OPTIONS.find((e) => e.id === currentEnvId) ?? ENV_OPTIONS[0];

  const { data: projects, isLoading } = useProjectsQuery();
  const project = projects?.find((p) => p.slug === projectSlug);
  const organizationId = project?.id;

  const [keys, setKeys] = useState<ApiKeyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKeyShown, setNewKeyShown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [editKey, setEditKey] = useState<ApiKeyMeta | null>(null);
  const [editEnabled, setEditEnabled] = useState(true);
  const [editRateLimitEnabled, setEditRateLimitEnabled] = useState(false);
  const [editRateLimitWindow, setEditRateLimitWindow] = useState<number>(3600);
  const [editRateLimitMax, setEditRateLimitMax] = useState(1000);
  const [editPermissions, setEditPermissions] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [keyToDelete, setKeyToDelete] = useState<ApiKeyMeta | null>(null);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [deleting, setDeleting] = useState(false);

  const currentEnvKeys = keys;
  const envLabel = currentEnvOption.label;

  function loadKeys() {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    authClient.apiKey
      .list({})
      .then((res) => {
        if (res.error) throw new Error(res.error.message);
        const list = (res.data ?? []) as unknown as ApiKeyMeta[];
        setKeys(
          list.filter(
            (k) =>
              (k.metadata as { organizationId?: string })?.organizationId ===
                organizationId &&
              (k.metadata as { env?: string })?.env === currentEnvId
          )
        );
      })
      .catch((err) => setError(err.message ?? "Failed to load API keys"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadKeys();
  }, [organizationId, currentEnvId]);

  function openEditDialog(keyRow: ApiKeyMeta) {
    setEditKey(keyRow);
    setEditEnabled(keyRow.enabled ?? true);
    setEditRateLimitEnabled(keyRow.rateLimitEnabled ?? false);
    setEditRateLimitWindow(
      keyRow.rateLimitTimeWindow ?? 3600
    );
    setEditRateLimitMax(keyRow.rateLimitMax ?? 1000);
    try {
      const p = keyRow.permissions
        ? JSON.parse(keyRow.permissions)
        : undefined;
      setEditPermissions(
        p ? JSON.stringify(p, null, 2) : ""
      );
    } catch {
      setEditPermissions(keyRow.permissions ?? "");
    }
    setEditError(null);
  }

  async function saveEdit() {
    if (!editKey) return;
    setEditSaving(true);
    setEditError(null);
    try {
      let permissionsPayload: Record<string, string[]> | undefined;
      if (editPermissions.trim()) {
        try {
          permissionsPayload = JSON.parse(editPermissions) as Record<
            string,
            string[]
          >;
        } catch {
          setEditError("Permissions must be valid JSON (e.g. {\"ingest\": [\"write\"]})");
          setEditSaving(false);
          return;
        }
      }
      type UpdatePayload = {
        keyId: string;
        enabled?: boolean;
        permissions?: Record<string, string[]>;
        rateLimitEnabled?: boolean;
        rateLimitTimeWindow?: number;
        rateLimitMax?: number;
      };
      const payload: UpdatePayload = {
        keyId: editKey.id,
        enabled: editEnabled,
        rateLimitEnabled: editRateLimitEnabled,
        rateLimitTimeWindow: editRateLimitEnabled ? editRateLimitWindow * 1000 : undefined,
        rateLimitMax: editRateLimitEnabled ? editRateLimitMax : undefined,
        ...(permissionsPayload !== undefined && {
          permissions: permissionsPayload,
        }),
      };
      const res = await authClient.apiKey.update(
        payload as Parameters<typeof authClient.apiKey.update>[0]
      );
      if (res.error) throw new Error(res.error.message ?? "Failed to update key");
      setEditKey(null);
      loadKeys();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update key");
    } finally {
      setEditSaving(false);
    }
  }

  async function createKey() {
    if (!organizationId || !project) return;
    setCreating(true);
    setCreateError(null);
    setNewKeyShown(null);
    const name = createName.trim() || `${project.name} (${envLabel})`;
    const { data, error: err } = await authClient.apiKey.create({
      name,
      metadata: { organizationId, env: currentEnvId },
    });
    setCreating(false);
    if (err) {
      setCreateError(err.message ?? "Failed to create API key");
      return;
    }
    const keyValue = (data as { key?: string })?.key;
    if (keyValue) {
      setNewKeyShown(
        typeof keyValue === "string" ? keyValue : String(keyValue)
      );
      setCreateDialogOpen(false);
      setCreateName("");
      setCreateError(null);
      loadKeys();
    } else {
      setCreateError("Key was created but not returned. Check your API key list.");
    }
  }

  async function deleteKey(keyId: string) {
    setNewKeyShown(null);
    const { error: err } = await authClient.apiKey.delete({ keyId });
    if (err) throw new Error(err.message ?? "Failed to delete API key");
    setKeyToDelete(null);
    setDeleteConfirmValue("");
    loadKeys();
  }

  async function confirmDelete() {
    if (!keyToDelete || deleteConfirmValue.trim() !== "delete") return;
    setDeleting(true);
    try {
      await deleteKey(keyToDelete.id);
    } finally {
      setDeleting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (isLoading || !project) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-6 flex-1 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage API keys for this environment. SDKs use these keys
          to send request logs to Tracelet. You can enable or disable keys, set
          rate limits, and permissions.
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-6 overflow-auto">
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        ) : (
          <Card className="shrink-0">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">API Keys</CardTitle>
              {!newKeyShown && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCreateError(null);
                    setCreateDialogOpen(true);
                  }}
                  disabled={creating}
                >
                  <Plus className="size-4 mr-1" />
                  {currentEnvKeys.length > 0
                    ? "Create another key"
                    : "Create API key"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {currentEnvKeys.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rate limit</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[70px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEnvKeys.map((row: ApiKeyMeta) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.name ?? "—"}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {row.start ?? row.prefix ?? "…"}
                          …
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              row.enabled !== false
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground"
                            }
                          >
                            {row.enabled !== false ? "Enabled" : "Disabled"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatRateLimit(
                            row.rateLimitEnabled,
                            row.rateLimitTimeWindow ?? null,
                            row.rateLimitMax ?? null
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(row.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label="Open menu"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(row)}
                              >
                                <Pencil className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setKeyToDelete(row)}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <Key className="size-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No API key for this environment. Create one so your SDK can
                    send logs.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateDialogOpen(true)}
                    disabled={creating}
                  >
                    <Plus className="size-4 mr-1" />
                    Create API key
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create key dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>
                Give this key a name to identify it later. The key value will
                only be shown once after creation.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder={`e.g. ${project?.name ?? "My project"} (${envLabel})`}
              disabled={creating}
            />
            {createError && (
              <p className="text-sm text-destructive" role="alert">
                {createError}
              </p>
            )}
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button onClick={() => createKey()} disabled={creating}>
                {creating ? "Creating…" : "Create key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit key dialog */}
        <Dialog open={!!editKey} onOpenChange={(open) => !open && setEditKey(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit API key</DialogTitle>
              <DialogDescription>
                Enable or disable this key, set rate limits, and permissions
                (JSON object, e.g. {`{"ingest": ["write"]}`}).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="edit-enabled">Enabled</Label>
                <Checkbox
                  id="edit-enabled"
                  checked={editEnabled}
                  onCheckedChange={(checked) =>
                    setEditEnabled(checked === true)
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="edit-ratelimit">Rate limit</Label>
                <Checkbox
                  id="edit-ratelimit"
                  checked={editRateLimitEnabled}
                  onCheckedChange={(checked) =>
                    setEditRateLimitEnabled(checked === true)
                  }
                />
              </div>
              {editRateLimitEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Window (seconds)</Label>
                    <select
                      value={editRateLimitWindow}
                      onChange={(e) =>
                        setEditRateLimitWindow(Number(e.target.value))
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {RATE_WINDOW_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Max requests</Label>
                    <Input
                      type="number"
                      min={1}
                      value={editRateLimitMax}
                      onChange={(e) =>
                        setEditRateLimitMax(Number(e.target.value) || 1)
                      }
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="edit-permissions">
                  Permissions (JSON, e.g. {`{"ingest": ["write"]}`})
                </Label>
                <textarea
                  id="edit-permissions"
                  value={editPermissions}
                  onChange={(e) => setEditPermissions(e.target.value)}
                  placeholder='{"ingest": ["write"]}'
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>
            {editError && (
              <p className="text-sm text-destructive" role="alert">
                {editError}
              </p>
            )}
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setEditKey(null)}
                disabled={editSaving}
              >
                Cancel
              </Button>
              <Button onClick={() => saveEdit()} disabled={editSaving}>
                {editSaving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <AlertDialog
          open={!!keyToDelete}
          onOpenChange={(open) => {
            if (!open) {
              setKeyToDelete(null);
              setDeleteConfirmValue("");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this API key?</AlertDialogTitle>
              <AlertDialogDescription>
                This key will stop working immediately. Any integrations using
                it will need to be updated with a new key. Type &quot;delete&quot;
                to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={deleteConfirmValue}
              onChange={(e) => setDeleteConfirmValue(e.target.value)}
              placeholder="type 'delete' to confirm"
              disabled={deleting}
              className="mt-2"
              autoComplete="off"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={deleting || deleteConfirmValue.trim() !== "delete"}
                onClick={confirmDelete}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Show key once after creation */}
        <Dialog
          open={!!newKeyShown}
          onOpenChange={(open) => !open && setNewKeyShown(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API key created</DialogTitle>
              <DialogDescription>
                Copy this key now. It won&apos;t be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-3">
              <code className="flex-1 break-all font-mono text-sm">
                {newKeyShown ?? ""}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  newKeyShown && copyToClipboard(newKeyShown)
                }
                className="shrink-0"
                aria-label="Copy key"
              >
                <Copy className="size-4 mr-1" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setNewKeyShown(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
